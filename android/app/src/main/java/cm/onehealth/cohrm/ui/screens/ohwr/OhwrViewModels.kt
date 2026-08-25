package cm.onehealth.cohrm.ui.screens.ohwr

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ohwr.*
import cm.onehealth.cohrm.domain.repository.ohwr.OhwrRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// --- Experts List ---

data class OhwrExpertsState(
    val isLoading: Boolean = false,
    val experts: List<OhwrExpertDto> = emptyList(),
    val search: String = "",
    val page: Int = 1,
    val totalPages: Int = 1,
    val isGridView: Boolean = false,
    val category: String? = null,
    val region: String? = null,
)

@HiltViewModel
class OhwrExpertsViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(OhwrExpertsState())
    val state: StateFlow<OhwrExpertsState> = _state.asStateFlow()

    init { load() }

    private fun load() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getExperts(
                page = _state.value.page,
                search = _state.value.search.ifBlank { null },
                category = _state.value.category,
                region = _state.value.region,
            ).fold(
                onSuccess = { resp ->
                    _state.update { it.copy(
                        isLoading = false,
                        experts = if (it.page == 1) resp.data ?: emptyList() else it.experts + (resp.data ?: emptyList()),
                        totalPages = resp.pagination?.pages ?: 1,
                    ) }
                },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }

    fun setSearch(q: String) { _state.update { it.copy(search = q, page = 1, experts = emptyList()) }; load() }
    fun setCategory(c: String?) { _state.update { it.copy(category = c, page = 1, experts = emptyList()) }; load() }
    fun setRegion(r: String?) { _state.update { it.copy(region = r, page = 1, experts = emptyList()) }; load() }
    fun loadMore() { _state.update { it.copy(page = it.page + 1) }; load() }
    fun toggleGridView() { _state.update { it.copy(isGridView = !it.isGridView) } }
}

// --- Expert Detail ---

data class OhwrExpertDetailState(
    val isLoading: Boolean = false,
    val expert: OhwrExpertDto? = null,
    val error: String? = null,
)

@HiltViewModel
class OhwrExpertDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: OhwrRepository,
) : ViewModel() {
    private val expertId: Int = savedStateHandle.get<Int>("expertId") ?: 0
    private val _state = MutableStateFlow(OhwrExpertDetailState())
    val state: StateFlow<OhwrExpertDetailState> = _state.asStateFlow()

    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getExpertDetail(expertId).fold(
                onSuccess = { expert -> _state.update { it.copy(isLoading = false, expert = expert) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
}

// --- Organizations ---

data class OhwrOrgsState(
    val isLoading: Boolean = false,
    val organizations: List<OhwrOrganizationDto> = emptyList(),
    val search: String = "",
    val page: Int = 1,
    val totalPages: Int = 1,
    val isGridView: Boolean = false,
    val type: String? = null,
    val region: String? = null,
)

@HiltViewModel
class OhwrOrganizationsViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(OhwrOrgsState())
    val state: StateFlow<OhwrOrgsState> = _state.asStateFlow()

    init { load() }

    private fun load() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getOrganizations(
                page = _state.value.page,
                search = _state.value.search.ifBlank { null },
                type = _state.value.type,
                region = _state.value.region,
            ).fold(
                onSuccess = { resp ->
                    _state.update { it.copy(
                        isLoading = false,
                        organizations = if (it.page == 1) resp.data ?: emptyList() else it.organizations + (resp.data ?: emptyList()),
                        totalPages = resp.pagination?.pages ?: 1,
                    ) }
                },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }

    fun setSearch(q: String) { _state.update { it.copy(search = q, page = 1, organizations = emptyList()) }; load() }
    fun setType(t: String?) { _state.update { it.copy(type = t, page = 1, organizations = emptyList()) }; load() }
    fun setRegion(r: String?) { _state.update { it.copy(region = r, page = 1, organizations = emptyList()) }; load() }
    fun loadMore() { _state.update { it.copy(page = it.page + 1) }; load() }
    fun toggleGridView() { _state.update { it.copy(isGridView = !it.isGridView) } }
}

// --- Materials ---

data class OhwrMaterialsState(
    val isLoading: Boolean = false,
    val materials: List<OhwrMaterialDto> = emptyList(),
    val search: String = "",
    val page: Int = 1,
    val totalPages: Int = 1,
    val isGridView: Boolean = false,
    val type: String? = null,
    val region: String? = null,
)

@HiltViewModel
class OhwrMaterialsViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(OhwrMaterialsState())
    val state: StateFlow<OhwrMaterialsState> = _state.asStateFlow()

    init { load() }

    private fun load() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getMaterials(
                page = _state.value.page,
                search = _state.value.search.ifBlank { null },
                type = _state.value.type,
                region = _state.value.region,
            ).fold(
                onSuccess = { resp ->
                    _state.update { it.copy(
                        isLoading = false,
                        materials = if (it.page == 1) resp.data ?: emptyList() else it.materials + (resp.data ?: emptyList()),
                        totalPages = resp.pagination?.pages ?: 1,
                    ) }
                },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }

    fun setSearch(q: String) { _state.update { it.copy(search = q, page = 1, materials = emptyList()) }; load() }
    fun setType(t: String?) { _state.update { it.copy(type = t, page = 1, materials = emptyList()) }; load() }
    fun setRegion(r: String?) { _state.update { it.copy(region = r, page = 1, materials = emptyList()) }; load() }
    fun loadMore() { _state.update { it.copy(page = it.page + 1) }; load() }
    fun toggleGridView() { _state.update { it.copy(isGridView = !it.isGridView) } }
}

// --- Documents ---

data class OhwrDocsState(
    val isLoading: Boolean = false,
    val documents: List<OhwrDocumentDto> = emptyList(),
    val search: String = "",
    val page: Int = 1,
    val totalPages: Int = 1,
    val isGridView: Boolean = false,
    val type: String? = null,
)

@HiltViewModel
class OhwrDocumentsViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(OhwrDocsState())
    val state: StateFlow<OhwrDocsState> = _state.asStateFlow()

    init { load() }

    private fun load() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getDocuments(
                page = _state.value.page,
                search = _state.value.search.ifBlank { null },
                type = _state.value.type,
            ).fold(
                onSuccess = { resp ->
                    _state.update { it.copy(
                        isLoading = false,
                        documents = if (it.page == 1) resp.data ?: emptyList() else it.documents + (resp.data ?: emptyList()),
                        totalPages = resp.pagination?.pages ?: 1,
                    ) }
                },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }

    fun setSearch(q: String) { _state.update { it.copy(search = q, page = 1, documents = emptyList()) }; load() }
    fun setType(t: String?) { _state.update { it.copy(type = t, page = 1, documents = emptyList()) }; load() }
    fun loadMore() { _state.update { it.copy(page = it.page + 1) }; load() }
    fun toggleGridView() { _state.update { it.copy(isGridView = !it.isGridView) } }
}

// --- Map ---

data class OhwrMapState(
    val isLoading: Boolean = false,
    val markers: List<OhwrMarkerDto> = emptyList(),
    val showExperts: Boolean = true,
    val showOrganizations: Boolean = true,
    val showMaterials: Boolean = true,
    val selectedMarker: OhwrMarkerDto? = null,
)

@HiltViewModel
class OhwrMapViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(OhwrMapState())
    val state: StateFlow<OhwrMapState> = _state.asStateFlow()

    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getMarkers().fold(
                onSuccess = { markers -> _state.update { it.copy(isLoading = false, markers = markers) } },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }

    fun toggleExperts() { _state.update { it.copy(showExperts = !it.showExperts) } }
    fun toggleOrganizations() { _state.update { it.copy(showOrganizations = !it.showOrganizations) } }
    fun toggleMaterials() { _state.update { it.copy(showMaterials = !it.showMaterials) } }
    fun selectMarker(marker: OhwrMarkerDto?) { _state.update { it.copy(selectedMarker = marker) } }

    val filteredMarkers: List<OhwrMarkerDto> get() {
        val s = _state.value
        return s.markers.filter { m ->
            when (m.type) {
                "human" -> s.showExperts
                "organization" -> s.showOrganizations
                "material" -> s.showMaterials
                else -> true
            }
        }
    }
}

// --- Submit Resource ---

data class OhwrSubmitState(
    val resourceType: String = "",
    val fields: Map<String, String> = emptyMap(),
    val isSubmitting: Boolean = false,
    val success: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class OhwrSubmitViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(OhwrSubmitState())
    val state: StateFlow<OhwrSubmitState> = _state.asStateFlow()

    fun setResourceType(type: String) { _state.update { it.copy(resourceType = type, fields = emptyMap(), error = null, success = false) } }
    fun setField(key: String, value: String) { _state.update { it.copy(fields = it.fields + (key to value)) } }

    fun submit() {
        _state.update { it.copy(isSubmitting = true, error = null) }
        viewModelScope.launch {
            val result = when (_state.value.resourceType) {
                "expert" -> repository.submitExpert(_state.value.fields)
                "organization" -> repository.submitOrganization(_state.value.fields)
                else -> Result.failure(Exception("Unknown type"))
            }
            result.fold(
                onSuccess = { _state.update { it.copy(isSubmitting = false, success = true) } },
                onFailure = { e -> _state.update { it.copy(isSubmitting = false, error = e.localizedMessage) } },
            )
        }
    }
}

// --- My Submissions ---

data class OhwrMySubmissionsState(
    val isLoading: Boolean = false,
    val submissions: List<OhwrSubmissionDto> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class OhwrMySubmissionsViewModel @Inject constructor(
    private val repository: OhwrRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(OhwrMySubmissionsState())
    val state: StateFlow<OhwrMySubmissionsState> = _state.asStateFlow()

    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getMySubmissions().fold(
                onSuccess = { subs -> _state.update { it.copy(isLoading = false, submissions = subs) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
}

// --- Document Detail ---

data class OhwrDocDetailState(
    val isLoading: Boolean = false,
    val document: OhwrDocumentDto? = null,
    val error: String? = null,
)

@HiltViewModel
class OhwrDocDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: OhwrRepository,
) : ViewModel() {
    private val docId: Int = savedStateHandle.get<Int>("documentId") ?: 0
    private val _state = MutableStateFlow(OhwrDocDetailState())
    val state: StateFlow<OhwrDocDetailState> = _state.asStateFlow()

    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repository.getDocumentDetail(docId).fold(
                onSuccess = { doc -> _state.update { it.copy(isLoading = false, document = doc) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
}
