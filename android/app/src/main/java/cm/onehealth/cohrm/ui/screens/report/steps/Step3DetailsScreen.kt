package cm.onehealth.cohrm.ui.screens.report.steps

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.domain.model.SymptomCode
import cm.onehealth.cohrm.ui.screens.report.ReportFormState
import cm.onehealth.cohrm.ui.screens.report.ReportViewModel

data class SymptomOption(val code: String, val labelRes: Int)
data class ThemeOption(val code: String, val labelRes: Int)

private val themeOptions = listOf(
    ThemeOption("suspect_case_human", R.string.theme_suspect_case_human),
    ThemeOption("human_death", R.string.theme_human_death),
    ThemeOption("animal_death", R.string.theme_animal_death),
    ThemeOption("vaccine_reluctance", R.string.theme_vaccine_reluctance),
    ThemeOption("disease_denial", R.string.theme_disease_denial),
    ThemeOption("stigmatization", R.string.theme_stigmatization),
    ThemeOption("conspiracy_theory", R.string.theme_conspiracy_theory),
    ThemeOption("natural_disasters", R.string.theme_natural_disasters),
)

private val symptomOptions = listOf(
    SymptomOption(SymptomCode.FEVER, R.string.symptom_fever),
    SymptomOption(SymptomCode.VOMITING, R.string.symptom_vomiting),
    SymptomOption(SymptomCode.DIARRHEA, R.string.symptom_diarrhea),
    SymptomOption(SymptomCode.COUGH, R.string.symptom_cough),
    SymptomOption(SymptomCode.RASH, R.string.symptom_rash),
    SymptomOption(SymptomCode.HEMORRHAGE, R.string.symptom_hemorrhage),
    SymptomOption(SymptomCode.PARALYSIS, R.string.symptom_paralysis),
    SymptomOption(SymptomCode.MORTALITY, R.string.symptom_mortality),
    SymptomOption(SymptomCode.ABORTION, R.string.symptom_abortion),
    SymptomOption(SymptomCode.RESPIRATORY, R.string.symptom_respiratory),
    SymptomOption(SymptomCode.NEUROLOGICAL, R.string.symptom_neurological),
    SymptomOption(SymptomCode.EDEMA, R.string.symptom_edema),
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun Step3DetailsScreen(
    state: ReportFormState,
    viewModel: ReportViewModel,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
    ) {
        Text(
            text = stringResource(R.string.step3_title),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = stringResource(R.string.step3_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Title
        OutlinedTextField(
            value = state.title,
            onValueChange = { viewModel.updateTitle(it) },
            label = { Text(stringResource(R.string.details_title_label)) },
            placeholder = { Text(stringResource(R.string.details_title_hint)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            isError = state.title.isBlank() && state.currentStep == 4,
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Description
        OutlinedTextField(
            value = state.description,
            onValueChange = { viewModel.updateDescription(it) },
            label = { Text(stringResource(R.string.details_description_label)) },
            placeholder = { Text(stringResource(R.string.details_description_hint)) },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 5,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Symptoms
        Text(
            text = stringResource(R.string.details_symptoms),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(modifier = Modifier.height(8.dp))

        FlowRow(modifier = Modifier.fillMaxWidth()) {
            symptomOptions.forEach { option ->
                FilterChip(
                    selected = state.symptoms.contains(option.code),
                    onClick = { viewModel.toggleSymptom(option.code) },
                    label = { Text(stringResource(option.labelRes)) },
                    modifier = Modifier.padding(end = 8.dp, bottom = 4.dp),
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Themes
        Text(
            text = stringResource(R.string.details_themes),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(modifier = Modifier.height(8.dp))

        FlowRow(modifier = Modifier.fillMaxWidth()) {
            themeOptions.forEach { option ->
                FilterChip(
                    selected = state.themes.contains(option.code),
                    onClick = { viewModel.toggleTheme(option.code) },
                    label = { Text(stringResource(option.labelRes)) },
                    modifier = Modifier.padding(end = 8.dp, bottom = 4.dp),
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Gravity comment
        OutlinedTextField(
            value = state.gravityComment,
            onValueChange = { viewModel.updateGravityComment(it) },
            label = { Text(stringResource(R.string.details_gravity_comment)) },
            placeholder = { Text(stringResource(R.string.details_gravity_comment_hint)) },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 4,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Affected count
        OutlinedTextField(
            value = state.affectedCount,
            onValueChange = { viewModel.updateAffectedCount(it) },
            label = { Text(stringResource(R.string.details_affected_count)) },
            placeholder = { Text(stringResource(R.string.details_affected_hint)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        )
    }
}
