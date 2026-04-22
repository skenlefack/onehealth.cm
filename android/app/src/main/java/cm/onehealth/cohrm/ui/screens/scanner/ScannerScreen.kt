package cm.onehealth.cohrm.ui.screens.scanner

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.dto.ScanSummary
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.PrimaryLight
import cm.onehealth.cohrm.ui.theme.Success
import cm.onehealth.cohrm.ui.theme.Warning

@Composable
fun ScannerScreen(
    onScanClick: (Int) -> Unit = {},
    viewModel: ScannerViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
    ) {
        // Header
        item {
            ScannerHeader()
        }

        // Error
        state.error?.let { error ->
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = Danger.copy(alpha = 0.1f)),
                ) {
                    Text(
                        text = error,
                        modifier = Modifier.padding(12.dp),
                        color = Danger,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
        }

        // Launch scan card
        item {
            LaunchScanCard(
                selectedSource = state.selectedSource,
                keywords = state.keywords,
                isScanning = state.isScanning,
                onSourceChanged = viewModel::updateSource,
                onKeywordsChanged = viewModel::updateKeywords,
                onRunScan = viewModel::runScan,
            )
        }

        // History section title
        item {
            Spacer(modifier = Modifier.height(20.dp))
            Text(
                text = stringResource(R.string.scanner_history),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }

        // Empty state
        if (!state.isLoading && state.scans.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = stringResource(R.string.scanner_empty),
                        style = MaterialTheme.typography.bodyMedium,
                        color = Muted,
                    )
                }
            }
        }

        // Loading indicator
        if (state.isLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
            }
        }

        // Scan history cards
        items(state.scans, key = { it.id }) { scan ->
            ScanHistoryCard(scan = scan, onClick = { onScanClick(scan.id) })
        }

        // Auto-scan settings
        item {
            AutoScanCard(
                isEnabled = state.isAutoScanEnabled,
                frequency = state.autoScanFrequency,
                source = state.autoScanSource,
                keywords = state.autoScanKeywords,
                onEnabledChanged = viewModel::updateAutoScanEnabled,
                onFrequencyChanged = viewModel::updateAutoScanFrequency,
                onSourceChanged = viewModel::updateAutoScanSource,
                onKeywordsChanged = viewModel::updateAutoScanKeywords,
            )
        }

        // Bottom spacing
        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
private fun ScannerHeader() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(Primary, PrimaryLight),
                ),
            )
            .padding(16.dp),
    ) {
        Text(
            text = stringResource(R.string.scanner_title),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = Color.White,
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LaunchScanCard(
    selectedSource: String,
    keywords: String,
    isScanning: Boolean,
    onSourceChanged: (String) -> Unit,
    onKeywordsChanged: (String) -> Unit,
    onRunScan: () -> Unit,
) {
    val sourceOptions = listOf(
        "all" to R.string.scanner_source_all,
        "twitter" to R.string.scanner_source_twitter,
        "facebook" to R.string.scanner_source_facebook,
        "news" to R.string.scanner_source_news,
        "forums" to R.string.scanner_source_forums,
    )

    var sourceExpanded by remember { mutableStateOf(false) }
    val selectedLabel = sourceOptions.find { it.first == selectedSource }?.second
        ?: R.string.scanner_source_all

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.scanner_launch),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Source dropdown
            Text(
                text = stringResource(R.string.scanner_source),
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(modifier = Modifier.height(4.dp))

            ExposedDropdownMenuBox(
                expanded = sourceExpanded,
                onExpandedChange = { sourceExpanded = !sourceExpanded },
            ) {
                OutlinedTextField(
                    value = stringResource(selectedLabel),
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = sourceExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    shape = RoundedCornerShape(12.dp),
                )
                ExposedDropdownMenu(
                    expanded = sourceExpanded,
                    onDismissRequest = { sourceExpanded = false },
                ) {
                    sourceOptions.forEach { (value, labelRes) ->
                        DropdownMenuItem(
                            text = { Text(stringResource(labelRes)) },
                            onClick = {
                                onSourceChanged(value)
                                sourceExpanded = false
                            },
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Keywords field
            OutlinedTextField(
                value = keywords,
                onValueChange = onKeywordsChanged,
                label = { Text(stringResource(R.string.scanner_keywords)) },
                placeholder = { Text(stringResource(R.string.scanner_keywords_hint)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Run scan button
            Button(
                onClick = onRunScan,
                enabled = !isScanning,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary,
                    contentColor = Color.White,
                ),
            ) {
                if (isScanning) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp,
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.scanner_running))
                } else {
                    Text(
                        text = stringResource(R.string.scanner_run),
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ScanHistoryCard(
    scan: ScanSummary,
    onClick: () -> Unit,
) {
    val statusColor = when (scan.status) {
        "running" -> Warning
        "completed" -> Success
        "failed" -> Danger
        "partial" -> Warning
        else -> Muted
    }
    val statusLabel = when (scan.status) {
        "running" -> R.string.scanner_status_running
        "completed" -> R.string.scanner_status_completed
        "failed" -> R.string.scanner_status_failed
        else -> R.string.scanner_status_running
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Source badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(PrimaryLight.copy(alpha = 0.12f))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                ) {
                    Text(
                        text = formatSourceLabel(scan.source),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = PrimaryLight,
                    )
                }

                // Status badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(statusColor.copy(alpha = 0.12f))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                ) {
                    Text(
                        text = stringResource(statusLabel),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = statusColor,
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Stats row
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = stringResource(R.string.scanner_items_scanned, scan.itemsScanned),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Text(
                    text = stringResource(R.string.scanner_rumors_found, scan.rumorsFound),
                    style = MaterialTheme.typography.bodySmall,
                    color = if (scan.rumorsFound > 0) Accent else MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = if (scan.rumorsFound > 0) FontWeight.SemiBold else FontWeight.Normal,
                )
                scan.duration?.let { duration ->
                    Text(
                        text = stringResource(R.string.scanner_duration, duration),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            // Date
            scan.createdAt?.let { date ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = formatDate(date),
                    style = MaterialTheme.typography.labelSmall,
                    color = Muted,
                )
            }

            // Keywords
            val scanKeywords = scan.keywordsList()
            if (scanKeywords.isNotEmpty()) {
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    scanKeywords.forEach { keyword ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 6.dp, vertical = 2.dp),
                        ) {
                            Text(
                                text = keyword,
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 10.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AutoScanCard(
    isEnabled: Boolean,
    frequency: Int,
    source: String,
    keywords: String,
    onEnabledChanged: (Boolean) -> Unit,
    onFrequencyChanged: (Int) -> Unit,
    onSourceChanged: (String) -> Unit,
    onKeywordsChanged: (String) -> Unit,
) {
    val frequencyOptions = listOf(
        30 to R.string.scanner_freq_30m,
        60 to R.string.scanner_freq_1h,
        180 to R.string.scanner_freq_3h,
        360 to R.string.scanner_freq_6h,
        720 to R.string.scanner_freq_12h,
        1440 to R.string.scanner_freq_24h,
    )

    val sourceOptions = listOf(
        "all" to R.string.scanner_source_all,
        "twitter" to R.string.scanner_source_twitter,
        "facebook" to R.string.scanner_source_facebook,
        "news" to R.string.scanner_source_news,
        "forums" to R.string.scanner_source_forums,
    )

    var frequencyExpanded by remember { mutableStateOf(false) }
    var sourceExpanded by remember { mutableStateOf(false) }

    val selectedFreqLabel = frequencyOptions.find { it.first == frequency }?.second
        ?: R.string.scanner_freq_1h
    val selectedSourceLabel = sourceOptions.find { it.first == source }?.second
        ?: R.string.scanner_source_all

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.scanner_auto),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Enable toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(R.string.scanner_auto_enabled),
                    style = MaterialTheme.typography.bodyMedium,
                )
                Switch(
                    checked = isEnabled,
                    onCheckedChange = onEnabledChanged,
                    colors = SwitchDefaults.colors(checkedTrackColor = Primary),
                )
            }

            AnimatedVisibility(visible = isEnabled) {
                Column {
                    Spacer(modifier = Modifier.height(12.dp))

                    // Frequency dropdown
                    Text(
                        text = stringResource(R.string.scanner_frequency),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(4.dp))

                    ExposedDropdownMenuBox(
                        expanded = frequencyExpanded,
                        onExpandedChange = { frequencyExpanded = !frequencyExpanded },
                    ) {
                        OutlinedTextField(
                            value = stringResource(selectedFreqLabel),
                            onValueChange = {},
                            readOnly = true,
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = frequencyExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            shape = RoundedCornerShape(12.dp),
                        )
                        ExposedDropdownMenu(
                            expanded = frequencyExpanded,
                            onDismissRequest = { frequencyExpanded = false },
                        ) {
                            frequencyOptions.forEach { (value, labelRes) ->
                                DropdownMenuItem(
                                    text = { Text(stringResource(labelRes)) },
                                    onClick = {
                                        onFrequencyChanged(value)
                                        frequencyExpanded = false
                                    },
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Source dropdown
                    Text(
                        text = stringResource(R.string.scanner_source),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(4.dp))

                    ExposedDropdownMenuBox(
                        expanded = sourceExpanded,
                        onExpandedChange = { sourceExpanded = !sourceExpanded },
                    ) {
                        OutlinedTextField(
                            value = stringResource(selectedSourceLabel),
                            onValueChange = {},
                            readOnly = true,
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = sourceExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            shape = RoundedCornerShape(12.dp),
                        )
                        ExposedDropdownMenu(
                            expanded = sourceExpanded,
                            onDismissRequest = { sourceExpanded = false },
                        ) {
                            sourceOptions.forEach { (value, labelRes) ->
                                DropdownMenuItem(
                                    text = { Text(stringResource(labelRes)) },
                                    onClick = {
                                        onSourceChanged(value)
                                        sourceExpanded = false
                                    },
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Keywords field
                    OutlinedTextField(
                        value = keywords,
                        onValueChange = onKeywordsChanged,
                        label = { Text(stringResource(R.string.scanner_keywords)) },
                        placeholder = { Text(stringResource(R.string.scanner_keywords_hint)) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                    )
                }
            }
        }
    }
}

private fun formatSourceLabel(source: String): String = when (source) {
    "all" -> "Toutes"
    "twitter" -> "Twitter/X"
    "facebook" -> "Facebook"
    "news" -> "Actualites"
    "forums" -> "Forums"
    else -> source.replaceFirstChar { it.uppercase() }
}

private fun formatDate(dateStr: String): String {
    // Simple formatting: take first 16 chars (yyyy-MM-ddTHH:mm) and replace T with space
    return dateStr.take(16).replace("T", " ")
}
