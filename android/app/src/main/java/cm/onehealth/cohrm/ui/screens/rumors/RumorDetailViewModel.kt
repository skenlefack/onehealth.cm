package cm.onehealth.cohrm.ui.screens.rumors

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.data.remote.dto.ValidationItem
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RumorDetailState(
    val isLoading: Boolean = true,
    val rumor: RumorDetail? = null,
    val error: String? = null,
    val isValidating: Boolean = false,
    val isSendingFeedback: Boolean = false,
    val isAssessingRisk: Boolean = false,
    val validations: List<ValidationItem> = emptyList(),
    val isLoadingValidations: Boolean = false,
)

sealed interface RumorDetailEvent {
    data class Success(val message: String) : RumorDetailEvent
    data class Error(val message: String) : RumorDetailEvent
}

@HiltViewModel
class RumorDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val cohrmRepository: CohrmRepository,
) : ViewModel() {

    private val rumorId: Int = savedStateHandle.get<Int>("rumorId") ?: 0

    private val _state = MutableStateFlow(RumorDetailState())
    val state: StateFlow<RumorDetailState> = _state.asStateFlow()

    private val _events = MutableSharedFlow<RumorDetailEvent>()
    val events: SharedFlow<RumorDetailEvent> = _events.asSharedFlow()

    init {
        if (rumorId > 0) {
            loadRumor()
            loadValidations()
        }
    }

    fun loadRumor() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            cohrmRepository.getRumorDetail(rumorId).fold(
                onSuccess = { rumor -> _state.update { it.copy(isLoading = false, rumor = rumor) } },
                onFailure = { e ->
                    // Try loading from cache when network fails
                    val cached = cohrmRepository.getCachedRumorDetail(rumorId)
                    if (cached != null) {
                        _state.update { it.copy(isLoading = false, rumor = cached, error = null) }
                    } else {
                        _state.update { it.copy(isLoading = false, error = e.localizedMessage) }
                    }
                },
            )
        }
    }

    fun validate(decision: String, notes: String, riskAssessment: String?, priorityChange: String?) {
        _state.update { it.copy(isValidating = true) }
        viewModelScope.launch {
            cohrmRepository.validateRumor(
                id = rumorId,
                decision = decision,
                notes = notes.ifBlank { null },
                riskAssessment = riskAssessment,
                priorityChange = priorityChange,
            ).fold(
                onSuccess = { rumor ->
                    _state.update { it.copy(isValidating = false, rumor = rumor) }
                    _events.emit(RumorDetailEvent.Success("Validation soumise"))
                },
                onFailure = { e ->
                    _state.update { it.copy(isValidating = false) }
                    _events.emit(RumorDetailEvent.Error(e.localizedMessage ?: "Erreur"))
                },
            )
        }
    }

    fun addFeedback(message: String) {
        if (message.isBlank()) return
        _state.update { it.copy(isSendingFeedback = true) }
        viewModelScope.launch {
            cohrmRepository.addFeedback(rumorId, message).fold(
                onSuccess = { rumor ->
                    _state.update { it.copy(isSendingFeedback = false, rumor = rumor) }
                },
                onFailure = { e ->
                    _state.update { it.copy(isSendingFeedback = false) }
                    _events.emit(RumorDetailEvent.Error(e.localizedMessage ?: "Erreur"))
                },
            )
        }
    }

    fun updateStatus(status: String) {
        viewModelScope.launch {
            cohrmRepository.updateRumor(rumorId, status = status).fold(
                onSuccess = { rumor -> _state.update { it.copy(rumor = rumor) } },
                onFailure = { e -> _events.emit(RumorDetailEvent.Error(e.localizedMessage ?: "Erreur")) },
            )
        }
    }

    fun assessRisk(
        riskLevel: String,
        description: String? = null,
        context: String? = null,
        exposure: String? = null,
    ) {
        _state.update { it.copy(isAssessingRisk = true) }
        viewModelScope.launch {
            cohrmRepository.assessRisk(
                id = rumorId,
                riskLevel = riskLevel,
                riskDescription = description?.ifBlank { null },
                riskContext = context?.ifBlank { null },
                riskExposure = exposure?.ifBlank { null },
            ).fold(
                onSuccess = {
                    _state.update { it.copy(isAssessingRisk = false) }
                    _events.emit(RumorDetailEvent.Success("Évaluation du risque soumise"))
                    loadRumor()
                },
                onFailure = { e ->
                    _state.update { it.copy(isAssessingRisk = false) }
                    _events.emit(RumorDetailEvent.Error(e.localizedMessage ?: "Erreur"))
                },
            )
        }
    }

    fun loadValidations() {
        _state.update { it.copy(isLoadingValidations = true) }
        viewModelScope.launch {
            cohrmRepository.getValidations(rumorId).fold(
                onSuccess = { validations ->
                    _state.update { it.copy(isLoadingValidations = false, validations = validations) }
                },
                onFailure = {
                    _state.update { it.copy(isLoadingValidations = false) }
                },
            )
        }
    }
}
