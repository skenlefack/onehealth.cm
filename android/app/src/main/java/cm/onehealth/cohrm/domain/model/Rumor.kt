package cm.onehealth.cohrm.domain.model

object RumorStatus {
    const val PENDING = "pending"
    const val INVESTIGATING = "investigating"
    const val CONFIRMED = "confirmed"
    const val FALSE_ALARM = "false_alarm"
    const val CLOSED = "closed"

    val all = listOf(PENDING, INVESTIGATING, CONFIRMED, FALSE_ALARM, CLOSED)
}

object RumorPriority {
    const val LOW = "low"
    const val MEDIUM = "medium"
    const val HIGH = "high"
    const val CRITICAL = "critical"

    val all = listOf(LOW, MEDIUM, HIGH, CRITICAL)
}

object RumorRisk {
    const val UNKNOWN = "unknown"
    const val LOW = "low"
    const val MODERATE = "moderate"
    const val HIGH = "high"
    const val VERY_HIGH = "very_high"

    val all = listOf(UNKNOWN, LOW, MODERATE, HIGH, VERY_HIGH)
}

object RumorSource {
    const val DIRECT = "direct"
    const val FIELD = "field"
    const val SMS = "sms"
    const val MOBILE = "mobile"
    const val WEB = "web"
    const val SCANNER = "scanner"
    const val SOCIAL_MEDIA = "social_media"
    const val MEDIA = "media"

    val all = listOf(DIRECT, FIELD, SMS, MOBILE, WEB, SCANNER, SOCIAL_MEDIA, MEDIA)
}

object RumorCategory {
    const val HUMAN_HEALTH = "human_health"
    const val ANIMAL_HEALTH = "animal_health"
    const val ENVIRONMENTAL = "environmental"
    const val SAFETY = "safety"
    const val DISASTER = "disaster"
    const val OTHER = "other"

    val all = listOf(HUMAN_HEALTH, ANIMAL_HEALTH, ENVIRONMENTAL, SAFETY, DISASTER, OTHER)
}

object ValidationDecision {
    const val APPROVED = "approved"
    const val REJECTED = "rejected"
    const val ESCALATED = "escalated"
    const val NEEDS_INFO = "needs_info"
}

object ActorLevel {
    const val COMMUNITY = 1
    const val VERIFIER = 2
    const val EVALUATOR = 3
    const val COORDINATOR = 4
    const val SUPERVISOR = 5

    fun label(level: Int): String = when (level) {
        COMMUNITY -> "Agent Communautaire"
        VERIFIER -> "Vérificateur"
        EVALUATOR -> "Évaluateur"
        COORDINATOR -> "Coordinateur"
        SUPERVISOR -> "Superviseur"
        else -> "Inconnu"
    }
}
