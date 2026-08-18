// DUSSCService.swift
// One Health Cameroon - Service API DUSS-C

import Foundation

/// Service API pour le module DUSS-C (Défi Une Seule Santé)
actor DUSSCService {

    static let shared = DUSSCService()
    private let client = APIClient.shared
    private init() {}

    private let base = "/dussc/public"
    private var lang: String {
        UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
    }

    // MARK: - Public endpoints

    func getModules() async throws -> APIResponse<[DUSSCModule]> {
        try await client.get("\(base)/modules", queryParams: ["lang": lang], responseType: APIResponse<[DUSSCModule]>.self)
    }

    func getPersonas() async throws -> APIResponse<[DUSSCPersona]> {
        try await client.get("\(base)/personas", queryParams: ["lang": lang], responseType: APIResponse<[DUSSCPersona]>.self)
    }

    func getConsent() async throws -> APIResponse<DUSSCConsent> {
        try await client.get("\(base)/consent", queryParams: ["lang": lang], responseType: APIResponse<DUSSCConsent>.self)
    }

    func getQuiz(profil: String? = nil) async throws -> APIResponse<DUSSCQuiz> {
        var params: [String: String] = ["lang": lang]
        if let profil { params["profil"] = profil }
        return try await client.get("\(base)/quiz", queryParams: params, responseType: APIResponse<DUSSCQuiz>.self)
    }

    func createSession(uuid: String, profil: String?, canal: String = "mobile") async throws -> APIResponse<DUSSCSessionCreated> {
        var body: [String: Any] = [
            "uuid": uuid,
            "langue": lang,
            "canal": canal,
            "consent": "true"
        ]
        if let profil { body["profil"] = profil }
        return try await client.post("\(base)/sessions", body: body, responseType: APIResponse<DUSSCSessionCreated>.self)
    }

    func submitAnswer(uuid: String, questionId: Int, answer: String, bloc: String, questionOrder: Int? = nil, durationMs: Int? = nil, optionsOrder: [String]? = nil) async throws -> APIResponse<DUSSCAnswerFeedback> {
        var body: [String: Any] = [
            "question_id": questionId,
            "answer": answer,
            "bloc": bloc,
            "lang": lang
        ]
        if let questionOrder { body["question_order"] = questionOrder }
        if let durationMs { body["duration_ms"] = durationMs }
        if let optionsOrder { body["options_order"] = optionsOrder }
        return try await client.post("\(base)/sessions/\(uuid)/responses", body: body, responseType: APIResponse<DUSSCAnswerFeedback>.self)
    }

    func completeSession(uuid: String, demographics: DUSSCDemographics? = nil, durationSeconds: Int? = nil) async throws -> APIResponse<DUSSCScores> {
        var body: [String: Any] = [:]
        if let d = demographics {
            if let r = d.region { body["region"] = r }
            if let m = d.milieu { body["milieu"] = m }
            if let a = d.trancheAge { body["tranche_age"] = a }
            if let s = d.sexe { body["sexe"] = s }
        }
        if let durationSeconds { body["duration_seconds"] = durationSeconds }
        return try await client.post("\(base)/sessions/\(uuid)/complete", body: body, responseType: APIResponse<DUSSCScores>.self)
    }

    func getResult(uuid: String) async throws -> APIResponse<DUSSCResult> {
        try await client.get("\(base)/sessions/\(uuid)/result", responseType: APIResponse<DUSSCResult>.self)
    }

    func logEvent(uuid: String, eventType: String, screenNumber: Int? = nil, screenName: String? = nil, durationMs: Int? = nil) async throws {
        var body: [String: Any] = ["event_type": eventType]
        if let screenNumber { body["screen_number"] = screenNumber }
        if let screenName { body["screen_name"] = screenName }
        if let durationMs { body["duration_ms"] = durationMs }
        _ = try await client.post("\(base)/sessions/\(uuid)/events", body: body, responseType: APIResponse<EmptyDTO>.self)
    }
}
