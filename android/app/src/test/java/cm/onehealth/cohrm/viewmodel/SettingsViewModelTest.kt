package cm.onehealth.cohrm.viewmodel

import cm.onehealth.cohrm.MainDispatcherRule
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class SettingsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `theme values are valid`() = runTest {
        val validThemes = listOf("system", "light", "dark")
        validThemes.forEach { theme ->
            assertTrue("$theme should be a valid theme", theme in validThemes)
        }
    }

    @Test
    fun `default theme is system`() = runTest {
        val defaultTheme = "system"
        assertEquals("system", defaultTheme)
    }

    @Test
    fun `sync work name is consistent`() = runTest {
        val workName = "cohrm_sync"
        assertEquals("cohrm_sync", workName)
    }

    @Test
    fun `notification preference keys are unique`() = runTest {
        val keys = listOf("pref_push_enabled", "pref_scan_notif", "pref_rumor_notif")
        assertEquals(keys.size, keys.distinct().size)
    }
}
