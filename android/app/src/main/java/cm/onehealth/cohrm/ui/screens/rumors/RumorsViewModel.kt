package cm.onehealth.cohrm.ui.screens.rumors

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import cm.onehealth.cohrm.util.NetworkMonitor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RumorsUiState(
    val isLoading: Boolean = false,
    val rumors: List<RumorDetail> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val totalPages: Int = 1,
    val error: String? = null,
    val filterStatus: String? = null,
    val filterCategory: String? = null,
    val filterRegion: String? = null,
    val filterPriority: String? = null,
    val filterSource: String? = null,
    val searchQuery: String = "",
    val isLoadingMore: Boolean = false,
    val isOfflineData: Boolean = false,
    val selectedIds: Set<Int> = emptySet(),
    val isSelectionMode: Boolean = false,
    val isBatchActionLoading: Boolean = false,
    val batchResultMessage: String? = null,
)

sealed interface RumorsEvent {
    data class BatchResult(val message: String) : RumorsEvent
    data class Error(val message: String) : RumorsEvent
}

@HiltViewModel
class RumorsViewModel @Inject constructor(
    private val cohrmRepository: CohrmRepository,
    private val networkMonitor: NetworkMonitor,
) : ViewModel() {

    private val _state = MutableStateFlow(RumorsUiState())
    val state: StateFlow<RumorsUiState> = _state.asStateFlow()

    private val _events = MutableSharedFlow<RumorsEvent>()
    val events: SharedFlow<RumorsEvent> = _events.asSharedFlow()

    val isOnline: StateFlow<Boolean> = networkMonitor.isOnline

    init {
        loadRumors()
    }

    fun loadRumors(resetPage: Boolean = true) {
        if (resetPage) {
            _state.update { it.copy(isLoading = true, page = 1, error = null) }
        }
        viewModelScope.launch {
            val s = _state.value
            cohrmRepository.getRumors(
                page = if (resetPage) 1 else s.page,
                perPage = 20,
                status = s.filterStatus,
                category = s.filterCategory,
                region = s.filterRegion,
                priority = s.filterPriority,
                source = s.filterSource,
                search = s.searchQuery.ifBlank { null },
            ).fold(
                onSuccess = { data ->
                    _state.update {
                        if (resetPage) {
                            it.copy(
                                isLoading = false,
                                isLoadingMore = false,
                                rumors = data.rumors,
                                total = data.total,
                                page = data.page,
                                totalPages = data.totalPages,
                                isOfflineData = false,
                            )
                        } else {
                            it.copy(
                                isLoading = false,
                                isLoadingMore = false,
                                rumors = it.rumors + data.rumors,
                                total = data.total,
                                page = data.page,
                                totalPages = data.totalPages,
                                isOfflineData = false,
                            )
                        }
                    }
                },
                onFailure = { error ->
                    // If network call fails and we have no data, try loading from cache
                    if (resetPage && _state.value.rumors.isEmpty()) {
                        loadCachedRumors(error.localizedMessage)
                    } else {
                        _state.update {
                            it.copy(isLoading = false, isLoadingMore = false, error = error.localizedMessage)
                        }
                    }
                },
            )
        }
    }

    private fun loadCachedRumors(networkError: String?) {
        viewModelScope.launch {
            try {
                val cached = cohrmRepository.getCachedRumors().first()
                if (cached.isNotEmpty()) {
                    _state.update {
                        it.copy(
                            isLoading = false,
                            rumors = cached,
                            total = cached.size,
                            page = 1,
                            totalPages = 1,
                            error = null,
                            isOfflineData = true,
                        )
                    }
                } else {
                    _state.update {
                        it.copy(isLoading = false, error = networkError)
                    }
                }
            } catch (_: Exception) {
                _state.update {
                    it.copy(isLoading = false, error = networkError)
                }
            }
        }
    }

    fun loadMore() {
        val s = _state.value
        if (s.isLoadingMore || s.page >= s.totalPages || s.isOfflineData) return
        _state.update { it.copy(isLoadingMore = true, page = it.page + 1) }
        loadRumors(resetPage = false)
    }

    fun setFilter(status: String? = null, category: String? = null, region: String? = null, priority: String? = null, source: String? = null) {
        _state.update {
            it.copy(
                filterStatus = status,
                filterCategory = category,
                filterRegion = region,
                filterPriority = priority,
                filterSource = source,
            )
        }
        loadRumors()
    }

    fun setSearch(query: String) {
        _state.update { it.copy(searchQuery = query) }
        loadRumors()
    }

    fun clearFilters() {
        _state.update {
            it.copy(
                filterStatus = null,
                filterCategory = null,
                filterRegion = null,
                filterPriority = null,
                filterSource = null,
                searchQuery = "",
            )
        }
        loadRumors()
    }

    // --- Selection mode ---

    fun toggleSelection(id: Int) {
        _state.update {
            val newSet = it.selectedIds.toMutableSet()
            if (newSet.contains(id)) newSet.remove(id) else newSet.add(id)
            it.copy(selectedIds = newSet, isSelectionMode = newSet.isNotEmpty())
        }
    }

    fun selectAll() {
        _state.update { it.copy(selectedIds = it.rumors.map { r -> r.id }.toSet(), isSelectionMode = true) }
    }

    fun clearSelection() {
        _state.update { it.copy(selectedIds = emptySet(), isSelectionMode = false) }
    }

    fun batchUpdateStatus(status: String) {
        val ids = _state.value.selectedIds.toList()
        if (ids.isEmpty()) return
        _state.update { it.copy(isBatchActionLoading = true) }
        val label = when (status) {
            "investigating" -> "investigation"
            "confirmed" -> "confirmation"
            "closed" -> "cloture"
            else -> "mise a jour"
        }
        viewModelScope.launch {
            var success = 0
            var failed = 0
            for (id in ids) {
                cohrmRepository.updateRumor(id, status = status).fold(
                    onSuccess = { success++ },
                    onFailure = { failed++ },
                )
            }
            _state.update { it.copy(isBatchActionLoading = false, selectedIds = emptySet(), isSelectionMode = false) }
            _events.emit(RumorsEvent.BatchResult("$label: $success/${ids.size} reussie(s)" + if (failed > 0) " ($failed echec)" else ""))
            loadRumors()
        }
    }

    fun batchDelete() {
        val ids = _state.value.selectedIds.toList()
        if (ids.isEmpty()) return
        _state.update { it.copy(isBatchActionLoading = true) }
        viewModelScope.launch {
            var success = 0
            var failed = 0
            for (id in ids) {
                cohrmRepository.deleteRumor(id).fold(
                    onSuccess = { success++ },
                    onFailure = { failed++ },
                )
            }
            _state.update { it.copy(isBatchActionLoading = false, selectedIds = emptySet(), isSelectionMode = false) }
            _events.emit(RumorsEvent.BatchResult("Suppression: $success/${ids.size} reussie(s)" + if (failed > 0) " ($failed echec)" else ""))
            loadRumors()
        }
    }

    fun batchValidate(decision: String) {
        val ids = _state.value.selectedIds.toList()
        if (ids.isEmpty()) return
        _state.update { it.copy(isBatchActionLoading = true) }
        val label = if (decision == "approved") "Validation" else "Rejet"
        viewModelScope.launch {
            var success = 0
            var failed = 0
            for (id in ids) {
                cohrmRepository.validateRumor(id, decision = decision).fold(
                    onSuccess = { success++ },
                    onFailure = { failed++ },
                )
            }
            _state.update { it.copy(isBatchActionLoading = false, selectedIds = emptySet(), isSelectionMode = false) }
            _events.emit(RumorsEvent.BatchResult("$label: $success/${ids.size} reussie(s)" + if (failed > 0) " ($failed echec)" else ""))
            loadRumors()
        }
    }
}
