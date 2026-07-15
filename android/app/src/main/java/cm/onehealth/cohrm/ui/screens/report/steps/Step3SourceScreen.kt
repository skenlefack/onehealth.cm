package cm.onehealth.cohrm.ui.screens.report.steps

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.screens.report.ReportViewModel

data class SourceTypeOption(val key: String, val labelRes: Int)

private val sourceTypeOptions = listOf(
    SourceTypeOption("mobile_app", R.string.source_mobile_app),
    SourceTypeOption("community", R.string.source_community),
    SourceTypeOption("social_network", R.string.source_social_network),
    SourceTypeOption("hotline", R.string.source_hotline),
    SourceTypeOption("call_center", R.string.source_call_center),
    SourceTypeOption("media", R.string.source_media_option),
    SourceTypeOption("sms", R.string.source_sms_option),
    SourceTypeOption("web_scan", R.string.source_web_scan),
    SourceTypeOption("direct", R.string.source_direct_declaration),
    SourceTypeOption("other", R.string.source_other),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Step3SourceScreen(viewModel: ReportViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var sourceTypeExpanded by remember { mutableStateOf(false) }

    val selectedSourceLabel = sourceTypeOptions.find { it.key == state.sourceType }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
    ) {
        Text(
            text = stringResource(R.string.step3_source_title),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = stringResource(R.string.step3_source_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Date de detection
        OutlinedTextField(
            value = state.dateDetection,
            onValueChange = { viewModel.updateDateDetection(it) },
            label = { Text(stringResource(R.string.source_date_detection)) },
            placeholder = { Text(stringResource(R.string.source_date_detection_hint)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Source type dropdown
        ExposedDropdownMenuBox(
            expanded = sourceTypeExpanded,
            onExpandedChange = { sourceTypeExpanded = it },
        ) {
            OutlinedTextField(
                value = selectedSourceLabel?.let { stringResource(it.labelRes) } ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text(stringResource(R.string.source_type_label)) },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = sourceTypeExpanded) },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(),
            )
            ExposedDropdownMenu(
                expanded = sourceTypeExpanded,
                onDismissRequest = { sourceTypeExpanded = false },
            ) {
                sourceTypeOptions.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(stringResource(option.labelRes)) },
                        onClick = {
                            viewModel.updateSourceType(option.key)
                            sourceTypeExpanded = false
                        },
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Message received
        OutlinedTextField(
            value = state.messageReceived,
            onValueChange = { viewModel.updateMessageReceived(it) },
            label = { Text(stringResource(R.string.source_message_received)) },
            placeholder = { Text(stringResource(R.string.source_message_received_hint)) },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            maxLines = 6,
        )
    }
}
