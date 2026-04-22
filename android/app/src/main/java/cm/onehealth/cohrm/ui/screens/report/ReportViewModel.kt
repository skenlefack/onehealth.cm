package cm.onehealth.cohrm.ui.screens.report

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.domain.model.Photo
import cm.onehealth.cohrm.domain.model.Report
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.domain.repository.ReportRepository
import cm.onehealth.cohrm.util.DeviceHelper
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

data class ReportFormState(
    val id: String = "",
    val category: String = "",
    val species: String = "",
    val region: String = "",
    val department: String = "",
    val district: String = "",
    val latitude: Double? = null,
    val longitude: Double? = null,
    val title: String = "",
    val description: String = "",
    val symptoms: List<String> = emptyList(),
    val affectedCount: String = "",
    val photos: List<Photo> = emptyList(),
    val dateDetection: String = "",
    val messageReceived: String = "",
    val themes: List<String> = emptyList(),
    val gravityComment: String = "",
    val sourceType: String = "mobile_app",
    val arrondissement: String = "",
    val commune: String = "",
    val aireSante: String = "",
    val currentStep: Int = 1,
    val isSubmitting: Boolean = false,
    val submissionProgress: Float? = null,
)

sealed interface ReportEvent {
    data object Saved : ReportEvent
    data object Submitted : ReportEvent
    data class Error(val message: String) : ReportEvent
}

@HiltViewModel
class ReportViewModel @Inject constructor(
    private val reportRepository: ReportRepository,
    private val deviceHelper: DeviceHelper,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _state = MutableStateFlow(ReportFormState())
    val state: StateFlow<ReportFormState> = _state.asStateFlow()

    private val _events = MutableSharedFlow<ReportEvent>()
    val events: SharedFlow<ReportEvent> = _events.asSharedFlow()

    init {
        val reportId = savedStateHandle.get<String>("id")
        if (reportId != null) {
            viewModelScope.launch {
                reportRepository.getReport(reportId)?.let { report ->
                    _state.value = ReportFormState(
                        id = report.id,
                        category = report.category,
                        species = report.species,
                        region = report.region,
                        department = report.department,
                        district = report.district,
                        latitude = report.latitude,
                        longitude = report.longitude,
                        title = report.title,
                        description = report.description,
                        symptoms = report.symptoms,
                        affectedCount = report.affectedCount?.toString() ?: "",
                        photos = report.photos,
                        dateDetection = report.dateDetection,
                        messageReceived = report.messageReceived,
                        themes = report.themes,
                        gravityComment = report.gravityComment,
                        sourceType = report.sourceType,
                        arrondissement = report.arrondissement,
                        commune = report.commune,
                        aireSante = report.aireSante,
                    )
                }
            }
        }
    }

    fun updateCategory(category: String) = _state.update { it.copy(category = category) }
    fun updateSpecies(species: String) = _state.update { it.copy(species = species) }
    fun updateRegion(region: String) = _state.update { it.copy(region = region, department = "", district = "") }
    fun updateDepartment(department: String) = _state.update { it.copy(department = department) }
    fun updateDistrict(district: String) = _state.update { it.copy(district = district) }
    fun updateLocation(lat: Double, lng: Double) = _state.update { it.copy(latitude = lat, longitude = lng) }
    fun updateTitle(title: String) = _state.update { it.copy(title = title) }
    fun updateDescription(desc: String) = _state.update { it.copy(description = desc) }
    fun updateAffectedCount(count: String) = _state.update { it.copy(affectedCount = count) }
    fun updateDateDetection(value: String) = _state.update { it.copy(dateDetection = value) }
    fun updateMessageReceived(value: String) = _state.update { it.copy(messageReceived = value) }
    fun updateThemes(value: List<String>) = _state.update { it.copy(themes = value) }
    fun toggleTheme(theme: String) = _state.update {
        val current = it.themes.toMutableList()
        if (current.contains(theme)) current.remove(theme) else current.add(theme)
        it.copy(themes = current)
    }
    fun updateGravityComment(value: String) = _state.update { it.copy(gravityComment = value) }
    fun updateSourceType(value: String) = _state.update { it.copy(sourceType = value) }
    fun updateArrondissement(value: String) = _state.update { it.copy(arrondissement = value) }
    fun updateCommune(value: String) = _state.update { it.copy(commune = value) }
    fun updateAireSante(value: String) = _state.update { it.copy(aireSante = value) }

    fun toggleSymptom(symptom: String) {
        _state.update { current ->
            val symptoms = current.symptoms.toMutableList()
            if (symptoms.contains(symptom)) symptoms.remove(symptom) else symptoms.add(symptom)
            current.copy(symptoms = symptoms)
        }
    }

    fun addPhoto(photo: Photo) {
        _state.update { current ->
            if (current.photos.size < 3) {
                current.copy(photos = current.photos + photo)
            } else current
        }
    }

    fun removePhoto(photoId: String) {
        _state.update { current ->
            current.copy(photos = current.photos.filter { it.id != photoId })
        }
    }

    fun nextStep() = _state.update { it.copy(currentStep = (it.currentStep + 1).coerceAtMost(6)) }
    fun previousStep() = _state.update { it.copy(currentStep = (it.currentStep - 1).coerceAtLeast(1)) }

    fun canProceedFromStep(step: Int): Boolean {
        val s = _state.value
        return when (step) {
            1 -> s.category.isNotBlank()
            2 -> s.region.isNotBlank()
            3 -> true // Source fields are all optional
            4 -> s.title.isNotBlank()
            5 -> true // Photos are optional
            else -> true
        }
    }

    fun saveDraft() {
        viewModelScope.launch {
            val report = buildReport(SyncStatus.DRAFT)
            reportRepository.saveReport(report)
            _events.emit(ReportEvent.Saved)
        }
    }

    fun submit() {
        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true, submissionProgress = 0f) }
            try {
                val report = buildReport(SyncStatus.PENDING)
                _state.update { it.copy(submissionProgress = 0.2f) }
                val id = reportRepository.saveReport(report)
                _state.update { it.copy(submissionProgress = 0.5f) }
                val result = reportRepository.submitReport(id)
                _state.update { it.copy(submissionProgress = 1f) }
                if (result.isSuccess) {
                    _events.emit(ReportEvent.Submitted)
                } else {
                    // Saved as pending, will sync later
                    _events.emit(ReportEvent.Submitted)
                }
            } catch (e: Exception) {
                _events.emit(ReportEvent.Error(e.message ?: "Unknown error"))
            } finally {
                _state.update { it.copy(isSubmitting = false, submissionProgress = null) }
            }
        }
    }

    private suspend fun buildReport(status: SyncStatus): Report {
        val s = _state.value
        return Report(
            id = s.id.ifBlank { java.util.UUID.randomUUID().toString() },
            title = s.title,
            description = s.description,
            category = s.category,
            species = s.species,
            region = s.region,
            department = s.department,
            district = s.district,
            latitude = s.latitude,
            longitude = s.longitude,
            symptoms = s.symptoms,
            affectedCount = s.affectedCount.toIntOrNull(),
            dateDetection = s.dateDetection,
            messageReceived = s.messageReceived,
            themes = s.themes,
            gravityComment = s.gravityComment,
            sourceType = s.sourceType,
            arrondissement = s.arrondissement,
            commune = s.commune,
            aireSante = s.aireSante,
            deviceId = deviceHelper.getDeviceId(),
            syncStatus = status,
            photos = s.photos,
        )
    }
}
