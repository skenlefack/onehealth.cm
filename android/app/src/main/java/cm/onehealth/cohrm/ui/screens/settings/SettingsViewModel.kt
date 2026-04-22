package cm.onehealth.cohrm.ui.screens.settings

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import cm.onehealth.cohrm.data.remote.AuthInterceptor
import cm.onehealth.cohrm.domain.repository.SyncRepository
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import cm.onehealth.cohrm.util.DeviceHelper
import cm.onehealth.cohrm.util.SyncEvent
import cm.onehealth.cohrm.util.SyncStatusBroadcaster
import cm.onehealth.cohrm.worker.SyncWorker
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val dataStore: DataStore<Preferences>,
    private val syncRepository: SyncRepository,
    private val deviceHelper: DeviceHelper,
    private val workManager: WorkManager,
    private val authInterceptor: AuthInterceptor,
    private val syncStatusBroadcaster: SyncStatusBroadcaster,
) : ViewModel() {

    companion object {
        private val THEME_KEY = stringPreferencesKey("theme")
        val LANGUAGE_KEY = stringPreferencesKey("app_language")
        val PUSH_ENABLED_KEY = booleanPreferencesKey("pref_push_enabled")
        val SCAN_NOTIF_KEY = booleanPreferencesKey("pref_scan_notif")
        val RUMOR_NOTIF_KEY = booleanPreferencesKey("pref_rumor_notif")
    }

    private val _theme = MutableStateFlow("system")
    val theme: StateFlow<String> = _theme.asStateFlow()

    private val _language = MutableStateFlow("fr")
    val language: StateFlow<String> = _language.asStateFlow()

    private val _deviceId = MutableStateFlow("")
    val deviceId: StateFlow<String> = _deviceId.asStateFlow()

    private val _appVersion = MutableStateFlow("")
    val appVersion: StateFlow<String> = _appVersion.asStateFlow()

    private val _pushEnabled = MutableStateFlow(true)
    val pushEnabled: StateFlow<Boolean> = _pushEnabled.asStateFlow()

    private val _scanNotif = MutableStateFlow(true)
    val scanNotif: StateFlow<Boolean> = _scanNotif.asStateFlow()

    private val _rumorNotif = MutableStateFlow(true)
    val rumorNotif: StateFlow<Boolean> = _rumorNotif.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    private val _lastSyncTime = MutableStateFlow(0L)
    val lastSyncTime: StateFlow<Long> = _lastSyncTime.asStateFlow()

    private val _userName = MutableStateFlow("")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _userEmail = MutableStateFlow("")
    val userEmail: StateFlow<String> = _userEmail.asStateFlow()

    private val _actorLevelLabel = MutableStateFlow("")
    val actorLevelLabel: StateFlow<String> = _actorLevelLabel.asStateFlow()

    init {
        viewModelScope.launch {
            val prefs = dataStore.data.first()
            _theme.value = prefs[THEME_KEY] ?: "system"
            _language.value = prefs[LANGUAGE_KEY] ?: "fr"
            _pushEnabled.value = prefs[PUSH_ENABLED_KEY] ?: true
            _scanNotif.value = prefs[SCAN_NOTIF_KEY] ?: true
            _rumorNotif.value = prefs[RUMOR_NOTIF_KEY] ?: true
            _deviceId.value = deviceHelper.getDeviceId()
            _appVersion.value = deviceHelper.getAppVersion()
            _lastSyncTime.value = syncRepository.getLastSyncTime()
            _userName.value = prefs[LoginViewModel.USER_NAME] ?: ""
            _userEmail.value = prefs[LoginViewModel.USER_EMAIL] ?: ""
            _actorLevelLabel.value = prefs[LoginViewModel.ACTOR_LEVEL_LABEL] ?: ""
        }
    }

    fun logout() {
        authInterceptor.clearToken()
        viewModelScope.launch {
            dataStore.edit { it.clear() }
        }
    }

    fun setTheme(theme: String) {
        _theme.value = theme
        viewModelScope.launch {
            dataStore.edit { it[THEME_KEY] = theme }
        }
    }

    fun setLanguage(lang: String) {
        _language.value = lang
        viewModelScope.launch {
            dataStore.edit { it[LANGUAGE_KEY] = lang }
        }
        try {
            val localeList = androidx.core.os.LocaleListCompat.forLanguageTags(lang)
            androidx.appcompat.app.AppCompatDelegate.setApplicationLocales(localeList)
        } catch (_: Exception) {}
    }

    fun setPushEnabled(enabled: Boolean) {
        _pushEnabled.value = enabled
        viewModelScope.launch { dataStore.edit { it[PUSH_ENABLED_KEY] = enabled } }
    }

    fun setScanNotif(enabled: Boolean) {
        _scanNotif.value = enabled
        viewModelScope.launch { dataStore.edit { it[SCAN_NOTIF_KEY] = enabled } }
    }

    fun setRumorNotif(enabled: Boolean) {
        _rumorNotif.value = enabled
        viewModelScope.launch { dataStore.edit { it[RUMOR_NOTIF_KEY] = enabled } }
    }

    fun syncNow() {
        _isSyncing.value = true
        val request = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()

        workManager.enqueueUniqueWork(
            "manual_sync",
            ExistingWorkPolicy.REPLACE,
            request,
        )

        // Monitor sync completion via broadcaster
        viewModelScope.launch {
            syncStatusBroadcaster.syncStatus.collect { event ->
                when (event) {
                    is SyncEvent.Completed, is SyncEvent.Failed -> {
                        _lastSyncTime.value = syncRepository.getLastSyncTime()
                        _isSyncing.value = false
                    }
                    is SyncEvent.Idle -> {
                        _isSyncing.value = false
                    }
                    is SyncEvent.Syncing -> {
                        _isSyncing.value = true
                    }
                }
            }
        }
    }
}
