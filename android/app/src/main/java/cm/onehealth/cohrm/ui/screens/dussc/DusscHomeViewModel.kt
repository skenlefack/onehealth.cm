package cm.onehealth.cohrm.ui.screens.dussc

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.dussc.DusscModuleDto
import cm.onehealth.cohrm.data.remote.dussc.DusscPersonaDto
import cm.onehealth.cohrm.domain.repository.dussc.DusscRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DusscHomeState(
    val isLoading: Boolean = false,
    val modules: List<DusscModuleDto> = emptyList(),
    val personas: List<DusscPersonaDto> = emptyList(),
    val selectedPersona: DusscPersonaDto? = null,
    val error: String? = null,
    val lang: String = "fr",
    val consentText: String? = null,
    val consentAccepted: Boolean = false,
    val showConsent: Boolean = false,
)

@HiltViewModel
class DusscHomeViewModel @Inject constructor(
    private val repository: DusscRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(DusscHomeState())
    val state: StateFlow<DusscHomeState> = _state.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        val lang = _state.value.lang
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            repository.getModules(lang).fold(
                onSuccess = { modules -> _state.update { it.copy(modules = modules) } },
                onFailure = {},
            )
        }
        viewModelScope.launch {
            repository.getPersonas(lang).fold(
                onSuccess = { personas -> _state.update { it.copy(personas = personas, isLoading = false) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }

    fun selectPersona(persona: DusscPersonaDto) {
        _state.update { it.copy(selectedPersona = persona) }
    }

    fun toggleLang() {
        val newLang = if (_state.value.lang == "fr") "en" else "fr"
        _state.update { it.copy(lang = newLang, consentText = null, consentAccepted = false) }
        loadData()
    }

    fun loadConsent() {
        viewModelScope.launch {
            repository.getConsent(_state.value.lang).fold(
                onSuccess = { consent -> _state.update { it.copy(consentText = consent.text) } },
                onFailure = {},
            )
        }
    }

    fun acceptConsent(accepted: Boolean) {
        _state.update { it.copy(consentAccepted = accepted) }
    }

    fun showConsentDialog() {
        _state.update { it.copy(showConsent = true) }
        if (_state.value.consentText == null) {
            loadConsent()
        }
    }

    fun hideConsent() {
        _state.update { it.copy(showConsent = false) }
    }
}
