package cm.onehealth.cohrm.ui.screens.profile

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ChangePasswordRequest
import cm.onehealth.cohrm.data.remote.dto.ProfileUpdateRequest
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileState(
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val organization: String = "",
    val region: String = "",
    val role: String = "",
    val currentPassword: String = "",
    val newPassword: String = "",
    val confirmPassword: String = "",
    val isSaving: Boolean = false,
    val saveMessage: String? = null,
    val passwordMessage: String? = null,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val dataStore: DataStore<Preferences>,
    private val apiService: ApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileState())
    val state: StateFlow<ProfileState> = _state.asStateFlow()

    init {
        loadProfile()
    }

    private fun loadProfile() {
        viewModelScope.launch {
            try {
                val prefs = dataStore.data.first()
                _state.update {
                    it.copy(
                        name = prefs[LoginViewModel.USER_NAME] ?: "",
                        email = prefs[LoginViewModel.USER_EMAIL] ?: "",
                        role = prefs[LoginViewModel.ACTOR_LEVEL_LABEL] ?: "",
                        organization = prefs[LoginViewModel.ACTOR_ORGANIZATION] ?: "",
                        region = prefs[LoginViewModel.ACTOR_REGION] ?: "",
                    )
                }
            } catch (_: Exception) {}
        }
    }

    fun updateName(value: String) = _state.update { it.copy(name = value, saveMessage = null) }
    fun updateEmail(value: String) = _state.update { it.copy(email = value, saveMessage = null) }
    fun updatePhone(value: String) = _state.update { it.copy(phone = value, saveMessage = null) }
    fun updateOrganization(value: String) = _state.update { it.copy(organization = value, saveMessage = null) }
    fun updateRegion(value: String) = _state.update { it.copy(region = value, saveMessage = null) }

    fun updateCurrentPassword(value: String) = _state.update { it.copy(currentPassword = value, passwordMessage = null) }
    fun updateNewPassword(value: String) = _state.update { it.copy(newPassword = value, passwordMessage = null) }
    fun updateConfirmPassword(value: String) = _state.update { it.copy(confirmPassword = value, passwordMessage = null) }

    fun saveProfile() {
        val s = _state.value
        _state.update { it.copy(isSaving = true) }
        viewModelScope.launch {
            try {
                val response = apiService.updateProfile(
                    ProfileUpdateRequest(
                        name = s.name,
                        email = s.email,
                        phone = s.phone.ifBlank { null },
                        organization = s.organization.ifBlank { null },
                        region = s.region.ifBlank { null },
                    )
                )
                if (response.success) {
                    dataStore.edit { prefs ->
                        prefs[LoginViewModel.USER_NAME] = s.name
                        prefs[LoginViewModel.USER_EMAIL] = s.email
                        prefs[LoginViewModel.ACTOR_ORGANIZATION] = s.organization
                        prefs[LoginViewModel.ACTOR_REGION] = s.region
                    }
                    _state.update { it.copy(isSaving = false, saveMessage = "saved") }
                } else {
                    _state.update { it.copy(isSaving = false, saveMessage = "error") }
                }
            } catch (_: Exception) {
                _state.update { it.copy(isSaving = false, saveMessage = "error") }
            }
        }
    }

    fun changePassword() {
        val s = _state.value
        if (s.currentPassword.isBlank()) {
            _state.update { it.copy(passwordMessage = "current_required") }
            return
        }
        if (s.newPassword != s.confirmPassword) {
            _state.update { it.copy(passwordMessage = "mismatch") }
            return
        }
        if (s.newPassword.length < 6) {
            _state.update { it.copy(passwordMessage = "too_short") }
            return
        }
        viewModelScope.launch {
            try {
                val response = apiService.changePassword(
                    ChangePasswordRequest(
                        currentPassword = s.currentPassword,
                        newPassword = s.newPassword,
                    )
                )
                if (response.success) {
                    _state.update {
                        it.copy(
                            passwordMessage = "changed",
                            currentPassword = "",
                            newPassword = "",
                            confirmPassword = "",
                        )
                    }
                } else {
                    _state.update { it.copy(passwordMessage = response.message ?: "error") }
                }
            } catch (_: Exception) {
                _state.update { it.copy(passwordMessage = "error") }
            }
        }
    }
}
