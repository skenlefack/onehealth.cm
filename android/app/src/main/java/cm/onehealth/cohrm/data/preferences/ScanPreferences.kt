package cm.onehealth.cohrm.data.preferences

import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey

object ScanPreferences {
    val SCAN_ENABLED = booleanPreferencesKey("scan_schedule_enabled")
    val SCAN_FREQUENCY = intPreferencesKey("scan_frequency_minutes")
    val SCAN_SOURCE = stringPreferencesKey("scan_source")
    val SCAN_KEYWORDS = stringPreferencesKey("scan_keywords")
}
