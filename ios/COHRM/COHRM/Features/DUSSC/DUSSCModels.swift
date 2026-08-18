// DUSSCModels.swift
// One Health Cameroon - Modèles DUSS-C (Défi Une Seule Santé)

import Foundation

// MARK: - Module

struct DUSSCModule: Codable, Identifiable {
    let code: String
    let name: String
    let description: String?
    let icon: String?
    let color: String?

    var id: String { code }
}

// MARK: - Persona

struct DUSSCPersona: Codable, Identifiable {
    let code: String
    let family: String
    let name: String
    let description: String?

    var id: String { code }
}

// MARK: - Quiz

struct DUSSCQuiz: Codable {
    let templateId: Int?
    let templateCode: String?
    let lang: String?
    let profil: String?
    let totalQuestions: Int?
    let showProgressBar: Bool?
    let requireConsent: Bool?
    let questions: [DUSSCQuestion]?

    enum CodingKeys: String, CodingKey {
        case lang, profil, questions
        case templateId = "template_id"
        case templateCode = "template_code"
        case totalQuestions = "total_questions"
        case showProgressBar = "show_progress_bar"
        case requireConsent = "require_consent"
    }
}

struct DUSSCQuestion: Codable, Identifiable {
    let id: Int
    let order: Int?
    let bloc: String?
    let moduleCode: String?
    let moduleName: String?
    let enonce: String?
    let options: [DUSSCOption]?
    let optionsOrder: [String]?
    let showFeedback: Bool?

    enum CodingKeys: String, CodingKey {
        case id, order, bloc, enonce, options
        case moduleCode = "module_code"
        case moduleName = "module_name"
        case optionsOrder = "options_order"
        case showFeedback = "show_feedback"
    }
}

struct DUSSCOption: Codable {
    let letter: String
    let text: String
}

// MARK: - Session

struct DUSSCSessionCreated: Codable {
    let sessionId: Int?
    let uuid: String?

    enum CodingKeys: String, CodingKey {
        case uuid
        case sessionId = "session_id"
    }
}

// MARK: - Response Feedback

struct DUSSCAnswerFeedback: Codable {
    let isCorrect: Bool?
    let correctAnswer: String?
    let explication: String?
    let action: String?
    let ideeFausse: String?

    enum CodingKeys: String, CodingKey {
        case explication, action
        case isCorrect = "is_correct"
        case correctAnswer = "correct_answer"
        case ideeFausse = "idee_fausse"
    }
}

// MARK: - Completion Scores

struct DUSSCScores: Codable {
    let scorePre: Int?
    let scorePost: Int?
    let gain: Int?
    let pctPre: Int?
    let pctPost: Int?
    let totalQuestions: Int?
    let totalCorrect: Int?
    let pctTotal: Int?

    enum CodingKeys: String, CodingKey {
        case gain
        case scorePre = "score_pre"
        case scorePost = "score_post"
        case pctPre = "pct_pre"
        case pctPost = "pct_post"
        case totalQuestions = "total_questions"
        case totalCorrect = "total_correct"
        case pctTotal = "pct_total"
    }
}

// MARK: - Full Result

struct DUSSCResult: Codable {
    let session: DUSSCSessionResult?
    let responses: [DUSSCResponseDetail]?
}

struct DUSSCSessionResult: Codable {
    let uuid: String?
    let scorePre: Int?
    let scorePost: Int?
    let gain: Int?
    let pctPre: Double?
    let pctPost: Double?
    let totalQuestions: Int?
    let totalCorrect: Int?
    let durationSeconds: Int?
    let completedAt: String?

    enum CodingKeys: String, CodingKey {
        case uuid, gain
        case scorePre = "score_pre"
        case scorePost = "score_post"
        case pctPre = "pct_pre"
        case pctPost = "pct_post"
        case totalQuestions = "total_questions"
        case totalCorrect = "total_correct"
        case durationSeconds = "duration_seconds"
        case completedAt = "completed_at"
    }
}

struct DUSSCResponseDetail: Codable, Identifiable {
    let id: Int
    let questionId: Int?
    let questionOrder: Int?
    let answerGiven: String?
    let isCorrect: Int?
    let bloc: String?
    let durationMs: Int?
    let idQuestion: String?
    let enonceeFr: String?
    let enonceeEn: String?
    let explicationFr: String?
    let explicationEn: String?
    let actionFr: String?
    let actionEn: String?
    let reponseCorrecte: String?
    let optionsFr: String?
    let optionsEn: String?
    let moduleCode: String?

    enum CodingKeys: String, CodingKey {
        case id, bloc
        case questionId = "question_id"
        case questionOrder = "question_order"
        case answerGiven = "answer_given"
        case isCorrect = "is_correct"
        case durationMs = "duration_ms"
        case idQuestion = "id_question"
        case enonceeFr = "enonce_fr"
        case enonceeEn = "enonce_en"
        case explicationFr = "explication_fr"
        case explicationEn = "explication_en"
        case actionFr = "action_fr"
        case actionEn = "action_en"
        case reponseCorrecte = "reponse_correcte"
        case optionsFr = "options_fr"
        case optionsEn = "options_en"
        case moduleCode = "module_code"
    }

    var localizedEnonce: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? enonceeEn : nil) ?? enonceeFr ?? ""
    }

    var localizedExplication: String? {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? explicationEn : nil) ?? explicationFr
    }
}

// MARK: - Consent

struct DUSSCConsent: Codable {
    let text: String?
}

// MARK: - Demographics (for session completion)

struct DUSSCDemographics {
    var region: String?
    var milieu: String?
    var trancheAge: String?
    var sexe: String?
}
