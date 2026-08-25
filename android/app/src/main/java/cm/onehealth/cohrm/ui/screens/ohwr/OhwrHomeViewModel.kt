package cm.onehealth.cohrm.ui.screens.ohwr

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ohwr.OhwrDocumentDto
import cm.onehealth.cohrm.domain.repository.ohwr.OhwrRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OhwrHomeState(
    val expertCount: Int = 0,
    val orgCount: Int = 0,
    val materialCount: Int = 0,
    val documentCount: Int = 0,
    val markerCount: Int = 0,
    val recentDocuments: List<OhwrDocumentDto> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class OhwrHomeViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(OhwrHomeState())
    val state: StateFlow<OhwrHomeState> = _state.asStateFlow()

    init { loadData() }

    private fun loadData() {
        viewModelScope.launch {
            repository.getStats().fold(
                onSuccess = { stats ->
                    _state.update { it.copy(
                        expertCount = stats.humanResources?.total ?: 0,
                        orgCount = stats.organizations?.total ?: 0,
                        materialCount = stats.materialResources?.total ?: 0,
                        documentCount = stats.documents?.total ?: 0,
                    ) }
                },
                onFailure = { e -> _state.update { it.copy(error = e.localizedMessage) } },
            )
        }
        viewModelScope.launch {
            repository.getMarkers().fold(
                onSuccess = { markers -> _state.update { it.copy(markerCount = markers.size) } },
                onFailure = {},
            )
        }
        viewModelScope.launch {
            repository.getRecentDocuments(3).fold(
                onSuccess = { docs -> _state.update { it.copy(recentDocuments = docs) } },
                onFailure = {},
            )
        }
    }
}
