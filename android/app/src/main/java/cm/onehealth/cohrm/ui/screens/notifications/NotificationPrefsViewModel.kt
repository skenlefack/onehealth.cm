package cm.onehealth.cohrm.ui.screens.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.NotificationPrefs
import cm.onehealth.cohrm.data.remote.dto.NotificationPrefsUpdate
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationPrefsUiState(
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val error: String? = null,
    val saveSuccess: Boolean = false,
    val notifyNewRumor: Boolean = true,
    val notifyEscalation: Boolean = true,
    val notifyValidation: Boolean = true,
    val notifyRejection: Boolean = true,
    val notifyRiskAssessment: Boolean = true,
    val notifyReminder: Boolean = true,
    val notifyFeedback: Boolean = true,
    val preferEmail: Boolean = true,
    val preferSms: Boolean = false,
    val preferPush: Boolean = false,
)

@HiltViewModel
class NotificationPrefsViewModel @Inject constructor(
    private val apiService: ApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(NotificationPrefsUiState())
    val state: StateFlow<NotificationPrefsUiState> = _state.asStateFlow()

    init {
        loadPreferences()
    }

    fun loadPreferences() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val response = apiService.getNotificationPreferences()
                val prefs = response.data
                if (prefs != null) {
                    _state.update {
                        it.copy(
                            isLoading = false,
                            notifyNewRumor = prefs.notifyNewRumor ?: true,
                            notifyEscalation = prefs.notifyEscalation ?: true,
                            notifyValidation = prefs.notifyValidation ?: true,
                            notifyRejection = prefs.notifyRejection ?: true,
                            notifyRiskAssessment = prefs.notifyRiskAssessment ?: true,
                            notifyReminder = prefs.notifyReminder ?: true,
                            notifyFeedback = prefs.notifyFeedback ?: true,
                            preferEmail = prefs.preferEmail ?: true,
                            preferSms = prefs.preferSms ?: false,
                            preferPush = prefs.preferPush ?: false,
                        )
                    }
                } else {
                    _state.update { it.copy(isLoading = false) }
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Erreur de chargement",
                    )
                }
            }
        }
    }

    fun toggleNotifyNewRumor(value: Boolean) { _state.update { it.copy(notifyNewRumor = value, saveSuccess = false) } }
    fun toggleNotifyEscalation(value: Boolean) { _state.update { it.copy(notifyEscalation = value, saveSuccess = false) } }
    fun toggleNotifyValidation(value: Boolean) { _state.update { it.copy(notifyValidation = value, saveSuccess = false) } }
    fun toggleNotifyRejection(value: Boolean) { _state.update { it.copy(notifyRejection = value, saveSuccess = false) } }
    fun toggleNotifyRiskAssessment(value: Boolean) { _state.update { it.copy(notifyRiskAssessment = value, saveSuccess = false) } }
    fun toggleNotifyReminder(value: Boolean) { _state.update { it.copy(notifyReminder = value, saveSuccess = false) } }
    fun toggleNotifyFeedback(value: Boolean) { _state.update { it.copy(notifyFeedback = value, saveSuccess = false) } }
    fun togglePreferEmail(value: Boolean) { _state.update { it.copy(preferEmail = value, saveSuccess = false) } }
    fun togglePreferSms(value: Boolean) { _state.update { it.copy(preferSms = value, saveSuccess = false) } }
    fun togglePreferPush(value: Boolean) { _state.update { it.copy(preferPush = value, saveSuccess = false) } }

    fun savePreferences() {
        val s = _state.value
        _state.update { it.copy(isSaving = true, error = null, saveSuccess = false) }
        viewModelScope.launch {
            try {
                apiService.updateNotificationPreferences(
                    NotificationPrefsUpdate(
                        notifyNewRumor = s.notifyNewRumor,
                        notifyEscalation = s.notifyEscalation,
                        notifyValidation = s.notifyValidation,
                        notifyRejection = s.notifyRejection,
                        notifyRiskAssessment = s.notifyRiskAssessment,
                        notifyReminder = s.notifyReminder,
                        notifyFeedback = s.notifyFeedback,
                        preferEmail = s.preferEmail,
                        preferSms = s.preferSms,
                        preferPush = s.preferPush,
                    )
                )
                _state.update { it.copy(isSaving = false, saveSuccess = true) }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isSaving = false,
                        error = e.localizedMessage ?: "Erreur de sauvegarde",
                    )
                }
            }
        }
    }
}
