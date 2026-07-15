package cm.onehealth.cohrm.domain.model

data class ReferenceData(
    val code: String,
    val labelFr: String,
    val labelEn: String,
    val category: String,
)

data class CameroonRegion(
    val code: String,
    val name: String,
    val departments: List<String> = emptyList(),
)

object EventCategory {
    const val HUMAN_HEALTH = "human_health"
    const val ANIMAL_HEALTH = "animal_health"
    const val ENVIRONMENTAL = "environmental"
    const val SAFETY = "safety"
    const val DISASTER = "disaster"
    const val OTHER = "other"
}

object SpeciesCode {
    const val HUMAN = "HUM"
    const val BOVINE = "BOV"
    const val OVINE = "OVI"
    const val POULTRY = "VOL"
    const val SWINE = "POR"
    const val WILDLIFE = "SAU"
    const val DOMESTIC = "CHI"
    const val OTHER = "AUT"
}

object SymptomCode {
    const val FEVER = "FI"
    const val VOMITING = "VO"
    const val DIARRHEA = "DI"
    const val COUGH = "TO"
    const val RASH = "ER"
    const val HEMORRHAGE = "HE"
    const val PARALYSIS = "PA"
    const val MORTALITY = "MO"
    const val ABORTION = "AB"
    const val RESPIRATORY = "RE"
    const val NEUROLOGICAL = "NE"
    const val EDEMA = "OE"
}

val CameroonRegions = listOf(
    CameroonRegion("AD", "Adamaoua", listOf("Djérem", "Faro-et-Déo", "Mayo-Banyo", "Mbéré", "Vina")),
    CameroonRegion("CE", "Centre", listOf("Haute-Sanaga", "Lekié", "Mbam-et-Inoubou", "Mbam-et-Kim", "Méfou-et-Afamba", "Méfou-et-Akono", "Mfoundi", "Nyong-et-Kellé", "Nyong-et-Mfoumou", "Nyong-et-So'o")),
    CameroonRegion("ES", "Est", listOf("Boumba-et-Ngoko", "Haut-Nyong", "Kadey", "Lom-et-Djérem")),
    CameroonRegion("EN", "Extrême-Nord", listOf("Diamaré", "Logone-et-Chari", "Mayo-Danay", "Mayo-Kani", "Mayo-Sava", "Mayo-Tsanaga")),
    CameroonRegion("LT", "Littoral", listOf("Moungo", "Nkam", "Sanaga-Maritime", "Wouri")),
    CameroonRegion("NO", "Nord", listOf("Bénoué", "Faro", "Mayo-Louti", "Mayo-Rey")),
    CameroonRegion("NW", "Nord-Ouest", listOf("Boyo", "Bui", "Donga-Mantung", "Menchum", "Mezam", "Momo", "Ngo-Ketunjia")),
    CameroonRegion("OU", "Ouest", listOf("Bamboutos", "Haut-Nkam", "Hauts-Plateaux", "Koung-Khi", "Menoua", "Mifi", "Ndé", "Noun")),
    CameroonRegion("SU", "Sud", listOf("Dja-et-Lobo", "Mvila", "Océan", "Vallée-du-Ntem")),
    CameroonRegion("SW", "Sud-Ouest", listOf("Fako", "Koupé-Manengouba", "Lebialem", "Manyu", "Mémé", "Ndian")),
)
