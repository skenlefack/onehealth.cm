package cm.onehealth.cohrm.ui.screens.publicreport

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublicReportScreen(
    onBack: () -> Unit,
    viewModel: PublicReportViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is PublicReportEvent.Submitted -> {
                    Toast.makeText(
                        context,
                        context.getString(R.string.public_report_submitted),
                        Toast.LENGTH_SHORT,
                    ).show()
                }
                is PublicReportEvent.TrackingFound -> {
                    // Handled via state
                }
                is PublicReportEvent.Error -> {
                    Toast.makeText(context, event.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(stringResource(R.string.public_report_title)) },
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
            // Success state - show tracking code
            if (state.trackingCode != null) {
                SubmissionSuccessCard(
                    trackingCode = state.trackingCode!!,
                    onCopyCode = {
                        clipboardManager.setText(AnnotatedString(state.trackingCode!!))
                        Toast.makeText(context, context.getString(R.string.public_report_code_copied), Toast.LENGTH_SHORT).show()
                    },
                    onNewReport = { viewModel.resetForm() },
                )
            } else {
                // Report form
                ReportFormSection(state = state, viewModel = viewModel)
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Track existing report section
            TrackReportSection(state = state, viewModel = viewModel)

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ReportFormSection(
    state: PublicReportState,
    viewModel: PublicReportViewModel,
) {
    Text(
        text = stringResource(R.string.public_report_form_title),
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
    )
    Text(
        text = stringResource(R.string.public_report_form_subtitle),
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )

    Spacer(modifier = Modifier.height(16.dp))

    // Phone (required)
    OutlinedTextField(
        value = state.phone,
        onValueChange = { viewModel.updatePhone(it) },
        label = { Text(stringResource(R.string.public_report_phone)) },
        placeholder = { Text(stringResource(R.string.public_report_phone_hint)) },
        isError = state.phoneError,
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
    )
    if (state.phoneError) {
        Text(
            text = stringResource(R.string.required_field),
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(start = 16.dp, top = 4.dp),
        )
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Name (optional)
    OutlinedTextField(
        value = state.name,
        onValueChange = { viewModel.updateName(it) },
        label = { Text(stringResource(R.string.public_report_name)) },
        placeholder = { Text(stringResource(R.string.public_report_name_hint)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
    )

    Spacer(modifier = Modifier.height(12.dp))

    // Region selector
    var regionExpanded by remember { mutableStateOf(false) }
    val selectedRegionName = state.regions.find { it.code == state.region }?.name ?: ""

    ExposedDropdownMenuBox(
        expanded = regionExpanded,
        onExpandedChange = { regionExpanded = it },
    ) {
        OutlinedTextField(
            value = selectedRegionName,
            onValueChange = {},
            readOnly = true,
            label = { Text(stringResource(R.string.location_region)) },
            placeholder = { Text(stringResource(R.string.location_select_region)) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = regionExpanded) },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(),
            shape = RoundedCornerShape(12.dp),
        )
        ExposedDropdownMenu(
            expanded = regionExpanded,
            onDismissRequest = { regionExpanded = false },
        ) {
            state.regions.forEach { region ->
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

    Spacer(modifier = Modifier.height(12.dp))

    // Category selector
    var categoryExpanded by remember { mutableStateOf(false) }
    val categories = listOf(
        "human_health" to stringResource(R.string.category_human_health),
        "animal_health" to stringResource(R.string.category_animal_health),
        "environmental" to stringResource(R.string.category_environmental),
        "safety" to stringResource(R.string.category_safety),
        "disaster" to stringResource(R.string.category_disaster),
        "other" to stringResource(R.string.category_other),
    )
    val selectedCategoryLabel = categories.find { it.first == state.category }?.second ?: ""

    ExposedDropdownMenuBox(
        expanded = categoryExpanded,
        onExpandedChange = { categoryExpanded = it },
    ) {
        OutlinedTextField(
            value = selectedCategoryLabel,
            onValueChange = {},
            readOnly = true,
            label = { Text(stringResource(R.string.rumor_category)) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded) },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(),
            shape = RoundedCornerShape(12.dp),
        )
        ExposedDropdownMenu(
            expanded = categoryExpanded,
            onDismissRequest = { categoryExpanded = false },
        ) {
            categories.forEach { (value, label) ->
                DropdownMenuItem(
                    text = { Text(label) },
                    onClick = {
                        viewModel.updateCategory(value)
                        categoryExpanded = false
                    },
                )
            }
        }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Description (required)
    OutlinedTextField(
        value = state.description,
        onValueChange = { viewModel.updateDescription(it) },
        label = { Text(stringResource(R.string.details_description_label)) },
        placeholder = { Text(stringResource(R.string.details_description_hint)) },
        isError = state.descriptionError,
        modifier = Modifier.fillMaxWidth(),
        minLines = 4,
        maxLines = 6,
        shape = RoundedCornerShape(12.dp),
    )
    if (state.descriptionError) {
        Text(
            text = stringResource(R.string.required_field),
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(start = 16.dp, top = 4.dp),
        )
    }

    Spacer(modifier = Modifier.height(20.dp))

    // Submit button
    Button(
        onClick = { viewModel.submitPublicReport() },
        enabled = !state.isSubmitting,
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp),
        shape = RoundedCornerShape(12.dp),
    ) {
        if (state.isSubmitting) {
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = MaterialTheme.colorScheme.onPrimary,
                strokeWidth = 2.dp,
            )
        } else {
            Text(
                text = stringResource(R.string.public_report_submit),
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
private fun SubmissionSuccessCard(
    trackingCode: String,
    onCopyCode: () -> Unit,
    onNewReport: () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFE8F5E9),
        ),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Icon(
                Icons.Default.CheckCircle,
                contentDescription = null,
                modifier = Modifier.size(56.dp),
                tint = Color(0xFF4CAF50),
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = stringResource(R.string.public_report_success_title),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = stringResource(R.string.public_report_success_subtitle),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Tracking code display
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
                shape = RoundedCornerShape(12.dp),
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = trackingCode,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(onClick = onCopyCode) {
                        Icon(
                            Icons.Default.ContentCopy,
                            contentDescription = stringResource(R.string.public_report_copy),
                            tint = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            OutlinedButton(
                onClick = onNewReport,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
            ) {
                Text(stringResource(R.string.public_report_new))
            }
        }
    }
}

@Composable
private fun TrackReportSection(
    state: PublicReportState,
    viewModel: PublicReportViewModel,
) {
    Text(
        text = stringResource(R.string.public_report_track_title),
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
    )
    Text(
        text = stringResource(R.string.public_report_track_subtitle),
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )

    Spacer(modifier = Modifier.height(12.dp))

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
    ) {
        OutlinedTextField(
            value = state.trackInput,
            onValueChange = { viewModel.updateTrackInput(it) },
            label = { Text(stringResource(R.string.public_report_track_code)) },
            placeholder = { Text(stringResource(R.string.public_report_track_hint)) },
            modifier = Modifier.weight(1f),
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
        )
        Spacer(modifier = Modifier.width(8.dp))
        Button(
            onClick = { viewModel.trackReport() },
            enabled = !state.isTracking && state.trackInput.isNotBlank(),
            modifier = Modifier.height(56.dp),
            shape = RoundedCornerShape(12.dp),
        ) {
            if (state.isTracking) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = MaterialTheme.colorScheme.onPrimary,
                    strokeWidth = 2.dp,
                )
            } else {
                Icon(Icons.Default.Search, contentDescription = null)
            }
        }
    }

    // Tracking result
    if (state.trackingResult != null) {
        Spacer(modifier = Modifier.height(12.dp))
        TrackingResultCard(data = state.trackingResult)
    }
}

@Composable
private fun TrackingResultCard(data: cm.onehealth.cohrm.data.remote.dto.TrackingData) {
    val statusColor = when (data.status) {
        "pending" -> Color(0xFFF57C00)
        "investigating" -> Color(0xFF2196F3)
        "confirmed" -> Color(0xFF4CAF50)
        "closed" -> Color(0xFF9E9E9E)
        else -> Color(0xFF607D8B)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = data.code,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                )
                Box(
                    modifier = Modifier
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                ) {
                    Text(
                        text = data.status.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelSmall,
                        color = statusColor,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stringResource(R.string.rumor_priority),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        text = data.priority.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stringResource(R.string.rumor_created),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        text = data.createdAt?.substringBefore("T") ?: "-",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
    }
}
