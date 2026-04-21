// ModelDecodingTests.swift
// COHRM Cameroun - Tests for JSON decoding of all remote models

import XCTest
@testable import COHRM

final class ModelDecodingTests: XCTestCase {

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    // MARK: - DashboardData Decoding

    func testDashboardData_fullJSON_decodesCorrectly() throws {
        let json = """
        {
            "total": 150,
            "pending": 30,
            "investigating": 20,
            "confirmed": 15,
            "false_alarm": 10,
            "closed": 75,
            "high_priority": 12,
            "critical": 4,
            "today_count": 7,
            "week_count": 35,
            "month_count": 120,
            "byRegion": [
                {"name": "Centre", "count": 45, "key": "CE", "color": "#3498DB"},
                {"name": "Littoral", "count": 30, "key": "LT", "color": "#2ECC71"}
            ],
            "byCategory": [
                {"name": "Sant\\u00e9 Humaine", "count": 60}
            ],
            "byStatus": [],
            "bySource": [],
            "byPriority": [],
            "byRiskLevel": [],
            "trends": [
                {"date": "2026-04-15", "count": 8},
                {"date": "2026-04-16", "count": 12}
            ],
            "recentRumors": [
                {
                    "id": 1,
                    "code": "OH-2026-0001",
                    "title": "Suspected cholera outbreak",
                    "category": "human_health",
                    "status": "investigating",
                    "priority": "high",
                    "region": "Centre",
                    "risk_level": "high",
                    "source": "mobile",
                    "reporter_name": "Jean Dupont",
                    "created_at": "2026-04-15T10:30:00Z"
                }
            ]
        }
        """.data(using: .utf8)!

        let dashboard = try decoder.decode(DashboardData.self, from: json)

        XCTAssertEqual(dashboard.total, 150)
        XCTAssertEqual(dashboard.pending, 30)
        XCTAssertEqual(dashboard.investigating, 20)
        XCTAssertEqual(dashboard.confirmed, 15)
        XCTAssertEqual(dashboard.falseAlarm, 10)
        XCTAssertEqual(dashboard.closed, 75)
        XCTAssertEqual(dashboard.highPriority, 12)
        XCTAssertEqual(dashboard.critical, 4)
        XCTAssertEqual(dashboard.todayCount, 7)
        XCTAssertEqual(dashboard.weekCount, 35)
        XCTAssertEqual(dashboard.monthCount, 120)
        XCTAssertEqual(dashboard.byRegion?.count, 2)
        XCTAssertEqual(dashboard.byRegion?.first?.name, "Centre")
        XCTAssertEqual(dashboard.byRegion?.first?.count, 45)
        XCTAssertEqual(dashboard.byRegion?.first?.key, "CE")
        XCTAssertEqual(dashboard.byCategory?.count, 1)
        XCTAssertEqual(dashboard.trends?.count, 2)
        XCTAssertEqual(dashboard.recentRumors?.count, 1)
        XCTAssertEqual(dashboard.recentRumors?.first?.code, "OH-2026-0001")
    }

    func testDashboardData_minimalJSON_decodesWithNils() throws {
        let json = "{}".data(using: .utf8)!
        let dashboard = try decoder.decode(DashboardData.self, from: json)

        XCTAssertNil(dashboard.total)
        XCTAssertNil(dashboard.pending)
        XCTAssertNil(dashboard.investigating)
        XCTAssertNil(dashboard.confirmed)
        XCTAssertNil(dashboard.closed)
        XCTAssertNil(dashboard.highPriority)
        XCTAssertNil(dashboard.critical)
        XCTAssertNil(dashboard.todayCount)
        XCTAssertNil(dashboard.weekCount)
        XCTAssertNil(dashboard.monthCount)
        XCTAssertNil(dashboard.byRegion)
        XCTAssertNil(dashboard.trends)
        XCTAssertNil(dashboard.recentRumors)
    }

    // MARK: - ChartItem Decoding

    func testChartItem_fullJSON_decodesCorrectly() throws {
        let json = """
        {"name": "Centre", "count": 45, "key": "CE", "color": "#3498DB"}
        """.data(using: .utf8)!

        let item = try decoder.decode(ChartItem.self, from: json)
        XCTAssertEqual(item.name, "Centre")
        XCTAssertEqual(item.count, 45)
        XCTAssertEqual(item.key, "CE")
        XCTAssertEqual(item.color, "#3498DB")
    }

    func testChartItem_missingOptionalFields_usesDefaults() throws {
        let json = """
        {"name": "Test", "count": 10}
        """.data(using: .utf8)!

        let item = try decoder.decode(ChartItem.self, from: json)
        XCTAssertEqual(item.name, "Test")
        XCTAssertEqual(item.count, 10)
        XCTAssertNil(item.key)
        XCTAssertNil(item.color)
    }

    func testChartItem_emptyJSON_usesDefaultsFromCustomDecoder() throws {
        // The custom init(from:) in ChartItem provides defaults
        let json = "{}".data(using: .utf8)!
        let item = try decoder.decode(ChartItem.self, from: json)
        XCTAssertEqual(item.name, "")
        XCTAssertEqual(item.count, 0)
    }

    func testChartItem_identifiable_usesNameAndCount() {
        let item = ChartItem(name: "Test", count: 42, key: "TST")
        XCTAssertEqual(item.id, "Test-42")
    }

    // MARK: - TrendItem Decoding

    func testTrendItem_decodesCorrectly() throws {
        let json = """
        {"date": "2026-04-20", "count": 15}
        """.data(using: .utf8)!

        let trend = try decoder.decode(TrendItem.self, from: json)
        XCTAssertEqual(trend.date, "2026-04-20")
        XCTAssertEqual(trend.count, 15)
    }

    func testTrendItem_identifiable_usesDate() {
        let trend = TrendItem(date: "2026-04-20", count: 10)
        XCTAssertEqual(trend.id, "2026-04-20")
    }

    // MARK: - RumorSummary Decoding

    func testRumorSummary_fullJSON_decodesCorrectly() throws {
        let json = """
        {
            "id": 42,
            "code": "OH-2026-0042",
            "title": "Anthrax suspicion in cattle",
            "category": "animal_health",
            "status": "investigating",
            "priority": "critical",
            "region": "Adamaoua",
            "risk_level": "very_high",
            "source": "field",
            "reporter_name": "Dr. Mbarga",
            "created_at": "2026-04-18T14:20:00Z"
        }
        """.data(using: .utf8)!

        let rumor = try decoder.decode(RumorSummary.self, from: json)
        XCTAssertEqual(rumor.id, 42)
        XCTAssertEqual(rumor.code, "OH-2026-0042")
        XCTAssertEqual(rumor.title, "Anthrax suspicion in cattle")
        XCTAssertEqual(rumor.category, "animal_health")
        XCTAssertEqual(rumor.status, "investigating")
        XCTAssertEqual(rumor.priority, "critical")
        XCTAssertEqual(rumor.region, "Adamaoua")
        XCTAssertEqual(rumor.riskLevel, "very_high")
        XCTAssertEqual(rumor.source, "field")
        XCTAssertEqual(rumor.reporterName, "Dr. Mbarga")
        XCTAssertEqual(rumor.createdAt, "2026-04-18T14:20:00Z")
    }

    func testRumorSummary_minimalJSON_decodesWithNils() throws {
        let json = """
        {"id": 1}
        """.data(using: .utf8)!

        let rumor = try decoder.decode(RumorSummary.self, from: json)
        XCTAssertEqual(rumor.id, 1)
        XCTAssertNil(rumor.code)
        XCTAssertNil(rumor.title)
        XCTAssertNil(rumor.category)
        XCTAssertNil(rumor.status)
        XCTAssertNil(rumor.priority)
        XCTAssertNil(rumor.region)
        XCTAssertNil(rumor.riskLevel)
        XCTAssertNil(rumor.source)
        XCTAssertNil(rumor.reporterName)
        XCTAssertNil(rumor.createdAt)
    }

    // MARK: - RumorDetail Decoding

    func testRumorDetail_fullJSON_decodesCorrectly() throws {
        let json = """
        {
            "id": 7,
            "code": "OH-2026-0007",
            "title": "Flooding in Wouri",
            "description": "Severe flooding reported near the river banks",
            "category": "disaster",
            "status": "confirmed",
            "priority": "high",
            "region": "Littoral",
            "department": "Wouri",
            "location": "Bonaberi",
            "latitude": 4.0511,
            "longitude": 9.6846,
            "species": null,
            "symptoms": "flooding,displacement",
            "affected_count": 200,
            "deaths_count": 3,
            "risk_level": "very_high",
            "risk_description": "Immediate danger to population",
            "source": "field",
            "reporter_name": "Amina Njoya",
            "reporter_phone": "+237691234567",
            "created_at": "2026-04-10T08:00:00Z",
            "updated_at": "2026-04-12T16:45:00Z",
            "validations": [
                {
                    "action_type": "escalated",
                    "status": "confirmed",
                    "level": 3,
                    "notes": "Confirmed by field visit",
                    "actor_name": "Dr. Nkeng",
                    "created_at": "2026-04-11T09:30:00Z"
                }
            ],
            "notes": [
                {
                    "id": 1,
                    "content": "Field team dispatched",
                    "is_private": false,
                    "author_name": "Admin",
                    "created_at": "2026-04-10T10:00:00Z"
                }
            ],
            "photos": [
                {
                    "id": 10,
                    "file_path": "/uploads/cohrm/photo_10.jpg",
                    "caption": "Flooded area"
                }
            ]
        }
        """.data(using: .utf8)!

        let detail = try decoder.decode(RumorDetail.self, from: json)
        XCTAssertEqual(detail.id, 7)
        XCTAssertEqual(detail.code, "OH-2026-0007")
        XCTAssertEqual(detail.title, "Flooding in Wouri")
        XCTAssertEqual(detail.category, "disaster")
        XCTAssertEqual(detail.status, "confirmed")
        XCTAssertEqual(detail.region, "Littoral")
        XCTAssertEqual(detail.department, "Wouri")
        XCTAssertEqual(detail.location, "Bonaberi")
        XCTAssertEqual(detail.latitude, 4.0511, accuracy: 0.0001)
        XCTAssertEqual(detail.longitude, 9.6846, accuracy: 0.0001)
        XCTAssertNil(detail.species)
        XCTAssertEqual(detail.symptoms, "flooding,displacement")
        XCTAssertEqual(detail.affectedCount, 200)
        XCTAssertEqual(detail.deathsCount, 3)
        XCTAssertEqual(detail.riskLevel, "very_high")
        XCTAssertEqual(detail.riskDescription, "Immediate danger to population")
        XCTAssertEqual(detail.reporterName, "Amina Njoya")
        XCTAssertEqual(detail.reporterPhone, "+237691234567")
        XCTAssertEqual(detail.validations?.count, 1)
        XCTAssertEqual(detail.validations?.first?.actorName, "Dr. Nkeng")
        XCTAssertEqual(detail.validations?.first?.level, 3)
        XCTAssertEqual(detail.notes?.count, 1)
        XCTAssertEqual(detail.notes?.first?.content, "Field team dispatched")
        XCTAssertEqual(detail.notes?.first?.isPrivate, false)
        XCTAssertEqual(detail.photos?.count, 1)
        XCTAssertEqual(detail.photos?.first?.caption, "Flooded area")
    }

    func testRumorDetail_minimalJSON_decodesWithNils() throws {
        let json = """
        {"id": 99}
        """.data(using: .utf8)!

        let detail = try decoder.decode(RumorDetail.self, from: json)
        XCTAssertEqual(detail.id, 99)
        XCTAssertNil(detail.code)
        XCTAssertNil(detail.title)
        XCTAssertNil(detail.description)
        XCTAssertNil(detail.latitude)
        XCTAssertNil(detail.longitude)
        XCTAssertNil(detail.affectedCount)
        XCTAssertNil(detail.deathsCount)
        XCTAssertNil(detail.validations)
        XCTAssertNil(detail.notes)
        XCTAssertNil(detail.photos)
    }

    // MARK: - ValidationItem Decoding

    func testValidationItem_decodesCorrectly() throws {
        let json = """
        {
            "action_type": "approved",
            "status": "confirmed",
            "level": 2,
            "notes": "Approved after verification",
            "actor_name": "Dr. Tabi",
            "created_at": "2026-04-15T11:00:00Z"
        }
        """.data(using: .utf8)!

        let validation = try decoder.decode(ValidationItem.self, from: json)
        XCTAssertEqual(validation.actionType, "approved")
        XCTAssertEqual(validation.status, "confirmed")
        XCTAssertEqual(validation.level, 2)
        XCTAssertEqual(validation.notes, "Approved after verification")
        XCTAssertEqual(validation.actorName, "Dr. Tabi")
    }

    func testValidationItem_identifiable_usesActorNameAndDate() {
        let json = """
        {
            "action_type": "approved",
            "actor_name": "Dr. Tabi",
            "created_at": "2026-04-15T11:00:00Z"
        }
        """.data(using: .utf8)!
        let item = try! decoder.decode(ValidationItem.self, from: json)
        XCTAssertEqual(item.id, "Dr. Tabi-2026-04-15T11:00:00Z")
    }

    // MARK: - NoteItem Decoding

    func testNoteItem_decodesCorrectly() throws {
        let json = """
        {
            "id": 5,
            "content": "Investigation report attached",
            "is_private": true,
            "author_name": "Admin",
            "created_at": "2026-04-16T09:00:00Z"
        }
        """.data(using: .utf8)!

        let note = try decoder.decode(NoteItem.self, from: json)
        XCTAssertEqual(note.id, 5)
        XCTAssertEqual(note.content, "Investigation report attached")
        XCTAssertEqual(note.isPrivate, true)
        XCTAssertEqual(note.authorName, "Admin")
    }

    // MARK: - PhotoItem Decoding

    func testPhotoItem_decodesCorrectly() throws {
        let json = """
        {
            "id": 3,
            "file_path": "/uploads/cohrm/photo_3.jpg",
            "caption": "Evidence photo"
        }
        """.data(using: .utf8)!

        let photo = try decoder.decode(PhotoItem.self, from: json)
        XCTAssertEqual(photo.id, 3)
        XCTAssertEqual(photo.filePath, "/uploads/cohrm/photo_3.jpg")
        XCTAssertEqual(photo.caption, "Evidence photo")
    }

    func testPhotoItem_missingOptionals_decodesWithNils() throws {
        let json = """
        {"id": 1}
        """.data(using: .utf8)!

        let photo = try decoder.decode(PhotoItem.self, from: json)
        XCTAssertEqual(photo.id, 1)
        XCTAssertNil(photo.filePath)
        XCTAssertNil(photo.caption)
    }

    // MARK: - Scan Models Decoding

    func testScanRunDTO_decodesCorrectly() throws {
        let json = """
        {"scan_id": 42}
        """.data(using: .utf8)!

        let scanRun = try decoder.decode(ScanRunDTO.self, from: json)
        XCTAssertEqual(scanRun.scanId, 42)
    }

    func testScanRunDTO_missingField_decodesAsNil() throws {
        let json = "{}".data(using: .utf8)!
        let scanRun = try decoder.decode(ScanRunDTO.self, from: json)
        XCTAssertNil(scanRun.scanId)
    }

    func testScanItemDTO_decodesCorrectly() throws {
        let json = """
        {
            "id": 10,
            "source": "social_media",
            "keywords": "cholera,outbreak",
            "status": "completed",
            "results_count": 25,
            "created_at": "2026-04-19T12:00:00Z"
        }
        """.data(using: .utf8)!

        let item = try decoder.decode(ScanItemDTO.self, from: json)
        XCTAssertEqual(item.id, 10)
        XCTAssertEqual(item.source, "social_media")
        XCTAssertEqual(item.keywords, "cholera,outbreak")
        XCTAssertEqual(item.status, "completed")
        XCTAssertEqual(item.resultsCount, 25)
    }

    func testScanDetailDTO_withResults_decodesCorrectly() throws {
        let json = """
        {
            "id": 5,
            "source": "web",
            "keywords": "ebola,cameroon",
            "status": "completed",
            "results": [
                {
                    "id": 1,
                    "title": "Ebola alert in Central Africa",
                    "url": "https://example.com/article",
                    "snippet": "Reports of suspected...",
                    "source": "news",
                    "matched_keywords": "ebola",
                    "relevance_score": 0.85,
                    "is_rumor": true,
                    "rumor_id": 42
                }
            ],
            "created_at": "2026-04-18T08:00:00Z"
        }
        """.data(using: .utf8)!

        let detail = try decoder.decode(ScanDetailDTO.self, from: json)
        XCTAssertEqual(detail.id, 5)
        XCTAssertEqual(detail.source, "web")
        XCTAssertEqual(detail.results?.count, 1)
        XCTAssertEqual(detail.results?.first?.title, "Ebola alert in Central Africa")
        XCTAssertEqual(detail.results?.first?.relevanceScore, 0.85, accuracy: 0.01)
        XCTAssertEqual(detail.results?.first?.isRumor, true)
        XCTAssertEqual(detail.results?.first?.rumorId, 42)
    }

    func testScanResultDTO_minimalJSON_decodesWithNils() throws {
        let json = """
        {"id": 1}
        """.data(using: .utf8)!

        let result = try decoder.decode(ScanResultDTO.self, from: json)
        XCTAssertEqual(result.id, 1)
        XCTAssertNil(result.title)
        XCTAssertNil(result.url)
        XCTAssertNil(result.snippet)
        XCTAssertNil(result.relevanceScore)
        XCTAssertNil(result.isRumor)
        XCTAssertNil(result.rumorId)
    }

    // MARK: - NotificationDTO Decoding

    func testNotificationDTO_fullJSON_decodesCorrectly() throws {
        let json = """
        {
            "id": 15,
            "notification_type": "status_change",
            "channel": "email",
            "recipient_email": "user@example.com",
            "subject": "Rumor OH-2026-0007 updated",
            "status": "sent",
            "rumor_id": 7,
            "rumor_code": "OH-2026-0007",
            "rumor_title": "Flooding in Wouri",
            "created_at": "2026-04-20T10:00:00Z"
        }
        """.data(using: .utf8)!

        let notification = try decoder.decode(NotificationDTO.self, from: json)
        XCTAssertEqual(notification.id, 15)
        XCTAssertEqual(notification.notificationType, "status_change")
        XCTAssertEqual(notification.channel, "email")
        XCTAssertEqual(notification.recipientEmail, "user@example.com")
        XCTAssertEqual(notification.subject, "Rumor OH-2026-0007 updated")
        XCTAssertEqual(notification.status, "sent")
        XCTAssertEqual(notification.rumorId, 7)
        XCTAssertEqual(notification.rumorCode, "OH-2026-0007")
        XCTAssertEqual(notification.rumorTitle, "Flooding in Wouri")
    }

    func testNotificationDTO_minimalJSON_decodesWithNils() throws {
        let json = """
        {"id": 1}
        """.data(using: .utf8)!

        let notification = try decoder.decode(NotificationDTO.self, from: json)
        XCTAssertEqual(notification.id, 1)
        XCTAssertNil(notification.notificationType)
        XCTAssertNil(notification.channel)
        XCTAssertNil(notification.recipientEmail)
        XCTAssertNil(notification.subject)
        XCTAssertNil(notification.status)
        XCTAssertNil(notification.rumorId)
        XCTAssertNil(notification.rumorCode)
        XCTAssertNil(notification.rumorTitle)
        XCTAssertNil(notification.createdAt)
    }

    // MARK: - APIResponse Wrapper Decoding

    func testAPIResponse_withDashboardData_decodesCorrectly() throws {
        let json = """
        {
            "success": true,
            "message": "OK",
            "data": {
                "total": 50,
                "pending": 10
            }
        }
        """.data(using: .utf8)!

        let response = try decoder.decode(APIResponse<DashboardData>.self, from: json)
        XCTAssertTrue(response.success)
        XCTAssertEqual(response.message, "OK")
        XCTAssertNotNil(response.data)
        XCTAssertEqual(response.data?.total, 50)
    }

    func testAPIResponse_failure_decodesCorrectly() throws {
        let json = """
        {
            "success": false,
            "message": "Unauthorized",
            "data": null
        }
        """.data(using: .utf8)!

        let response = try decoder.decode(APIResponse<DashboardData>.self, from: json)
        XCTAssertFalse(response.success)
        XCTAssertEqual(response.message, "Unauthorized")
        XCTAssertNil(response.data)
    }

    // MARK: - ReportCreatedDTO Decoding

    func testReportCreatedDTO_decodesCorrectly() throws {
        let json = """
        {"id": 99, "code": "OH-2026-0099"}
        """.data(using: .utf8)!

        let dto = try decoder.decode(ReportCreatedDTO.self, from: json)
        XCTAssertEqual(dto.id, 99)
        XCTAssertEqual(dto.code, "OH-2026-0099")
    }

    func testReportCreatedDTO_nullFields_decodesWithNils() throws {
        let json = """
        {"id": null, "code": null}
        """.data(using: .utf8)!

        let dto = try decoder.decode(ReportCreatedDTO.self, from: json)
        XCTAssertNil(dto.id)
        XCTAssertNil(dto.code)
    }

    // MARK: - SMSDecodedDTO Decoding

    func testSMSDecodedDTO_decodesCorrectly() throws {
        let json = """
        {
            "category": "human_health",
            "species": "HUM",
            "symptoms": ["FI", "VO", "DI"],
            "region": "Centre",
            "description": "Suspected cholera"
        }
        """.data(using: .utf8)!

        let dto = try decoder.decode(SMSDecodedDTO.self, from: json)
        XCTAssertEqual(dto.category, "human_health")
        XCTAssertEqual(dto.species, "HUM")
        XCTAssertEqual(dto.symptoms?.count, 3)
        XCTAssertEqual(dto.region, "Centre")
        XCTAssertEqual(dto.description, "Suspected cholera")
    }

    // MARK: - SyncDataDTO Decoding

    func testSyncDataDTO_decodesCorrectly() throws {
        let json = """
        {
            "regions": [
                {"code": "CE", "name": "Centre", "departments": ["Mfoundi", "Lekie"]},
                {"code": "LT", "name": "Littoral"}
            ],
            "smsCodes": [
                {"id": 1, "code": "FI", "label_fr": "Fievre", "label_en": "Fever", "category": "symptom"}
            ],
            "lastUpdate": "2026-04-20T00:00:00Z"
        }
        """.data(using: .utf8)!

        let dto = try decoder.decode(SyncDataDTO.self, from: json)
        XCTAssertEqual(dto.regions?.count, 2)
        XCTAssertEqual(dto.regions?.first?.code, "CE")
        XCTAssertEqual(dto.regions?.first?.name, "Centre")
        XCTAssertEqual(dto.regions?.first?.departments?.count, 2)
        XCTAssertEqual(dto.smsCodes?.count, 1)
        XCTAssertEqual(dto.smsCodes?.first?.code, "FI")
        XCTAssertEqual(dto.smsCodes?.first?.labelFr, "Fievre")
    }

    // MARK: - SMSCodeDTO Decoding

    func testSMSCodeDTO_decodesCorrectly() throws {
        let json = """
        {
            "id": 5,
            "code": "VO",
            "label_fr": "Vomissement",
            "label_en": "Vomiting",
            "category": "symptom"
        }
        """.data(using: .utf8)!

        let dto = try decoder.decode(SMSCodeDTO.self, from: json)
        XCTAssertEqual(dto.id, 5)
        XCTAssertEqual(dto.code, "VO")
        XCTAssertEqual(dto.labelFr, "Vomissement")
        XCTAssertEqual(dto.labelEn, "Vomiting")
        XCTAssertEqual(dto.category, "symptom")
    }

    // MARK: - Edge Cases

    func testDashboardData_withExtraFields_decodesWithoutError() throws {
        let json = """
        {
            "total": 10,
            "unknownField": "should be ignored",
            "another_extra": 999
        }
        """.data(using: .utf8)!

        // Codable should ignore unknown keys by default
        let dashboard = try decoder.decode(DashboardData.self, from: json)
        XCTAssertEqual(dashboard.total, 10)
    }

    func testRumorSummary_withUnicodeCharacters_decodesCorrectly() throws {
        let json = """
        {
            "id": 1,
            "title": "Epid\\u00e9mie de chol\\u00e9ra \\u00e0 Yaound\\u00e9",
            "region": "Extr\\u00eame-Nord",
            "reporter_name": "Fran\\u00e7ois N'Gu\\u00e9ma"
        }
        """.data(using: .utf8)!

        let rumor = try decoder.decode(RumorSummary.self, from: json)
        XCTAssertEqual(rumor.title, "Epidemie de cholera a Yaounde")
        XCTAssertEqual(rumor.region, "Extreme-Nord")
        XCTAssertEqual(rumor.reporterName, "Francois N'Guema")
    }

    func testEmptyDTO_decodesFromEmptyObject() throws {
        let json = "{}".data(using: .utf8)!
        let dto = try decoder.decode(EmptyDTO.self, from: json)
        XCTAssertNotNil(dto)
    }
}
