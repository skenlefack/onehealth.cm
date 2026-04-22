package cm.onehealth.cohrm.ui.screens.sms

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.domain.model.CameroonRegions
import cm.onehealth.cohrm.domain.model.EventCategory
import cm.onehealth.cohrm.domain.model.SpeciesCode
import cm.onehealth.cohrm.domain.model.SymptomCode
import cm.onehealth.cohrm.util.SmsHelper

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun SmsReportScreen(
    onBack: () -> Unit,
    viewModel: SmsReportViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    var categoryExpanded by remember { mutableStateOf(false) }
    var regionExpanded by remember { mutableStateOf(false) }
    var speciesExpanded by remember { mutableStateOf(false) }

    val categories = listOf(
        EventCategory.HUMAN_HEALTH to R.string.category_human_health,
        EventCategory.ANIMAL_HEALTH to R.string.category_animal_health,
        EventCategory.ENVIRONMENTAL to R.string.category_environmental,
        EventCategory.SAFETY to R.string.category_safety,
        EventCategory.DISASTER to R.string.category_disaster,
    )

    val speciesList = listOf(
        SpeciesCode.HUMAN to R.string.species_human,
        SpeciesCode.BOVINE to R.string.species_bovine,
        SpeciesCode.OVINE to R.string.species_ovine,
        SpeciesCode.POULTRY to R.string.species_poultry,
        SpeciesCode.SWINE to R.string.species_swine,
        SpeciesCode.WILDLIFE to R.string.species_wildlife,
    )

    val symptoms = listOf(
        SymptomCode.FEVER to R.string.symptom_fever,
        SymptomCode.VOMITING to R.string.symptom_vomiting,
        SymptomCode.DIARRHEA to R.string.symptom_diarrhea,
        SymptomCode.COUGH to R.string.symptom_cough,
        SymptomCode.RASH to R.string.symptom_rash,
        SymptomCode.HEMORRHAGE to R.string.symptom_hemorrhage,
    )

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(stringResource(R.string.sms_title)) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                }
            },
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
        ) {
            Text(
                text = stringResource(R.string.sms_subtitle),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Category dropdown
            ExposedDropdownMenuBox(
                expanded = categoryExpanded,
                onExpandedChange = { categoryExpanded = it },
            ) {
                val selectedLabel = categories.find { it.first == state.category }?.second
                OutlinedTextField(
                    value = if (selectedLabel != null) stringResource(selectedLabel) else "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.review_category)) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                )
                ExposedDropdownMenu(
                    expanded = categoryExpanded,
                    onDismissRequest = { categoryExpanded = false },
                ) {
                    categories.forEach { (key, labelRes) ->
                        DropdownMenuItem(
                            text = { Text(stringResource(labelRes)) },
                            onClick = {
                                viewModel.updateCategory(key)
                                categoryExpanded = false
                            },
                        )
                    }
                }
            }
            if (state.categoryError != null) {
                Text(
                    text = stringResource(R.string.sms_error_category),
                    color = Color.Red,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(start = 4.dp, top = 2.dp),
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Species dropdown
            ExposedDropdownMenuBox(
                expanded = speciesExpanded,
                onExpandedChange = { speciesExpanded = it },
            ) {
                val selectedSpecies = speciesList.find { it.first == state.species }?.second
                OutlinedTextField(
                    value = if (selectedSpecies != null) stringResource(selectedSpecies) else "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.species_label)) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = speciesExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                )
                ExposedDropdownMenu(
                    expanded = speciesExpanded,
                    onDismissRequest = { speciesExpanded = false },
                ) {
                    speciesList.forEach { (key, labelRes) ->
                        DropdownMenuItem(
                            text = { Text(stringResource(labelRes)) },
                            onClick = {
                                viewModel.updateSpecies(key)
                                speciesExpanded = false
                            },
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Region dropdown
            ExposedDropdownMenuBox(
                expanded = regionExpanded,
                onExpandedChange = { regionExpanded = it },
            ) {
                val selectedRegion = CameroonRegions.find { it.code == state.region }
                OutlinedTextField(
                    value = selectedRegion?.name ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.location_region)) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = regionExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                )
                ExposedDropdownMenu(
                    expanded = regionExpanded,
                    onDismissRequest = { regionExpanded = false },
                ) {
                    CameroonRegions.forEach { region ->
                        DropdownMenuItem(
                            text = { Text(region.name) },
                            onClick = {
                                viewModel.updateRegion(region.code)
                                regionExpanded = false
                            },
                        )
                    }
                }
            }
            if (state.regionError != null) {
                Text(
                    text = stringResource(R.string.sms_error_region),
                    color = Color.Red,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(start = 4.dp, top = 2.dp),
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Affected count
            OutlinedTextField(
                value = state.affectedCount,
                onValueChange = { viewModel.updateAffectedCount(it) },
                label = { Text(stringResource(R.string.sms_affected_count)) },
                placeholder = { Text(stringResource(R.string.sms_affected_hint)) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Symptoms
            Text(
                text = stringResource(R.string.details_symptoms),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(modifier = Modifier.height(4.dp))
            FlowRow(modifier = Modifier.fillMaxWidth()) {
                symptoms.forEach { (code, labelRes) ->
                    FilterChip(
                        selected = state.symptoms.contains(code),
                        onClick = { viewModel.toggleSymptom(code) },
                        label = { Text(stringResource(labelRes)) },
                        modifier = Modifier.padding(end = 8.dp, bottom = 4.dp),
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Description
            OutlinedTextField(
                value = state.description,
                onValueChange = { viewModel.updateDescription(it) },
                label = { Text(stringResource(R.string.details_description_label)) },
                isError = state.descriptionError != null,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp),
                maxLines = 3,
            )
            if (state.descriptionError != null) {
                Text(
                    text = stringResource(R.string.sms_error_description),
                    color = Color.Red,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(start = 4.dp, top = 2.dp),
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // SMS Preview
            val smsText = viewModel.generateSmsText()
            Text(
                text = stringResource(R.string.sms_preview),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                Text(
                    text = smsText,
                    modifier = Modifier.padding(12.dp),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = stringResource(R.string.sms_format_info),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Send button
            Button(
                onClick = {
                    if (viewModel.validate()) {
                        viewModel.showConfirmDialog()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Default.Send, contentDescription = null)
                Spacer(modifier = Modifier.height(8.dp))
                Text(stringResource(R.string.sms_send))
            }
        }
    }

    // Confirmation dialog
    if (state.showConfirmDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.hideConfirmDialog() },
            title = { Text(stringResource(R.string.sms_confirm_title)) },
            text = { Text(stringResource(R.string.sms_confirm_message)) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.hideConfirmDialog()
                    SmsHelper.sendSms(context, viewModel.generateSmsText())
                }) {
                    Text(stringResource(R.string.sms_confirm_send))
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.hideConfirmDialog() }) {
                    Text(stringResource(R.string.cancel))
                }
            },
        )
    }
}
