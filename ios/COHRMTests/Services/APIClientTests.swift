// APIClientTests.swift
// COHRM Cameroun - Tests for APIClient and APIError

import XCTest
@testable import COHRM

final class APIClientTests: XCTestCase {

    // MARK: - APIError Tests

    func testAPIError_invalidURL_hasDescription() {
        let error = APIError.invalidURL
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_invalidResponse_hasDescription() {
        let error = APIError.invalidResponse
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_unauthorized_hasDescription() {
        let error = APIError.unauthorized
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_forbidden_hasDescription() {
        let error = APIError.forbidden
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_notFound_hasDescription() {
        let error = APIError.notFound
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_validationError_hasDescription() {
        let error = APIError.validationError
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_serverError_hasDescription() {
        let error = APIError.serverError(500)
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_serverError_containsStatusCode() {
        let error = APIError.serverError(503)
        let description = error.errorDescription ?? ""
        XCTAssertTrue(description.contains("503"), "Server error description should include status code")
    }

    func testAPIError_httpError_hasDescription() {
        let error = APIError.httpError(429)
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_httpError_containsStatusCode() {
        let error = APIError.httpError(429)
        let description = error.errorDescription ?? ""
        XCTAssertTrue(description.contains("429"), "HTTP error description should include status code")
    }

    func testAPIError_encodingError_hasDescription() {
        let error = APIError.encodingError
        XCTAssertNotNil(error.errorDescription)
    }

    func testAPIError_decodingError_hasDescription() {
        let underlyingError = NSError(domain: "test", code: 1, userInfo: nil)
        let error = APIError.decodingError(underlyingError)
        XCTAssertNotNil(error.errorDescription)
    }

    // MARK: - APIError Equatable (pattern matching)

    func testAPIError_serverErrorCodes_areDifferent() {
        let error500 = APIError.serverError(500)
        let error502 = APIError.serverError(502)

        // They are different codes
        switch error500 {
        case .serverError(let code):
            XCTAssertEqual(code, 500)
        default:
            XCTFail("Expected serverError")
        }

        switch error502 {
        case .serverError(let code):
            XCTAssertEqual(code, 502)
        default:
            XCTFail("Expected serverError")
        }
    }

    // MARK: - APIResponse Decoding

    func testAPIResponse_successWithData_decodes() throws {
        let json = """
        {
            "success": true,
            "message": "Dashboard loaded",
            "data": {"total": 42}
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(APIResponse<DashboardData>.self, from: json)
        XCTAssertTrue(response.success)
        XCTAssertEqual(response.message, "Dashboard loaded")
        XCTAssertEqual(response.data?.total, 42)
    }

    func testAPIResponse_failureNoData_decodes() throws {
        let json = """
        {
            "success": false,
            "message": "Invalid token"
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(APIResponse<EmptyDTO>.self, from: json)
        XCTAssertFalse(response.success)
        XCTAssertEqual(response.message, "Invalid token")
        XCTAssertNil(response.data)
    }

    func testAPIResponse_withArrayData_decodes() throws {
        let json = """
        {
            "success": true,
            "data": [
                {"id": 1, "code": "OH-001"},
                {"id": 2, "code": "OH-002"}
            ]
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(APIResponse<[RumorSummary]>.self, from: json)
        XCTAssertTrue(response.success)
        XCTAssertEqual(response.data?.count, 2)
    }

    // MARK: - Endpoints Tests

    func testEndpoints_mobileReport_hasCorrectPath() {
        XCTAssertEqual(Endpoints.mobileReport, "/cohrm/mobile/report")
    }

    func testEndpoints_mobileSMS_hasCorrectPath() {
        XCTAssertEqual(Endpoints.mobileSMS, "/cohrm/mobile/sms")
    }

    func testEndpoints_mobileSync_hasCorrectPath() {
        XCTAssertEqual(Endpoints.mobileSync, "/cohrm/mobile/sync")
    }

    func testEndpoints_dashboard_hasCorrectPath() {
        XCTAssertEqual(Endpoints.dashboard, "/cohrm/mobile/dashboard")
    }

    func testEndpoints_rumors_hasCorrectPath() {
        XCTAssertEqual(Endpoints.rumors, "/cohrm/rumors")
    }

    func testEndpoints_scanRun_hasCorrectPath() {
        XCTAssertEqual(Endpoints.scanRun, "/cohrm/scan/run")
    }

    func testEndpoints_scanHistory_hasCorrectPath() {
        XCTAssertEqual(Endpoints.scanHistory, "/cohrm/scan-history")
    }

    func testEndpoints_notifications_hasCorrectPath() {
        XCTAssertEqual(Endpoints.notifications, "/cohrm/notifications/my")
    }

    func testEndpoints_smsCodes_hasCorrectPath() {
        XCTAssertEqual(Endpoints.smsCodes, "/cohrm/sms-codes")
    }

    func testEndpoints_regions_hasCorrectPath() {
        XCTAssertEqual(Endpoints.regions, "/cohrm/regions")
    }

    func testEndpoints_decodeSMS_hasCorrectPath() {
        XCTAssertEqual(Endpoints.decodeSMS, "/cohrm/decode-sms")
    }

    // MARK: - URL Construction

    func testEndpoints_rumorDetail_canAppendId() {
        let url = Endpoints.rumorDetail + "42"
        XCTAssertEqual(url, "/cohrm/rumors/42")
    }

    func testEndpoints_scanDetail_canAppendId() {
        let url = Endpoints.scanDetail + "10"
        XCTAssertEqual(url, "/cohrm/scan-history/10")
    }

    func testEndpoints_rumorNotes_canAppendIdAndSuffix() {
        let url = Endpoints.rumorNotes + "7/notes"
        XCTAssertEqual(url, "/cohrm/rumors/7/notes")
    }

    func testEndpoints_rumorValidate_canAppendIdAndSuffix() {
        let url = Endpoints.rumorValidate + "7/validate"
        XCTAssertEqual(url, "/cohrm/rumors/7/validate")
    }

    // MARK: - EmptyResponse

    func testEmptyResponse_decodesFromEmptyObject() throws {
        let json = "{}".data(using: .utf8)!
        let response = try JSONDecoder().decode(EmptyResponse.self, from: json)
        XCTAssertNotNil(response)
    }
}
