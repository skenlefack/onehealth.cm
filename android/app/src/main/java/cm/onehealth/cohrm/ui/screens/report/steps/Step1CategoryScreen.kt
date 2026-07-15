package cm.onehealth.cohrm.ui.screens.report.steps

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.domain.model.EventCategory
import cm.onehealth.cohrm.domain.model.SpeciesCode
import cm.onehealth.cohrm.ui.screens.report.ReportFormState
import cm.onehealth.cohrm.ui.screens.report.ReportViewModel
import cm.onehealth.cohrm.ui.theme.AnimalHealthColor
import cm.onehealth.cohrm.ui.theme.DisasterColor
import cm.onehealth.cohrm.ui.theme.EnvironmentalColor
import cm.onehealth.cohrm.ui.theme.HumanHealthColor
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.SafetyColor

data class CategoryOption(val key: String, val labelRes: Int, val color: androidx.compose.ui.graphics.Color)
data class SpeciesOption(val key: String, val labelRes: Int)

private val categories = listOf(
    CategoryOption(EventCategory.HUMAN_HEALTH, R.string.category_human_health, HumanHealthColor),
    CategoryOption(EventCategory.ANIMAL_HEALTH, R.string.category_animal_health, AnimalHealthColor),
    CategoryOption(EventCategory.ENVIRONMENTAL, R.string.category_environmental, EnvironmentalColor),
    CategoryOption(EventCategory.SAFETY, R.string.category_safety, SafetyColor),
    CategoryOption(EventCategory.DISASTER, R.string.category_disaster, DisasterColor),
    CategoryOption(EventCategory.OTHER, R.string.category_other, Muted),
)

private val speciesList = listOf(
    SpeciesOption(SpeciesCode.HUMAN, R.string.species_human),
    SpeciesOption(SpeciesCode.BOVINE, R.string.species_bovine),
    SpeciesOption(SpeciesCode.OVINE, R.string.species_ovine),
    SpeciesOption(SpeciesCode.POULTRY, R.string.species_poultry),
    SpeciesOption(SpeciesCode.SWINE, R.string.species_swine),
    SpeciesOption(SpeciesCode.WILDLIFE, R.string.species_wildlife),
    SpeciesOption(SpeciesCode.DOMESTIC, R.string.species_domestic),
    SpeciesOption(SpeciesCode.OTHER, R.string.species_other),
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun Step1CategoryScreen(
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
            text = stringResource(R.string.step1_title),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = stringResource(R.string.step1_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Category selection
        categories.forEach { option ->
            val isSelected = state.category == option.key
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { viewModel.updateCategory(option.key) },
                colors = CardDefaults.cardColors(
                    containerColor = if (isSelected) option.color.copy(alpha = 0.15f)
                    else MaterialTheme.colorScheme.surface,
                ),
                border = if (isSelected) BorderStroke(2.dp, option.color) else null,
            ) {
                Text(
                    text = stringResource(option.labelRes),
                    modifier = Modifier.padding(16.dp),
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = if (isSelected) option.color else MaterialTheme.colorScheme.onSurface,
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Species selection
        Text(
            text = stringResource(R.string.species_label),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(modifier = Modifier.height(8.dp))

        FlowRow(
            modifier = Modifier.fillMaxWidth(),
        ) {
            speciesList.forEach { option ->
                FilterChip(
                    selected = state.species == option.key,
                    onClick = { viewModel.updateSpecies(option.key) },
                    label = { Text(stringResource(option.labelRes)) },
                    modifier = Modifier.padding(end = 8.dp, bottom = 4.dp),
                )
            }
        }
    }
}
