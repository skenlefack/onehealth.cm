package cm.onehealth.cohrm.ui.screens.scanner

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.dto.ScanDetail
import cm.onehealth.cohrm.domain.repository.ScanRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ScanDetailUiState(
    val isLoading: Boolean = true,
    val detail: ScanDetail? = null,
    val error: String? = null,
)

@HiltViewModel
class ScanDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val scanRepository: ScanRepository,
) : ViewModel() {

    private val scanId: Int = savedStateHandle.get<Int>("scanId") ?: 0

    private val _state = MutableStateFlow(ScanDetailUiState())
    val state: StateFlow<ScanDetailUiState> = _state.asStateFlow()

    init { loadDetail() }

    fun loadDetail() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            scanRepository.getScanDetail(scanId).fold(
                onSuccess = { detail -> _state.update { it.copy(isLoading = false, detail = detail) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
}
