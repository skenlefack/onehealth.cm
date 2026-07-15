package cm.onehealth.cohrm.ui.screens.report.steps

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.domain.model.CameroonRegions
import cm.onehealth.cohrm.ui.screens.report.ReportFormState
import cm.onehealth.cohrm.ui.screens.report.ReportViewModel

@Composable
fun Step5ReviewScreen(
    state: ReportFormState,
    @Suppress("UNUSED_PARAMETER") viewModel: ReportViewModel,
) {
    val regionName = CameroonRegions.find { it.code == state.region }?.name ?: state.region

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
    ) {
        Text(
            text = stringResource(R.string.step5_title),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = stringResource(R.string.step5_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                ReviewRow(stringResource(R.string.review_category), state.category)
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                ReviewRow(stringResource(R.string.review_species), state.species)
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                ReviewRow(
                    stringResource(R.string.review_location),
                    listOfNotNull(regionName, state.department.ifBlank { null }, state.district.ifBlank { null })
                        .joinToString(", ")
                )
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                ReviewRow(stringResource(R.string.review_title), state.title)
                if (state.description.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_description), state.description)
                }
                if (state.symptoms.isNotEmpty()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_symptoms), state.symptoms.joinToString(", "))
                }
                if (state.affectedCount.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_affected), state.affectedCount)
                }
                if (state.photos.isNotEmpty()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_photos), "${state.photos.size}")
                }
                if (state.sourceType.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_source_type), state.sourceType)
                }
                if (state.dateDetection.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_date_detection), state.dateDetection)
                }
                if (state.themes.isNotEmpty()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_themes), state.themes.joinToString(", "))
                }
                if (state.gravityComment.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_gravity_comment), state.gravityComment)
                }
                if (state.arrondissement.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_arrondissement), state.arrondissement)
                }
                if (state.commune.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_commune), state.commune)
                }
                if (state.aireSante.isNotBlank()) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_aire_sante), state.aireSante)
                }
            }
        }
    }
}

@Composable
private fun ReviewRow(label: String, value: String) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            text = value.ifBlank { "-" },
            style = MaterialTheme.typography.bodyLarge,
        )
    }
}
