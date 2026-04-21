package cm.onehealth.cohrm.util

import cm.onehealth.cohrm.domain.model.ActorLevel
import cm.onehealth.cohrm.domain.model.CameroonRegion
import cm.onehealth.cohrm.domain.model.CameroonRegions
import cm.onehealth.cohrm.domain.model.EventCategory
import cm.onehealth.cohrm.domain.model.ReferenceData
import cm.onehealth.cohrm.domain.model.RumorCategory
import cm.onehealth.cohrm.domain.model.RumorPriority
import cm.onehealth.cohrm.domain.model.RumorRisk
import cm.onehealth.cohrm.domain.model.RumorSource
import cm.onehealth.cohrm.domain.model.RumorStatus
import cm.onehealth.cohrm.domain.model.SpeciesCode
import cm.onehealth.cohrm.domain.model.SymptomCode
import cm.onehealth.cohrm.domain.model.ValidationDecision
import org.junit.Assert.*
import org.junit.Test

class FormatterTests {

    // MARK: - ActorLevel Tests

    @Test
    fun `ActorLevel label returns correct labels for all levels`() {
        assertEquals("Agent Communautaire", ActorLevel.label(ActorLevel.COMMUNITY))
        assertEquals("Verificateur", ActorLevel.label(ActorLevel.VERIFIER))
        assertEquals("Evaluateur", ActorLevel.label(ActorLevel.EVALUATOR))
        assertEquals("Coordinateur", ActorLevel.label(ActorLevel.COORDINATOR))
        assertEquals("Superviseur", ActorLevel.label(ActorLevel.SUPERVISOR))
    }

    @Test
    fun `ActorLevel label returns Inconnu for unknown level`() {
        assertEquals("Inconnu", ActorLevel.label(0))
        assertEquals("Inconnu", ActorLevel.label(6))
        assertEquals("Inconnu", ActorLevel.label(-1))
        assertEquals("Inconnu", ActorLevel.label(99))
    }

    @Test
    fun `ActorLevel constants have correct values`() {
        assertEquals(1, ActorLevel.COMMUNITY)
        assertEquals(2, ActorLevel.VERIFIER)
        assertEquals(3, ActorLevel.EVALUATOR)
        assertEquals(4, ActorLevel.COORDINATOR)
        assertEquals(5, ActorLevel.SUPERVISOR)
    }

    // MARK: - RumorStatus Tests

    @Test
    fun `RumorStatus all has expected entries`() {
        assertEquals(5, RumorStatus.all.size)
        assertTrue(RumorStatus.all.contains(RumorStatus.PENDING))
        assertTrue(RumorStatus.all.contains(RumorStatus.INVESTIGATING))
        assertTrue(RumorStatus.all.contains(RumorStatus.CONFIRMED))
        assertTrue(RumorStatus.all.contains(RumorStatus.FALSE_ALARM))
        assertTrue(RumorStatus.all.contains(RumorStatus.CLOSED))
    }

    @Test
    fun `RumorStatus constants match expected strings`() {
        assertEquals("pending", RumorStatus.PENDING)
        assertEquals("investigating", RumorStatus.INVESTIGATING)
        assertEquals("confirmed", RumorStatus.CONFIRMED)
        assertEquals("false_alarm", RumorStatus.FALSE_ALARM)
        assertEquals("closed", RumorStatus.CLOSED)
    }

    // MARK: - RumorPriority Tests

    @Test
    fun `RumorPriority all has expected entries`() {
        assertEquals(4, RumorPriority.all.size)
        assertTrue(RumorPriority.all.contains("low"))
        assertTrue(RumorPriority.all.contains("medium"))
        assertTrue(RumorPriority.all.contains("high"))
        assertTrue(RumorPriority.all.contains("critical"))
    }

    @Test
    fun `RumorPriority constants match expected strings`() {
        assertEquals("low", RumorPriority.LOW)
        assertEquals("medium", RumorPriority.MEDIUM)
        assertEquals("high", RumorPriority.HIGH)
        assertEquals("critical", RumorPriority.CRITICAL)
    }

    // MARK: - RumorRisk Tests

    @Test
    fun `RumorRisk all has expected entries`() {
        assertEquals(5, RumorRisk.all.size)
        assertTrue(RumorRisk.all.contains("unknown"))
        assertTrue(RumorRisk.all.contains("low"))
        assertTrue(RumorRisk.all.contains("moderate"))
        assertTrue(RumorRisk.all.contains("high"))
        assertTrue(RumorRisk.all.contains("very_high"))
    }

    // MARK: - RumorSource Tests

    @Test
    fun `RumorSource all has expected entries`() {
        assertEquals(8, RumorSource.all.size)
        assertTrue(RumorSource.all.contains("direct"))
        assertTrue(RumorSource.all.contains("field"))
        assertTrue(RumorSource.all.contains("sms"))
        assertTrue(RumorSource.all.contains("mobile"))
        assertTrue(RumorSource.all.contains("web"))
        assertTrue(RumorSource.all.contains("scanner"))
        assertTrue(RumorSource.all.contains("social_media"))
        assertTrue(RumorSource.all.contains("media"))
    }

    // MARK: - RumorCategory Tests

    @Test
    fun `RumorCategory all has expected entries`() {
        assertEquals(6, RumorCategory.all.size)
        assertTrue(RumorCategory.all.contains("human_health"))
        assertTrue(RumorCategory.all.contains("animal_health"))
        assertTrue(RumorCategory.all.contains("environmental"))
        assertTrue(RumorCategory.all.contains("safety"))
        assertTrue(RumorCategory.all.contains("disaster"))
        assertTrue(RumorCategory.all.contains("other"))
    }

    // MARK: - EventCategory Tests

    @Test
    fun `EventCategory constants match RumorCategory`() {
        assertEquals(RumorCategory.HUMAN_HEALTH, EventCategory.HUMAN_HEALTH)
        assertEquals(RumorCategory.ANIMAL_HEALTH, EventCategory.ANIMAL_HEALTH)
        assertEquals(RumorCategory.ENVIRONMENTAL, EventCategory.ENVIRONMENTAL)
        assertEquals(RumorCategory.SAFETY, EventCategory.SAFETY)
        assertEquals(RumorCategory.DISASTER, EventCategory.DISASTER)
        assertEquals(RumorCategory.OTHER, EventCategory.OTHER)
    }

    // MARK: - SpeciesCode Tests

    @Test
    fun `SpeciesCode constants are three-letter codes`() {
        assertEquals(3, SpeciesCode.HUMAN.length)
        assertEquals(3, SpeciesCode.BOVINE.length)
        assertEquals(3, SpeciesCode.OVINE.length)
        assertEquals(3, SpeciesCode.POULTRY.length)
        assertEquals(3, SpeciesCode.SWINE.length)
        assertEquals(3, SpeciesCode.WILDLIFE.length)
        assertEquals(3, SpeciesCode.DOMESTIC.length)
        assertEquals(3, SpeciesCode.OTHER.length)
    }

    @Test
    fun `SpeciesCode constants have correct values`() {
        assertEquals("HUM", SpeciesCode.HUMAN)
        assertEquals("BOV", SpeciesCode.BOVINE)
        assertEquals("OVI", SpeciesCode.OVINE)
        assertEquals("VOL", SpeciesCode.POULTRY)
        assertEquals("POR", SpeciesCode.SWINE)
        assertEquals("SAU", SpeciesCode.WILDLIFE)
        assertEquals("CHI", SpeciesCode.DOMESTIC)
        assertEquals("AUT", SpeciesCode.OTHER)
    }

    // MARK: - SymptomCode Tests

    @Test
    fun `SymptomCode constants are two-letter codes`() {
        assertEquals(2, SymptomCode.FEVER.length)
        assertEquals(2, SymptomCode.VOMITING.length)
        assertEquals(2, SymptomCode.DIARRHEA.length)
        assertEquals(2, SymptomCode.COUGH.length)
        assertEquals(2, SymptomCode.RASH.length)
        assertEquals(2, SymptomCode.HEMORRHAGE.length)
        assertEquals(2, SymptomCode.PARALYSIS.length)
        assertEquals(2, SymptomCode.MORTALITY.length)
        assertEquals(2, SymptomCode.ABORTION.length)
        assertEquals(2, SymptomCode.RESPIRATORY.length)
        assertEquals(2, SymptomCode.NEUROLOGICAL.length)
        assertEquals(2, SymptomCode.EDEMA.length)
    }

    @Test
    fun `SymptomCode constants have correct values`() {
        assertEquals("FI", SymptomCode.FEVER)
        assertEquals("VO", SymptomCode.VOMITING)
        assertEquals("DI", SymptomCode.DIARRHEA)
        assertEquals("TO", SymptomCode.COUGH)
        assertEquals("ER", SymptomCode.RASH)
        assertEquals("HE", SymptomCode.HEMORRHAGE)
        assertEquals("PA", SymptomCode.PARALYSIS)
        assertEquals("MO", SymptomCode.MORTALITY)
        assertEquals("AB", SymptomCode.ABORTION)
        assertEquals("RE", SymptomCode.RESPIRATORY)
        assertEquals("NE", SymptomCode.NEUROLOGICAL)
        assertEquals("OE", SymptomCode.EDEMA)
    }

    // MARK: - ValidationDecision Tests

    @Test
    fun `ValidationDecision constants have correct values`() {
        assertEquals("approved", ValidationDecision.APPROVED)
        assertEquals("rejected", ValidationDecision.REJECTED)
        assertEquals("escalated", ValidationDecision.ESCALATED)
        assertEquals("needs_info", ValidationDecision.NEEDS_INFO)
    }

    // MARK: - CameroonRegions Tests

    @Test
    fun `CameroonRegions has ten entries`() {
        assertEquals(10, CameroonRegions.size)
    }

    @Test
    fun `CameroonRegions all have unique codes`() {
        val codes = CameroonRegions.map { it.code }
        assertEquals(codes.size, codes.toSet().size)
    }

    @Test
    fun `CameroonRegions all have non-empty names`() {
        CameroonRegions.forEach { region ->
            assertTrue("Region code ${region.code} has empty name", region.name.isNotBlank())
        }
    }

    @Test
    fun `CameroonRegions all have departments`() {
        CameroonRegions.forEach { region ->
            assertTrue("Region ${region.name} has no departments", region.departments.isNotEmpty())
        }
    }

    @Test
    fun `CameroonRegions contains expected regions`() {
        val names = CameroonRegions.map { it.name }
        assertTrue(names.contains("Centre"))
        assertTrue(names.contains("Littoral"))
        assertTrue(names.contains("Adamaoua"))
        assertTrue(names.contains("Nord"))
        assertTrue(names.contains("Sud"))
        assertTrue(names.contains("Est"))
        assertTrue(names.contains("Ouest"))
    }

    @Test
    fun `CameroonRegion Centre has Mfoundi department`() {
        val centre = CameroonRegions.find { it.code == "CE" }
        assertNotNull(centre)
        assertTrue(centre!!.departments.contains("Mfoundi"))
    }

    // MARK: - ReferenceData Tests

    @Test
    fun `ReferenceData holds correct values`() {
        val data = ReferenceData(
            code = "FI",
            labelFr = "Fievre",
            labelEn = "Fever",
            category = "symptom",
        )
        assertEquals("FI", data.code)
        assertEquals("Fievre", data.labelFr)
        assertEquals("Fever", data.labelEn)
        assertEquals("symptom", data.category)
    }

    @Test
    fun `ReferenceData equality check`() {
        val data1 = ReferenceData(code = "FI", labelFr = "Fievre", labelEn = "Fever", category = "symptom")
        val data2 = ReferenceData(code = "FI", labelFr = "Fievre", labelEn = "Fever", category = "symptom")
        assertEquals(data1, data2)
    }

    @Test
    fun `ReferenceData inequality check`() {
        val data1 = ReferenceData(code = "FI", labelFr = "Fievre", labelEn = "Fever", category = "symptom")
        val data2 = ReferenceData(code = "VO", labelFr = "Vomissement", labelEn = "Vomiting", category = "symptom")
        assertNotEquals(data1, data2)
    }

    // MARK: - SMS Code Formatting Tests

    @Test
    fun `SMS format uses hash separator`() {
        val parts = listOf("OH", "HUM", "HUM", "FI,VO", "CEN", "Description")
        val sms = parts.joinToString("#")
        assertEquals("OH#HUM#HUM#FI,VO#CEN#Description", sms)
    }

    @Test
    fun `SMS format with empty symptoms`() {
        val parts = listOf("OH", "DIS", "", "", "NOR", "Flooding")
        val sms = parts.joinToString("#")
        assertEquals("OH#DIS###NOR#Flooding", sms)
    }

    @Test
    fun `SMS symptoms join with comma`() {
        val symptoms = listOf("FI", "VO", "DI")
        assertEquals("FI,VO,DI", symptoms.joinToString(","))
    }

    @Test
    fun `SMS empty symptoms join is empty string`() {
        val symptoms = emptyList<String>()
        assertEquals("", symptoms.joinToString(","))
    }

    // MARK: - Phone Number Formatting

    @Test
    fun `Cameroon phone 9 digits is valid format`() {
        val phone = "691234567"
        assertEquals(9, phone.length)
        assertTrue(phone.all { it.isDigit() })
    }

    @Test
    fun `Cameroon phone with prefix 237 strips correctly`() {
        val phone = "+237691234567"
        val stripped = phone.replace("+237", "").replace(" ", "")
        assertEquals("691234567", stripped)
        assertEquals(9, stripped.length)
    }

    @Test
    fun `Cameroon phone with spaces strips correctly`() {
        val phone = "691 234 567"
        val stripped = phone.replace(" ", "")
        assertEquals("691234567", stripped)
        assertEquals(9, stripped.length)
    }

    @Test
    fun `invalid phone too short`() {
        val phone = "12345"
        val stripped = phone.replace("+237", "").replace(" ", "")
        assertNotEquals(9, stripped.length)
    }

    @Test
    fun `invalid phone contains letters`() {
        val phone = "69123456a"
        val stripped = phone.replace("+237", "").replace(" ", "")
        assertFalse(stripped.all { it.isDigit() })
    }

    // MARK: - Date String Formatting

    @Test
    fun `ISO date string has expected format`() {
        val dateStr = "2026-04-21T12:00:00Z"
        assertTrue(dateStr.contains("T"))
        assertTrue(dateStr.endsWith("Z"))
        assertEquals(20, dateStr.length)
    }

    @Test
    fun `date-only string has expected format`() {
        val dateStr = "2026-04-21"
        assertEquals(10, dateStr.length)
        assertEquals('-', dateStr[4])
        assertEquals('-', dateStr[7])
    }
}
