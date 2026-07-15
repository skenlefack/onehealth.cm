package cm.onehealth.cohrm.ui.screens.rumors

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
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
        if (rumorId > 0) loadRumor()
    }

    fun loadRumor() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            cohrmRepository.getRumorDetail(rumorId).fold(
                onSuccess = { rumor -> _state.update { it.copy(isLoading = false, rumor = rumor) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
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
}
