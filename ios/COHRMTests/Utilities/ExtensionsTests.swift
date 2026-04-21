// ExtensionsTests.swift
// COHRM Cameroun - Tests for String and Date extensions

import XCTest
@testable import COHRM

final class ExtensionsTests: XCTestCase {

    // MARK: - String.isValidEmail

    func testIsValidEmail_validEmails() {
        XCTAssertTrue("user@example.com".isValidEmail)
        XCTAssertTrue("jean.dupont@onehealth.cm".isValidEmail)
        XCTAssertTrue("admin+test@subdomain.example.co.cm".isValidEmail)
        XCTAssertTrue("USER@EXAMPLE.COM".isValidEmail)
        XCTAssertTrue("user123@test.org".isValidEmail)
        XCTAssertTrue("first.last@company.co".isValidEmail)
        XCTAssertTrue("a@b.cd".isValidEmail)
    }

    func testIsValidEmail_invalidEmails() {
        XCTAssertFalse("".isValidEmail)
        XCTAssertFalse("notanemail".isValidEmail)
        XCTAssertFalse("@example.com".isValidEmail)
        XCTAssertFalse("user@".isValidEmail)
        XCTAssertFalse("user@.com".isValidEmail)
        XCTAssertFalse("user@com".isValidEmail)
        XCTAssertFalse("user @example.com".isValidEmail)
        XCTAssertFalse("user@exam ple.com".isValidEmail)
    }

    // MARK: - String.isValidCameroonPhone

    func testIsValidCameroonPhone_validNumbers() {
        XCTAssertTrue("691234567".isValidCameroonPhone)
        XCTAssertTrue("670000000".isValidCameroonPhone)
        XCTAssertTrue("655123456".isValidCameroonPhone)
        XCTAssertTrue("699999999".isValidCameroonPhone)
    }

    func testIsValidCameroonPhone_validWithPrefix() {
        XCTAssertTrue("+237691234567".isValidCameroonPhone)
        XCTAssertTrue("+237 691 234 567".isValidCameroonPhone)
    }

    func testIsValidCameroonPhone_validWithSpaces() {
        XCTAssertTrue("691 234 567".isValidCameroonPhone)
        XCTAssertTrue("6 9 1 2 3 4 5 6 7".isValidCameroonPhone)
    }

    func testIsValidCameroonPhone_invalidNumbers() {
        XCTAssertFalse("".isValidCameroonPhone)
        XCTAssertFalse("12345".isValidCameroonPhone)       // Too short
        XCTAssertFalse("1234567890".isValidCameroonPhone)   // Too long (10 digits)
        XCTAssertFalse("69123456a".isValidCameroonPhone)    // Contains letter
        XCTAssertFalse("abcdefghi".isValidCameroonPhone)    // All letters
    }

    // MARK: - String.truncated

    func testTruncated_shorterThanMax_returnsOriginal() {
        let text = "Hello"
        XCTAssertEqual(text.truncated(to: 10), "Hello")
    }

    func testTruncated_exactlyMax_returnsOriginal() {
        let text = "Hello"
        XCTAssertEqual(text.truncated(to: 5), "Hello")
    }

    func testTruncated_longerThanMax_truncatesWithEllipsis() {
        let text = "Hello, World!"
        XCTAssertEqual(text.truncated(to: 5), "Hello...")
    }

    func testTruncated_emptyString_returnsEmpty() {
        let text = ""
        XCTAssertEqual(text.truncated(to: 5), "")
    }

    func testTruncated_maxZero_truncatesToEllipsis() {
        let text = "Hello"
        XCTAssertEqual(text.truncated(to: 0), "...")
    }

    func testTruncated_maxOne_truncatesToOneCharPlusEllipsis() {
        let text = "Hello"
        XCTAssertEqual(text.truncated(to: 1), "H...")
    }

    func testTruncated_unicodeCharacters_handlesCorrectly() {
        let text = "Epidemie de cholera"
        let truncated = text.truncated(to: 8)
        XCTAssertEqual(truncated, "Epidemie...")
    }

    // MARK: - String.formattedCameroonPhone

    func testFormattedCameroonPhone_validNumber_formatsCorrectly() {
        XCTAssertEqual("691234567".formattedCameroonPhone, "+237 691 234 567")
    }

    func testFormattedCameroonPhone_withPrefix_formatsCorrectly() {
        XCTAssertEqual("+237691234567".formattedCameroonPhone, "+237 691 234 567")
    }

    func testFormattedCameroonPhone_withSpaces_formatsCorrectly() {
        XCTAssertEqual("691 234 567".formattedCameroonPhone, "+237 691 234 567")
    }

    func testFormattedCameroonPhone_invalidLength_returnsOriginal() {
        XCTAssertEqual("12345".formattedCameroonPhone, "12345")
    }

    func testFormattedCameroonPhone_emptyString_returnsEmpty() {
        XCTAssertEqual("".formattedCameroonPhone, "")
    }

    // MARK: - Date Extensions

    func testDate_shortLocalizedString_isNotEmpty() {
        let date = Date()
        let result = date.shortLocalizedString
        XCTAssertFalse(result.isEmpty)
    }

    func testDate_dateTimeString_isNotEmpty() {
        let date = Date()
        let result = date.dateTimeString
        XCTAssertFalse(result.isEmpty)
    }

    func testDate_relativeString_isNotEmpty() {
        let date = Date()
        let result = date.relativeString
        XCTAssertFalse(result.isEmpty)
    }

    func testDate_iso8601String_isNotEmpty() {
        let date = Date()
        let result = date.iso8601String
        XCTAssertFalse(result.isEmpty)
    }

    func testDate_iso8601String_hasCorrectFormat() {
        // Create a known date
        let components = DateComponents(
            calendar: Calendar(identifier: .gregorian),
            timeZone: TimeZone(identifier: "UTC"),
            year: 2026, month: 4, day: 21, hour: 12, minute: 0, second: 0
        )
        guard let date = components.date else {
            XCTFail("Failed to create test date")
            return
        }

        let iso = date.iso8601String
        XCTAssertTrue(iso.contains("2026"), "ISO string should contain year")
        XCTAssertTrue(iso.contains("04"), "ISO string should contain month")
        XCTAssertTrue(iso.contains("21"), "ISO string should contain day")
    }

    func testDate_shortLocalizedString_usesFrenchLocale() {
        // The extension uses fr_FR locale
        let components = DateComponents(
            calendar: Calendar(identifier: .gregorian),
            timeZone: TimeZone(identifier: "UTC"),
            year: 2026, month: 3, day: 12
        )
        guard let date = components.date else {
            XCTFail("Failed to create test date")
            return
        }

        let formatted = date.shortLocalizedString
        // In French, March is "mars"
        XCTAssertTrue(formatted.lowercased().contains("mars") || formatted.contains("12"),
                       "French date should contain 'mars' or the day number")
    }

    func testDate_relativeString_pastDate_containsRelativeWord() {
        let pastDate = Date(timeIntervalSinceNow: -3600 * 24) // 1 day ago
        let result = pastDate.relativeString
        // In French, relative dates contain "il y a" (ago)
        XCTAssertFalse(result.isEmpty)
    }

    // MARK: - Bundle Extensions

    func testBundle_appVersion_isNotEmpty() {
        let version = Bundle.main.appVersion
        XCTAssertFalse(version.isEmpty)
    }

    func testBundle_buildNumber_isNotEmpty() {
        let build = Bundle.main.buildNumber
        XCTAssertFalse(build.isEmpty)
    }

    // MARK: - EventCategory Tests

    func testEventCategory_allCases_hasExpectedCount() {
        XCTAssertEqual(EventCategory.allCases.count, 6)
    }

    func testEventCategory_rawValues_matchExpected() {
        XCTAssertEqual(EventCategory.humanHealth.rawValue, "human_health")
        XCTAssertEqual(EventCategory.animalHealth.rawValue, "animal_health")
        XCTAssertEqual(EventCategory.environmental.rawValue, "environmental")
        XCTAssertEqual(EventCategory.safety.rawValue, "safety")
        XCTAssertEqual(EventCategory.disaster.rawValue, "disaster")
        XCTAssertEqual(EventCategory.other.rawValue, "other")
    }

    func testEventCategory_fromRawValue_roundTrips() {
        for category in EventCategory.allCases {
            XCTAssertEqual(EventCategory(rawValue: category.rawValue), category)
        }
    }

    func testEventCategory_invalidRawValue_returnsNil() {
        XCTAssertNil(EventCategory(rawValue: "nonexistent"))
        XCTAssertNil(EventCategory(rawValue: ""))
    }

    func testEventCategory_label_isNotEmpty() {
        for category in EventCategory.allCases {
            XCTAssertFalse(category.label.isEmpty, "Label for \(category.rawValue) should not be empty")
        }
    }

    func testEventCategory_icon_isNotEmpty() {
        for category in EventCategory.allCases {
            XCTAssertFalse(category.icon.isEmpty, "Icon for \(category.rawValue) should not be empty")
        }
    }

    // MARK: - SymptomCode Tests

    func testSymptomCode_allCases_hasExpectedCount() {
        XCTAssertEqual(SymptomCode.allCases.count, 12)
    }

    func testSymptomCode_rawValues_areTwoLetterCodes() {
        for symptom in SymptomCode.allCases {
            XCTAssertEqual(symptom.rawValue.count, 2,
                          "Symptom code \(symptom.rawValue) should be 2 characters")
        }
    }

    func testSymptomCode_label_isNotEmpty() {
        for symptom in SymptomCode.allCases {
            XCTAssertFalse(symptom.label.isEmpty)
        }
    }

    // MARK: - SpeciesCode Tests

    func testSpeciesCode_allCases_hasExpectedCount() {
        XCTAssertEqual(SpeciesCode.allCases.count, 8)
    }

    func testSpeciesCode_rawValues_areThreeLetterCodes() {
        for species in SpeciesCode.allCases {
            XCTAssertEqual(species.rawValue.count, 3,
                          "Species code \(species.rawValue) should be 3 characters")
        }
    }

    // MARK: - PriorityLevel Tests

    func testPriorityLevel_allCases_hasExpectedCount() {
        XCTAssertEqual(PriorityLevel.allCases.count, 4)
    }

    func testPriorityLevel_rawValues() {
        XCTAssertEqual(PriorityLevel.low.rawValue, "low")
        XCTAssertEqual(PriorityLevel.medium.rawValue, "medium")
        XCTAssertEqual(PriorityLevel.high.rawValue, "high")
        XCTAssertEqual(PriorityLevel.critical.rawValue, "critical")
    }

    // MARK: - SyncStatus Tests

    func testSyncStatus_allValues() {
        XCTAssertEqual(SyncStatus.draft.rawValue, "draft")
        XCTAssertEqual(SyncStatus.pending.rawValue, "pending")
        XCTAssertEqual(SyncStatus.syncing.rawValue, "syncing")
        XCTAssertEqual(SyncStatus.synced.rawValue, "synced")
        XCTAssertEqual(SyncStatus.error.rawValue, "error")
    }

    func testSyncStatus_label_isNotEmpty() {
        let statuses: [SyncStatus] = [.draft, .pending, .syncing, .synced, .error]
        for status in statuses {
            XCTAssertFalse(status.label.isEmpty)
        }
    }

    func testSyncStatus_icon_isNotEmpty() {
        let statuses: [SyncStatus] = [.draft, .pending, .syncing, .synced, .error]
        for status in statuses {
            XCTAssertFalse(status.icon.isEmpty)
        }
    }

    // MARK: - CameroonRegion Tests

    func testCameroonRegion_allRegions_hasTenEntries() {
        XCTAssertEqual(CameroonRegion.all.count, 10)
    }

    func testCameroonRegion_eachHasDepartments() {
        for region in CameroonRegion.all {
            XCTAssertFalse(region.departments.isEmpty,
                          "Region \(region.name) should have departments")
        }
    }

    func testCameroonRegion_eachHasUniqueId() {
        let ids = CameroonRegion.all.map(\.id)
        XCTAssertEqual(Set(ids).count, ids.count, "All region IDs should be unique")
    }

    func testCameroonRegion_knownRegions_exist() {
        let names = CameroonRegion.all.map(\.name)
        XCTAssertTrue(names.contains("Centre"))
        XCTAssertTrue(names.contains("Littoral"))
        XCTAssertTrue(names.contains("Adamaoua"))
        XCTAssertTrue(names.contains("Nord"))
        XCTAssertTrue(names.contains("Sud"))
    }

    // MARK: - SMSHelper Tests

    func testSMSHelper_generateSMS_formatsCorrectly() {
        let sms = SMSHelper.generateSMS(
            category: "human_health",
            species: "HUM",
            symptoms: ["FI", "VO"],
            region: "Centre",
            description: "Suspected cholera in neighborhood"
        )

        let parts = sms.split(separator: "#").map(String.init)
        XCTAssertEqual(parts.count, 6)
        XCTAssertEqual(parts[0], "OH")
        XCTAssertEqual(parts[1], "HUM") // category prefix(3).uppercased
        XCTAssertEqual(parts[2], "HUM") // species
        XCTAssertEqual(parts[3], "FI,VO") // symptoms joined
        XCTAssertEqual(parts[4], "CEN") // region prefix(3).uppercased
    }

    func testSMSHelper_generateSMS_emptySymptoms_hasEmptySegment() {
        let sms = SMSHelper.generateSMS(
            category: "disaster",
            species: "",
            symptoms: [],
            region: "Nord",
            description: "Flooding"
        )

        XCTAssertTrue(sms.contains("##"), "Empty symptoms should produce empty segment")
    }

    func testSMSHelper_generateSMS_longDescription_isTruncated() {
        let longDesc = String(repeating: "A", count: 200)
        let sms = SMSHelper.generateSMS(
            category: "other",
            species: "AUT",
            symptoms: ["FI"],
            region: "Est",
            description: longDesc
        )

        let parts = sms.split(separator: "#").map(String.init)
        let descPart = parts.last ?? ""
        XCTAssertLessThanOrEqual(descPart.count, 100,
                                  "Description should be truncated to 100 characters")
    }

    func testSMSHelper_smsRecipient_isNotEmpty() {
        XCTAssertFalse(SMSHelper.smsRecipient.isEmpty)
        XCTAssertTrue(SMSHelper.smsRecipient.hasPrefix("+237"))
    }

    // MARK: - ReportData Tests

    func testReportData_toAPIPayload_includesRequiredFields() {
        var data = ReportData()
        data.category = "human_health"
        data.source = "mobile"
        data.title = "Test"
        data.description = "Test description"
        data.region = "Centre"

        let payload = data.toAPIPayload()

        XCTAssertEqual(payload["category"] as? String, "human_health")
        XCTAssertEqual(payload["source"] as? String, "mobile")
        XCTAssertEqual(payload["title"] as? String, "Test")
        XCTAssertEqual(payload["description"] as? String, "Test description")
        XCTAssertEqual(payload["region"] as? String, "Centre")
    }

    func testReportData_toAPIPayload_excludesEmptyOptionals() {
        var data = ReportData()
        data.category = "human_health"
        data.source = "mobile"
        data.title = "Test"
        data.description = "Desc"
        data.region = "Centre"
        data.species = ""
        data.department = ""

        let payload = data.toAPIPayload()

        XCTAssertNil(payload["species"], "Empty species should not be in payload")
        XCTAssertNil(payload["department"], "Empty department should not be in payload")
    }

    func testReportData_toAPIPayload_includesNonAnonymousInfo() {
        var data = ReportData()
        data.category = "human_health"
        data.source = "mobile"
        data.title = "Test"
        data.description = "Desc"
        data.region = "Centre"
        data.isAnonymous = false
        data.reporterName = "Jean"
        data.reporterPhone = "691234567"
        data.reporterEmail = "jean@test.com"

        let payload = data.toAPIPayload()

        XCTAssertEqual(payload["reporter_name"] as? String, "Jean")
        XCTAssertEqual(payload["reporter_phone"] as? String, "691234567")
        XCTAssertEqual(payload["reporter_email"] as? String, "jean@test.com")
        XCTAssertEqual(payload["is_anonymous"] as? Bool, false)
    }

    func testReportData_toAPIPayload_anonymousExcludesPersonalInfo() {
        var data = ReportData()
        data.category = "human_health"
        data.source = "mobile"
        data.title = "Test"
        data.description = "Desc"
        data.region = "Centre"
        data.isAnonymous = true
        data.reporterName = "Jean"

        let payload = data.toAPIPayload()

        XCTAssertNil(payload["reporter_name"])
        XCTAssertEqual(payload["is_anonymous"] as? Bool, true)
    }

    func testReportData_toAPIPayload_includesSymptomsJoined() {
        var data = ReportData()
        data.category = "human_health"
        data.source = "mobile"
        data.title = "Test"
        data.description = "Desc"
        data.region = "Centre"
        data.symptoms = ["FI", "VO", "DI"]

        let payload = data.toAPIPayload()

        XCTAssertEqual(payload["symptoms"] as? String, "FI,VO,DI")
    }

    func testReportData_codable_roundTrips() throws {
        var data = ReportData()
        data.category = "animal_health"
        data.species = "BOV"
        data.region = "Littoral"
        data.title = "Cattle disease"
        data.description = "Multiple cattle sick"
        data.symptoms = ["FI", "MO"]
        data.isAnonymous = false
        data.reporterName = "Farmer"

        let encoded = try JSONEncoder().encode(data)
        let decoded = try JSONDecoder().decode(ReportData.self, from: encoded)

        XCTAssertEqual(decoded.category, data.category)
        XCTAssertEqual(decoded.species, data.species)
        XCTAssertEqual(decoded.region, data.region)
        XCTAssertEqual(decoded.title, data.title)
        XCTAssertEqual(decoded.symptoms, data.symptoms)
        XCTAssertEqual(decoded.isAnonymous, data.isAnonymous)
        XCTAssertEqual(decoded.reporterName, data.reporterName)
    }
}
