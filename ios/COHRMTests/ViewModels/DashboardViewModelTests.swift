// DashboardViewModelTests.swift
// COHRM Cameroun - Tests for DashboardViewModel

import XCTest
@testable import COHRM

@MainActor
final class DashboardViewModelTests: XCTestCase {

    var viewModel: DashboardViewModel!

    override func setUp() {
        super.setUp()
        viewModel = DashboardViewModel()
    }

    override func tearDown() {
        viewModel = nil
        super.tearDown()
    }

    // MARK: - Initial State

    func testInitialState_statsIsNil() {
        XCTAssertNil(viewModel.stats)
    }

    func testInitialState_isNotLoading() {
        XCTAssertFalse(viewModel.isLoading)
    }

    func testInitialState_noErrorMessage() {
        XCTAssertNil(viewModel.errorMessage)
    }

    func testInitialState_selectedRegionIsNil() {
        XCTAssertNil(viewModel.selectedRegion)
    }

    // MARK: - Computed Properties with nil stats

    func testTotalRumors_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.totalRumors, 0)
    }

    func testPendingCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.pendingCount, 0)
    }

    func testInvestigatingCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.investigatingCount, 0)
    }

    func testConfirmedCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.confirmedCount, 0)
    }

    func testClosedCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.closedCount, 0)
    }

    func testHighPriorityCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.highPriorityCount, 0)
    }

    func testTodayCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.todayCount, 0)
    }

    func testWeekCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.weekCount, 0)
    }

    func testMonthCount_whenStatsNil_returnsZero() {
        XCTAssertEqual(viewModel.monthCount, 0)
    }

    // MARK: - Computed Properties with populated stats

    func testComputedProperties_withFullStats() {
        viewModel.stats = DashboardData(
            total: 100,
            pending: 20,
            investigating: 15,
            confirmed: 10,
            falseAlarm: 5,
            closed: 50,
            highPriority: 8,
            critical: 3,
            todayCount: 5,
            weekCount: 25,
            monthCount: 80,
            byRegion: nil,
            byCategory: nil,
            byStatus: nil,
            bySource: nil,
            byPriority: nil,
            byRiskLevel: nil,
            trends: nil,
            recentRumors: nil
        )

        XCTAssertEqual(viewModel.totalRumors, 100)
        XCTAssertEqual(viewModel.pendingCount, 20)
        XCTAssertEqual(viewModel.investigatingCount, 15)
        XCTAssertEqual(viewModel.confirmedCount, 10)
        XCTAssertEqual(viewModel.closedCount, 50)
        XCTAssertEqual(viewModel.highPriorityCount, 8)
        XCTAssertEqual(viewModel.todayCount, 5)
        XCTAssertEqual(viewModel.weekCount, 25)
        XCTAssertEqual(viewModel.monthCount, 80)
    }

    func testComputedProperties_withPartialNilStats() {
        // DashboardData with all nil optional Int fields
        viewModel.stats = DashboardData(
            total: nil,
            pending: nil,
            investigating: nil,
            confirmed: nil,
            falseAlarm: nil,
            closed: nil,
            highPriority: nil,
            critical: nil,
            todayCount: nil,
            weekCount: nil,
            monthCount: nil,
            byRegion: nil,
            byCategory: nil,
            byStatus: nil,
            bySource: nil,
            byPriority: nil,
            byRiskLevel: nil,
            trends: nil,
            recentRumors: nil
        )

        // When stats exists but fields are nil, computed properties use ?? 0
        XCTAssertEqual(viewModel.totalRumors, 0)
        XCTAssertEqual(viewModel.pendingCount, 0)
        XCTAssertEqual(viewModel.investigatingCount, 0)
        XCTAssertEqual(viewModel.confirmedCount, 0)
        XCTAssertEqual(viewModel.closedCount, 0)
        XCTAssertEqual(viewModel.highPriorityCount, 0)
        XCTAssertEqual(viewModel.todayCount, 0)
        XCTAssertEqual(viewModel.weekCount, 0)
        XCTAssertEqual(viewModel.monthCount, 0)
    }

    // MARK: - Region Filter

    func testSelectedRegion_canBeSet() {
        viewModel.selectedRegion = "Centre"
        XCTAssertEqual(viewModel.selectedRegion, "Centre")
    }

    func testSelectedRegion_canBeCleared() {
        viewModel.selectedRegion = "Littoral"
        viewModel.selectedRegion = nil
        XCTAssertNil(viewModel.selectedRegion)
    }

    // MARK: - Loading State Mutation

    func testIsLoading_canBeToggled() {
        XCTAssertFalse(viewModel.isLoading)
        viewModel.isLoading = true
        XCTAssertTrue(viewModel.isLoading)
        viewModel.isLoading = false
        XCTAssertFalse(viewModel.isLoading)
    }

    // MARK: - Error Message

    func testErrorMessage_canBeSet() {
        viewModel.errorMessage = "Network error"
        XCTAssertEqual(viewModel.errorMessage, "Network error")
    }

    func testErrorMessage_canBeCleared() {
        viewModel.errorMessage = "Some error"
        viewModel.errorMessage = nil
        XCTAssertNil(viewModel.errorMessage)
    }
}
