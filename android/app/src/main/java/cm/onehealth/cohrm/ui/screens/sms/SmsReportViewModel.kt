package cm.onehealth.cohrm.ui.screens.sms

import androidx.lifecycle.ViewModel
import cm.onehealth.cohrm.util.SmsHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject

data class SmsFormState(
    val category: String = "",
    val species: String = "",
    val symptoms: List<String> = emptyList(),
    val region: String = "",
    val description: String = "",
    val affectedCount: String = "",
    val categoryError: String? = null,
    val regionError: String? = null,
    val descriptionError: String? = null,
    val showConfirmDialog: Boolean = false,
)

@HiltViewModel
class SmsReportViewModel @Inject constructor() : ViewModel() {

    private val _state = MutableStateFlow(SmsFormState())
    val state: StateFlow<SmsFormState> = _state.asStateFlow()

    fun updateCategory(category: String) = _state.update { it.copy(category = category, categoryError = null) }
    fun updateSpecies(species: String) = _state.update { it.copy(species = species) }
    fun updateRegion(region: String) = _state.update { it.copy(region = region, regionError = null) }
    fun updateDescription(desc: String) = _state.update { it.copy(description = desc, descriptionError = null) }
    fun updateAffectedCount(count: String) = _state.update { it.copy(affectedCount = count) }
    fun showConfirmDialog() { _state.update { it.copy(showConfirmDialog = true) } }
    fun hideConfirmDialog() { _state.update { it.copy(showConfirmDialog = false) } }

    fun toggleSymptom(symptom: String) {
        _state.update { current ->
            val symptoms = current.symptoms.toMutableList()
            if (symptoms.contains(symptom)) symptoms.remove(symptom) else symptoms.add(symptom)
            current.copy(symptoms = symptoms)
        }
    }

    fun generateSmsText(): String {
        val s = _state.value
        return SmsHelper.generateSms(
            category = s.category,
            species = s.species,
            symptoms = s.symptoms,
            region = s.region,
            description = s.description,
        )
    }

    fun isValid(): Boolean {
        val s = _state.value
        return s.category.isNotBlank() && s.region.isNotBlank()
    }

    fun validate(): Boolean {
        val s = _state.value
        var valid = true
        var newState = s

        if (s.category.isBlank()) {
            newState = newState.copy(categoryError = "required")
            valid = false
        }
        if (s.region.isBlank()) {
            newState = newState.copy(regionError = "required")
            valid = false
        }
        if (s.description.isBlank()) {
            newState = newState.copy(descriptionError = "required")
            valid = false
        }

        _state.value = newState
        return valid
    }
}
