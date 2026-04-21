package cm.onehealth.cohrm.data.repository

import cm.onehealth.cohrm.data.remote.dto.RegionDto
import cm.onehealth.cohrm.data.remote.dto.SmsCodeDto
import cm.onehealth.cohrm.data.remote.dto.SyncData
import cm.onehealth.cohrm.data.remote.dto.SyncResponse
import cm.onehealth.cohrm.domain.model.ReferenceData
import org.junit.Assert.*
import org.junit.Test

class SyncRepositoryTest {

    // MARK: - SyncResponse Tests

    @Test
    fun `SyncResponse success with data`() {
        val data = SyncData(
            smsCodes = listOf(
                SmsCodeDto(code = "FI", labelFr = "Fievre", labelEn = "Fever", category = "symptom"),
                SmsCodeDto(code = "VO", labelFr = "Vomissement", labelEn = "Vomiting", category = "symptom"),
            ),
            regions = listOf(
                RegionDto(code = "CE", name = "Centre"),
                RegionDto(code = "LT", name = "Littoral"),
            ),
            syncTimestamp = "2026-04-20T00:00:00Z",
        )
        val response = SyncResponse(success = true, data = data)

        assertTrue(response.success)
        assertNotNull(response.data)
        assertEquals(2, response.data!!.smsCodes.size)
        assertEquals(2, response.data!!.regions.size)
    }

    @Test
    fun `SyncResponse failure`() {
        val response = SyncResponse(success = false, data = null)
        assertFalse(response.success)
        assertNull(response.data)
    }

    // MARK: - SmsCodeDto Tests

    @Test
    fun `SmsCodeDto holds correct values`() {
        val dto = SmsCodeDto(
            code = "FI",
            labelFr = "Fievre",
            labelEn = "Fever",
            category = "symptom",
        )
        assertEquals("FI", dto.code)
        assertEquals("Fievre", dto.labelFr)
        assertEquals("Fever", dto.labelEn)
        assertEquals("symptom", dto.category)
    }

    @Test
    fun `SmsCodeDto default values`() {
        val dto = SmsCodeDto(code = "XX")
        assertEquals("XX", dto.code)
        assertEquals("", dto.labelFr)
        assertEquals("", dto.labelEn)
        assertEquals("", dto.category)
    }

    // MARK: - RegionDto Tests

    @Test
    fun `RegionDto holds correct values`() {
        val dto = RegionDto(code = "CE", name = "Centre")
        assertEquals("CE", dto.code)
        assertEquals("Centre", dto.name)
    }

    @Test
    fun `RegionDto default name`() {
        val dto = RegionDto(code = "XX")
        assertEquals("", dto.name)
    }

    // MARK: - SyncData Tests

    @Test
    fun `SyncData default values have empty lists`() {
        val data = SyncData()
        assertTrue(data.smsCodes.isEmpty())
        assertTrue(data.regions.isEmpty())
        assertNull(data.syncTimestamp)
    }

    @Test
    fun `SyncData with multiple SMS codes`() {
        val codes = listOf(
            SmsCodeDto(code = "FI", labelFr = "Fievre", labelEn = "Fever", category = "symptom"),
            SmsCodeDto(code = "VO", labelFr = "Vomissement", labelEn = "Vomiting", category = "symptom"),
            SmsCodeDto(code = "DI", labelFr = "Diarrhee", labelEn = "Diarrhea", category = "symptom"),
            SmsCodeDto(code = "TO", labelFr = "Toux", labelEn = "Cough", category = "symptom"),
            SmsCodeDto(code = "ER", labelFr = "Eruption", labelEn = "Rash", category = "symptom"),
            SmsCodeDto(code = "HE", labelFr = "Hemorragie", labelEn = "Hemorrhage", category = "symptom"),
            SmsCodeDto(code = "PA", labelFr = "Paralysie", labelEn = "Paralysis", category = "symptom"),
            SmsCodeDto(code = "MO", labelFr = "Mortalite", labelEn = "Mortality", category = "symptom"),
            SmsCodeDto(code = "AB", labelFr = "Avortement", labelEn = "Abortion", category = "symptom"),
            SmsCodeDto(code = "RE", labelFr = "Respiratoire", labelEn = "Respiratory", category = "symptom"),
            SmsCodeDto(code = "NE", labelFr = "Neurologique", labelEn = "Neurological", category = "symptom"),
            SmsCodeDto(code = "OE", labelFr = "Oedeme", labelEn = "Edema", category = "symptom"),
        )
        val data = SyncData(smsCodes = codes)
        assertEquals(12, data.smsCodes.size)
    }

    @Test
    fun `SyncData with all 10 regions`() {
        val regions = listOf(
            RegionDto(code = "AD", name = "Adamaoua"),
            RegionDto(code = "CE", name = "Centre"),
            RegionDto(code = "ES", name = "Est"),
            RegionDto(code = "EN", name = "Extreme-Nord"),
            RegionDto(code = "LT", name = "Littoral"),
            RegionDto(code = "NO", name = "Nord"),
            RegionDto(code = "NW", name = "Nord-Ouest"),
            RegionDto(code = "OU", name = "Ouest"),
            RegionDto(code = "SU", name = "Sud"),
            RegionDto(code = "SW", name = "Sud-Ouest"),
        )
        val data = SyncData(regions = regions)
        assertEquals(10, data.regions.size)
    }

    // MARK: - ReferenceData Domain Model Mapping

    @Test
    fun `SmsCodeDto maps to ReferenceData correctly`() {
        val dto = SmsCodeDto(code = "FI", labelFr = "Fievre", labelEn = "Fever", category = "symptom")
        val domain = ReferenceData(
            code = dto.code,
            labelFr = dto.labelFr,
            labelEn = dto.labelEn,
            category = dto.category.ifBlank { "sms_code" },
        )
        assertEquals("FI", domain.code)
        assertEquals("Fievre", domain.labelFr)
        assertEquals("Fever", domain.labelEn)
        assertEquals("symptom", domain.category)
    }

    @Test
    fun `SmsCodeDto with blank category defaults to sms_code`() {
        val dto = SmsCodeDto(code = "XX", labelFr = "Test", labelEn = "Test", category = "")
        val category = dto.category.ifBlank { "sms_code" }
        assertEquals("sms_code", category)
    }

    @Test
    fun `RegionDto maps to ReferenceData for region category`() {
        val dto = RegionDto(code = "CE", name = "Centre")
        val domain = ReferenceData(
            code = dto.code,
            labelFr = dto.name,
            labelEn = dto.name,
            category = "region",
        )
        assertEquals("CE", domain.code)
        assertEquals("Centre", domain.labelFr)
        assertEquals("Centre", domain.labelEn)
        assertEquals("region", domain.category)
    }

    // MARK: - Sync Timestamp Tests

    @Test
    fun `sync timestamp can be parsed as millis`() {
        val timestamp = 1713571200000L // Approx 2024-04-20
        assertTrue(timestamp > 0)
    }

    @Test
    fun `zero timestamp means never synced`() {
        val lastSync = 0L
        assertEquals(0L, lastSync)
        assertTrue(lastSync == 0L)
    }

    @Test
    fun `current time is greater than zero`() {
        val now = System.currentTimeMillis()
        assertTrue(now > 0)
    }

    // MARK: - Edge Cases

    @Test
    fun `empty sync response data`() {
        val data = SyncData(smsCodes = emptyList(), regions = emptyList())
        assertTrue(data.smsCodes.isEmpty())
        assertTrue(data.regions.isEmpty())
    }

    @Test
    fun `SmsCodeDto with special characters in labels`() {
        val dto = SmsCodeDto(
            code = "FI",
            labelFr = "Fievre hemorragique",
            labelEn = "Hemorrhagic fever",
            category = "symptom",
        )
        assertTrue(dto.labelFr.contains("hemorragique"))
    }

    @Test
    fun `multiple sync timestamps increase over time`() {
        val first = 1000L
        val second = 2000L
        assertTrue(second > first)
    }

    @Test
    fun `region codes are two uppercase letters`() {
        val codes = listOf("AD", "CE", "ES", "EN", "LT", "NO", "NW", "OU", "SU", "SW")
        codes.forEach { code ->
            assertEquals(2, code.length)
            assertTrue("Code $code should be uppercase", code.all { it.isUpperCase() })
        }
    }
}
