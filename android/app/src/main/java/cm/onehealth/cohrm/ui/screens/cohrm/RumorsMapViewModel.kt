package cm.onehealth.cohrm.ui.screens.cohrm

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RumorsMapState(
    val isLoading: Boolean = false,
    val rumors: List<RumorDetail> = emptyList(),
    val statusFilter: String? = null,
    val error: String? = null,
)

@HiltViewModel
class RumorsMapViewModel @Inject constructor(
    private val repository: CohrmRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RumorsMapState())
    val state: StateFlow<RumorsMapState> = _state.asStateFlow()

    init {
        loadRumors()
    }

    private fun loadRumors() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            repository.getRumors(page = 1, perPage = 200).fold(
                onSuccess = { data ->
                    _state.update {
                        it.copy(
                            isLoading = false,
                            rumors = data.rumors.filter { r -> r.latitude != null && r.longitude != null },
                        )
                    }
                },
                onFailure = { e ->
                    _state.update { it.copy(isLoading = false, error = e.localizedMessage) }
                },
            )
        }
    }

    fun setStatusFilter(status: String?) {
        _state.update { it.copy(statusFilter = status) }
    }

    val filteredRumors: List<RumorDetail>
        get() {
            val s = _state.value
            return if (s.statusFilter == null) s.rumors
            else s.rumors.filter { it.status == s.statusFilter }
        }
}
