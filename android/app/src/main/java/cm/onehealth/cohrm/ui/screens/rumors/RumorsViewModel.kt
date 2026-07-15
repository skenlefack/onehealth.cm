package cm.onehealth.cohrm.ui.screens.rumors

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
)

@HiltViewModel
class RumorsViewModel @Inject constructor(
    private val cohrmRepository: CohrmRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RumorsUiState())
    val state: StateFlow<RumorsUiState> = _state.asStateFlow()

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
                            )
                        } else {
                            it.copy(
                                isLoading = false,
                                isLoadingMore = false,
                                rumors = it.rumors + data.rumors,
                                total = data.total,
                                page = data.page,
                                totalPages = data.totalPages,
                            )
                        }
                    }
                },
                onFailure = { error ->
                    _state.update { it.copy(isLoading = false, isLoadingMore = false, error = error.localizedMessage) }
                },
            )
        }
    }

    fun loadMore() {
        val s = _state.value
        if (s.isLoadingMore || s.page >= s.totalPages) return
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
}
