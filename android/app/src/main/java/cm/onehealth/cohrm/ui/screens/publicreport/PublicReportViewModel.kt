package cm.onehealth.cohrm.ui.screens.publicreport

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.PublicReportRequest
import cm.onehealth.cohrm.data.remote.dto.RegionItem
import cm.onehealth.cohrm.data.remote.dto.TrackingData
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

data class PublicReportState(
    val phone: String = "",
    val name: String = "",
    val region: String = "",
    val description: String = "",
    val category: String = "other",
    val isSubmitting: Boolean = false,
    val trackingCode: String? = null,
    val trackInput: String = "",
    val isTracking: Boolean = false,
    val trackingResult: TrackingData? = null,
    val regions: List<RegionItem> = emptyList(),
    val isLoadingRegions: Boolean = false,
    val phoneError: Boolean = false,
    val descriptionError: Boolean = false,
)

sealed interface PublicReportEvent {
    data class Submitted(val code: String) : PublicReportEvent
    data class TrackingFound(val data: TrackingData) : PublicReportEvent
    data class Error(val message: String) : PublicReportEvent
}

@HiltViewModel
class PublicReportViewModel @Inject constructor(
    private val apiService: ApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(PublicReportState())
    val state: StateFlow<PublicReportState> = _state.asStateFlow()

    private val _events = MutableSharedFlow<PublicReportEvent>()
    val events: SharedFlow<PublicReportEvent> = _events.asSharedFlow()

    init {
        loadRegions()
    }

    private fun loadRegions() {
        viewModelScope.launch {
            _state.update { it.copy(isLoadingRegions = true) }
            try {
                val response = apiService.getPublicRegions()
                if (response.success) {
                    _state.update {
                        it.copy(
                            regions = response.data ?: emptyList(),
                            isLoadingRegions = false,
                        )
                    }
                } else {
                    _state.update { it.copy(isLoadingRegions = false) }
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoadingRegions = false) }
            }
        }
    }

    fun updatePhone(value: String) = _state.update { it.copy(phone = value, phoneError = false) }
    fun updateName(value: String) = _state.update { it.copy(name = value) }
    fun updateRegion(value: String) = _state.update { it.copy(region = value) }
    fun updateDescription(value: String) = _state.update { it.copy(description = value, descriptionError = false) }
    fun updateCategory(value: String) = _state.update { it.copy(category = value) }
    fun updateTrackInput(value: String) = _state.update { it.copy(trackInput = value) }

    fun submitPublicReport() {
        val s = _state.value
        var hasError = false

        if (s.phone.isBlank()) {
            _state.update { it.copy(phoneError = true) }
            hasError = true
        }
        if (s.description.isBlank()) {
            _state.update { it.copy(descriptionError = true) }
            hasError = true
        }
        if (hasError) return

        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true) }
            try {
                val request = PublicReportRequest(
                    reporterPhone = s.phone,
                    reporterName = s.name.ifBlank { null },
                    region = s.region.ifBlank { null },
                    description = s.description,
                    category = s.category.ifBlank { "other" },
                )
                val response = apiService.submitPublicReport(request)
                if (response.success) {
                    val code = response.data?.code ?: ""
                    _state.update {
                        it.copy(
                            isSubmitting = false,
                            trackingCode = code,
                        )
                    }
                    _events.emit(PublicReportEvent.Submitted(code))
                } else {
                    _state.update { it.copy(isSubmitting = false) }
                    _events.emit(PublicReportEvent.Error(response.message ?: "Erreur lors de la soumission"))
                }
            } catch (e: Exception) {
                _state.update { it.copy(isSubmitting = false) }
                _events.emit(PublicReportEvent.Error(e.message ?: "Erreur de connexion"))
            }
        }
    }

    fun trackReport() {
        val code = _state.value.trackInput.trim()
        if (code.isBlank()) return

        viewModelScope.launch {
            _state.update { it.copy(isTracking = true, trackingResult = null) }
            try {
                val response = apiService.trackPublicReport(code)
                if (response.success && response.data != null) {
                    _state.update {
                        it.copy(
                            isTracking = false,
                            trackingResult = response.data,
                        )
                    }
                    _events.emit(PublicReportEvent.TrackingFound(response.data))
                } else {
                    _state.update { it.copy(isTracking = false) }
                    _events.emit(PublicReportEvent.Error(response.message ?: "Signalement introuvable"))
                }
            } catch (e: Exception) {
                _state.update { it.copy(isTracking = false) }
                _events.emit(PublicReportEvent.Error(e.message ?: "Erreur de connexion"))
            }
        }
    }

    fun resetForm() {
        _state.update {
            PublicReportState(regions = it.regions)
        }
    }
}
