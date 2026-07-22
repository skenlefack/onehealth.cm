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
import androidx.compose.material3.HorizontalDivider
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

private fun formatCategory(code: String): String = when (code) {
    "human_health" -> "Sante humaine"
    "animal_health" -> "Sante animale"
    "environmental" -> "Sante environnement"
    "safety" -> "Securite"
    "disaster" -> "Catastrophe"
    "other" -> "Autre"
    else -> code.replace("_", " ").replaceFirstChar { it.uppercase() }
}

private fun formatSpecies(code: String): String = when (code) {
    "HUM" -> "Humain"
    "BOV" -> "Bovin"
    "OVI" -> "Ovin/Caprin"
    "VOL" -> "Volaille"
    "POR" -> "Porcin"
    "SAU" -> "Faune sauvage"
    "CHI" -> "Chien/Chat"
    "AUT" -> "Autre"
    else -> code.replace("_", " ").replaceFirstChar { it.uppercase() }
}

private fun formatSourceType(code: String): String = when (code) {
    "mobile_app" -> "Application mobile"
    "direct" -> "Signalement direct"
    "field" -> "Agent de terrain"
    "sms" -> "SMS"
    "web" -> "Formulaire web"
    "media" -> "Medias"
    "social_media" -> "Reseaux sociaux"
    else -> code.replace("_", " ").replaceFirstChar { it.uppercase() }
}

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
                ReviewRow(stringResource(R.string.review_category), formatCategory(state.category))
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                ReviewRow(stringResource(R.string.review_species), formatSpecies(state.species))
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                ReviewRow(
                    stringResource(R.string.review_location),
                    listOfNotNull(regionName, state.department.ifBlank { null }, state.district.ifBlank { null })
                        .joinToString(" > ")
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                ReviewRow(stringResource(R.string.review_title), state.title)
                if (state.description.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_description), state.description)
                }
                if (state.symptoms.isNotEmpty()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_symptoms), state.symptoms.joinToString(", "))
                }
                if (state.affectedCount.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_affected), state.affectedCount)
                }
                if (state.photos.isNotEmpty()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_photos), "${state.photos.size} photo(s)")
                }
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                ReviewRow(stringResource(R.string.review_source_type), formatSourceType(state.sourceType))
                if (state.dateDetection.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_date_detection), state.dateDetection)
                }
                if (state.themes.isNotEmpty()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_themes), state.themes.joinToString(", "))
                }
                if (state.gravityComment.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_gravity_comment), state.gravityComment)
                }
                if (state.arrondissement.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_arrondissement), state.arrondissement)
                }
                if (state.commune.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_commune), state.commune)
                }
                if (state.aireSante.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow(stringResource(R.string.review_aire_sante), state.aireSante)
                }
                if (state.latitude != null && state.longitude != null) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    ReviewRow("Coordonnees GPS", "${state.latitude}, ${state.longitude}")
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
