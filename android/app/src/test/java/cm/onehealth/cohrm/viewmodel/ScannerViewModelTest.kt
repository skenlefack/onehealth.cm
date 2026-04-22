package cm.onehealth.cohrm.viewmodel

import cm.onehealth.cohrm.MainDispatcherRule
import cm.onehealth.cohrm.data.remote.dto.ScanRunRequest
import cm.onehealth.cohrm.data.remote.dto.ScanRunResponse
import cm.onehealth.cohrm.data.remote.dto.ScanRunData
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ScannerViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `scan request with all sources creates correct dto`() = runTest {
        val request = ScanRunRequest(source = "all", keywords = null)
        assertEquals("all", request.source)
        assertEquals(null, request.keywords)
    }

    @Test
    fun `scan request with keywords creates correct dto`() = runTest {
        val keywords = listOf("epidemie", "cholera", "grippe")
        val request = ScanRunRequest(source = "twitter", keywords = keywords)
        assertEquals("twitter", request.source)
        assertEquals(3, request.keywords?.size)
        assertTrue(request.keywords!!.contains("cholera"))
    }

    @Test
    fun `scan response parses scan id`() = runTest {
        val response = ScanRunResponse(
            success = true,
            message = "Scan started",
            data = ScanRunData(scanId = 42),
        )
        assertTrue(response.success)
        assertNotNull(response.data)
        assertEquals(42, response.data?.scanId)
    }

    @Test
    fun `scan response handles failure`() = runTest {
        val response = ScanRunResponse(
            success = false,
            message = "Scan service unavailable",
            data = null,
        )
        assertTrue(!response.success)
        assertEquals(null, response.data)
    }
}
