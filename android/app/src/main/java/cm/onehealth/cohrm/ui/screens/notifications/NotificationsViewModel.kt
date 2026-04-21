package cm.onehealth.cohrm.ui.screens.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.NotificationItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationsState(
    val notifications: List<NotificationItem> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: String? = null,
    val currentPage: Int = 1,
    val totalPages: Int = 1,
    val totalCount: Int = 0,
    val canLoadMore: Boolean = false,
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val apiService: ApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(NotificationsState())
    val state: StateFlow<NotificationsState> = _state.asStateFlow()

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    init {
        loadNotifications()
    }

    fun loadNotifications() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            try {
                val response = apiService.getMyNotifications(page = 1, limit = 20)
                if (response.success) {
                    val items = response.data ?: emptyList()
                    val pagination = response.pagination
                    val totalPages = pagination?.pages ?: 1
                    _state.update {
                        it.copy(
                            notifications = items,
                            isLoading = false,
                            currentPage = 1,
                            totalPages = totalPages,
                            totalCount = pagination?.total ?: items.size,
                            canLoadMore = 1 < totalPages,
                        )
                    }
                    _unreadCount.value = items.count { it.status == "pending" }
                } else {
                    _state.update {
                        it.copy(isLoading = false, error = "Impossible de charger les notifications")
                    }
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Erreur de connexion",
                    )
                }
            }
        }
    }

    fun loadMore() {
        val current = _state.value
        if (current.isLoadingMore || !current.canLoadMore) return

        val nextPage = current.currentPage + 1
        viewModelScope.launch {
            _state.update { it.copy(isLoadingMore = true) }
            try {
                val response = apiService.getMyNotifications(page = nextPage, limit = 20)
                if (response.success) {
                    val newItems = response.data ?: emptyList()
                    val pagination = response.pagination
                    val totalPages = pagination?.pages ?: current.totalPages
                    _state.update {
                        it.copy(
                            notifications = it.notifications + newItems,
                            isLoadingMore = false,
                            currentPage = nextPage,
                            totalPages = totalPages,
                            totalCount = pagination?.total ?: it.totalCount,
                            canLoadMore = nextPage < totalPages,
                        )
                    }
                } else {
                    _state.update { it.copy(isLoadingMore = false) }
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoadingMore = false) }
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, error = null) }
            try {
                val response = apiService.getMyNotifications(page = 1, limit = 20)
                if (response.success) {
                    val items = response.data ?: emptyList()
                    val pagination = response.pagination
                    val totalPages = pagination?.pages ?: 1
                    _state.update {
                        it.copy(
                            notifications = items,
                            isRefreshing = false,
                            currentPage = 1,
                            totalPages = totalPages,
                            totalCount = pagination?.total ?: items.size,
                            canLoadMore = 1 < totalPages,
                        )
                    }
                    _unreadCount.value = items.count { it.status == "pending" }
                } else {
                    _state.update { it.copy(isRefreshing = false) }
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isRefreshing = false,
                        error = e.localizedMessage ?: "Erreur de connexion",
                    )
                }
            }
        }
    }
}
