// RumorsViewModelTests.swift
// COHRM Cameroun - Tests for HistoryViewModel (rumor/report list management)

import XCTest
@testable import COHRM

final class RumorsViewModelTests: XCTestCase {

    var viewModel: HistoryViewModel!

    override func setUp() {
        super.setUp()
        viewModel = HistoryViewModel()
    }

    override func tearDown() {
        viewModel = nil
        super.tearDown()
    }

    // MARK: - Initial State

    func testInitialState_errorMessageIsNil() {
        XCTAssertNil(viewModel.errorMessage)
    }

    func testInitialState_showErrorIsFalse() {
        XCTAssertFalse(viewModel.showError)
    }

    func testInitialState_syncingReportIdIsNil() {
        XCTAssertNil(viewModel.syncingReportId)
    }

    // MARK: - Error State

    func testErrorMessage_canBeSetAndCleared() {
        viewModel.errorMessage = "Test error"
        XCTAssertEqual(viewModel.errorMessage, "Test error")

        viewModel.errorMessage = nil
        XCTAssertNil(viewModel.errorMessage)
    }

    func testShowError_canBeToggled() {
        viewModel.showError = true
        XCTAssertTrue(viewModel.showError)

        viewModel.showError = false
        XCTAssertFalse(viewModel.showError)
    }

    // MARK: - Filtering: Empty Input

    func testFilteredReports_emptySearchText_returnsAll() {
        let reports = makeSampleReports(count: 5)
        let result = viewModel.filteredReports(from: reports, searchText: "", statusFilter: nil)
        XCTAssertEqual(result.count, 5)
    }

    func testFilteredReports_whitespaceOnlySearchText_returnsAll() {
        let reports = makeSampleReports(count: 3)
        let result = viewModel.filteredReports(from: reports, searchText: "   ", statusFilter: nil)
        XCTAssertEqual(result.count, 3)
    }

    func testFilteredReports_emptyReportsList_returnsEmpty() {
        let result = viewModel.filteredReports(from: [], searchText: "test", statusFilter: nil)
        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - Filtering: By Status

    func testFilteredReports_byPendingStatus_filtersCorrectly() {
        let reports = makeMixedStatusReports()
        let result = viewModel.filteredReports(from: reports, searchText: "", statusFilter: .pending)
        XCTAssertTrue(result.allSatisfy { $0.syncStatus == .pending })
    }

    func testFilteredReports_bySyncedStatus_filtersCorrectly() {
        let reports = makeMixedStatusReports()
        let result = viewModel.filteredReports(from: reports, searchText: "", statusFilter: .synced)
        XCTAssertTrue(result.allSatisfy { $0.syncStatus == .synced })
    }

    func testFilteredReports_byErrorStatus_filtersCorrectly() {
        let reports = makeMixedStatusReports()
        let result = viewModel.filteredReports(from: reports, searchText: "", statusFilter: .error)
        XCTAssertTrue(result.allSatisfy { $0.syncStatus == .error })
    }

    func testFilteredReports_byNonexistentStatus_returnsEmpty() {
        let reports = makeSampleReports(count: 3) // All pending by default
        let result = viewModel.filteredReports(from: reports, searchText: "", statusFilter: .synced)
        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - Filtering: By Search Text

    func testFilteredReports_byTitle_matchesCaseInsensitive() {
        let reports = makeSampleReports(count: 1)
        // Default title contains "Report"
        let result = viewModel.filteredReports(from: reports, searchText: "report", statusFilter: nil)
        XCTAssertEqual(result.count, 1)
    }

    func testFilteredReports_byRegion_matchesCaseInsensitive() {
        let reports = makeSampleReports(count: 1)
        // Default region is "Centre"
        let result = viewModel.filteredReports(from: reports, searchText: "centre", statusFilter: nil)
        XCTAssertEqual(result.count, 1)
    }

    func testFilteredReports_noMatch_returnsEmpty() {
        let reports = makeSampleReports(count: 3)
        let result = viewModel.filteredReports(from: reports, searchText: "zzzznonexistent", statusFilter: nil)
        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - Filtering: Combined Search + Status

    func testFilteredReports_combinedSearchAndStatus() {
        let reports = makeMixedStatusReports()
        let result = viewModel.filteredReports(from: reports, searchText: "Report", statusFilter: .pending)
        XCTAssertTrue(result.allSatisfy { $0.syncStatus == .pending })
        XCTAssertTrue(result.allSatisfy { $0.title.lowercased().contains("report") })
    }

    // MARK: - Status Counts

    func testStatusCounts_emptyReports_returnsEmptyDictionary() {
        let counts = viewModel.statusCounts(from: [])
        XCTAssertTrue(counts.isEmpty)
    }

    func testStatusCounts_mixedStatuses_countsCorrectly() {
        let reports = makeMixedStatusReports()
        let counts = viewModel.statusCounts(from: reports)

        // Verify that all returned counts add up to total
        let totalCounted = counts.values.reduce(0, +)
        XCTAssertEqual(totalCounted, reports.count)
    }

    func testStatusCounts_allSameStatus_returnsOneEntry() {
        let reports = makeSampleReports(count: 4) // All pending
        let counts = viewModel.statusCounts(from: reports)
        XCTAssertEqual(counts.count, 1)
        XCTAssertEqual(counts[.pending], 4)
    }

    // MARK: - Helpers

    /// Creates N ReportModel instances with default (pending) status
    private func makeSampleReports(count: Int) -> [ReportModel] {
        return (0..<count).map { i in
            let data = ReportData(
                category: "human_health",
                region: "Centre",
                department: "Mfoundi",
                title: "Report \(i)",
                description: "Test description \(i)",
                source: "mobile"
            )
            return ReportModel(from: data)
        }
    }

    /// Creates reports with a mix of sync statuses
    private func makeMixedStatusReports() -> [ReportModel] {
        var reports: [ReportModel] = []

        // 2 pending
        for i in 0..<2 {
            let data = ReportData(
                category: "human_health",
                region: "Centre",
                title: "Report Pending \(i)",
                description: "Pending report",
                source: "mobile"
            )
            reports.append(ReportModel(from: data))
        }

        // 2 synced
        for i in 0..<2 {
            let data = ReportData(
                category: "animal_health",
                region: "Littoral",
                title: "Report Synced \(i)",
                description: "Synced report",
                source: "mobile"
            )
            let model = ReportModel(from: data)
            model.syncStatus = .synced
            reports.append(model)
        }

        // 1 error
        let errorData = ReportData(
            category: "environmental",
            region: "Nord",
            title: "Report Error",
            description: "Error report",
            source: "mobile"
        )
        let errorModel = ReportModel(from: errorData)
        errorModel.syncStatus = .error
        errorModel.syncError = "Network timeout"
        reports.append(errorModel)

        return reports
    }
}
