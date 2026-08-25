package cm.onehealth.cohrm.ui.screens.platform

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.PostDto
import cm.onehealth.cohrm.data.remote.PostsApiService
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import cm.onehealth.cohrm.domain.repository.ohwr.OhwrRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PlatformHomeState(
    val isLoading: Boolean = false,
    val cohrmRumorCount: Int = 0,
    val cohrmTodayCount: Int = 0,
    val elCourseCount: Int = 0,
    val ohwrExpertCount: Int = 0,
    val ohwrOrgCount: Int = 0,
    val latestPosts: List<PostDto> = emptyList(),
)

@HiltViewModel
class PlatformHomeViewModel @Inject constructor(
    private val cohrmRepository: CohrmRepository,
    private val ohwrRepository: OhwrRepository,
    private val postsApiService: PostsApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(PlatformHomeState())
    val state: StateFlow<PlatformHomeState> = _state.asStateFlow()

    init {
        loadStats()
    }

    private fun loadStats() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            // Load COHRM stats
            cohrmRepository.getDashboard(null).fold(
                onSuccess = { data ->
                    _state.update {
                        it.copy(
                            cohrmRumorCount = data.stats?.total ?: 0,
                            cohrmTodayCount = data.stats?.todayCount ?: 0,
                        )
                    }
                },
                onFailure = {},
            )
        }
        viewModelScope.launch {
            // Load latest posts
            try {
                val response = postsApiService.getPosts(limit = 5)
                if (response.success) _state.update { it.copy(latestPosts = response.data ?: emptyList()) }
            } catch (_: Exception) {}
        }
        viewModelScope.launch {
            // Load OHWR stats
            ohwrRepository.getStats().fold(
                onSuccess = { stats ->
                    _state.update {
                        it.copy(
                            ohwrExpertCount = stats.humanResources?.total ?: 0,
                            ohwrOrgCount = stats.organizations?.total ?: 0,
                            isLoading = false,
                        )
                    }
                },
                onFailure = {
                    _state.update { it.copy(isLoading = false) }
                },
            )
        }
    }
}
