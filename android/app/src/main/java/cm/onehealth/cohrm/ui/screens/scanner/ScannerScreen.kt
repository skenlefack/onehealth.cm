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
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import cm.onehealth.cohrm.data.remote.dto.ScannerResultItem
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.PrimaryLight
import cm.onehealth.cohrm.ui.theme.Info
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

        // Scanner results section
        item {
            Spacer(modifier = Modifier.height(20.dp))
            Text(
                text = stringResource(R.string.scanner_results_title),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }

        // Result filter chips
        item {
            ScannerResultFilterChips(
                selected = state.selectedResultFilter,
                onSelect = viewModel::updateResultFilter,
            )
        }

        // Results loading
        if (state.isLoadingResults) {
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

        // Scanner result items
        if (!state.isLoadingResults && state.scannerResults.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = stringResource(R.string.scanner_results_empty),
                        style = MaterialTheme.typography.bodyMedium,
                        color = Muted,
                    )
                }
            }
        }

        items(state.scannerResults, key = { it.id }) { result ->
            ScannerResultCard(
                result = result,
                onReview = { viewModel.reviewResult(result.id, "reviewed") },
                onDismiss = { viewModel.reviewResult(result.id, "dismissed") },
                onConvert = { title, desc -> viewModel.convertToRumor(result.id, title, desc) },
            )
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

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ScannerResultFilterChips(
    selected: String?,
    onSelect: (String?) -> Unit,
) {
    val filters = listOf(
        null to R.string.status_all,
        "new" to R.string.scanner_result_status_new,
        "reviewed" to R.string.scanner_result_status_reviewed,
        "converted" to R.string.scanner_result_status_converted,
        "dismissed" to R.string.scanner_result_status_dismissed,
    )

    FlowRow(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        filters.forEach { (value, labelRes) ->
            val isSelected = selected == value
            val chipColor = if (isSelected) Primary else Muted
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (isSelected) chipColor.copy(alpha = 0.15f) else chipColor.copy(alpha = 0.08f))
                    .clickable { onSelect(value) }
                    .padding(horizontal = 12.dp, vertical = 6.dp),
            ) {
                Text(
                    text = stringResource(labelRes),
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = if (isSelected) chipColor else MaterialTheme.colorScheme.onSurface,
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ScannerResultCard(
    result: ScannerResultItem,
    onReview: () -> Unit,
    onDismiss: () -> Unit,
    onConvert: (String?, String?) -> Unit,
) {
    var showConvertDialog by remember { mutableStateOf(false) }
    val relevance = result.relevanceScore ?: 0.0
    val relevanceColor = when {
        relevance > 0.7 -> Success
        relevance > 0.4 -> Warning
        else -> Danger
    }
    val statusColor = when (result.status) {
        "new" -> Info
        "reviewed" -> Warning
        "converted" -> Success
        "dismissed" -> Muted
        else -> Muted
    }
    val statusLabel = when (result.status) {
        "new" -> R.string.scanner_result_status_new
        "reviewed" -> R.string.scanner_result_status_reviewed
        "converted" -> R.string.scanner_result_status_converted
        "dismissed" -> R.string.scanner_result_status_dismissed
        else -> R.string.scanner_result_status_new
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Title + status badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top,
            ) {
                result.title?.let { title ->
                    Text(
                        text = title,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
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

            // Content preview
            result.content?.let { content ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = content,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Source + date
            Row(verticalAlignment = Alignment.CenterVertically) {
                result.source?.let { source ->
                    Text(
                        text = formatSourceLabel(source),
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                    )
                }
                result.createdAt?.let { date ->
                    if (result.source != null) {
                        Text(" \u2022 ", style = MaterialTheme.typography.labelSmall, color = Muted)
                    }
                    Text(
                        text = formatDate(date),
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Relevance bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(R.string.scanner_result_relevance, relevance * 100),
                    style = MaterialTheme.typography.labelSmall,
                    color = relevanceColor,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(modifier = Modifier.width(8.dp))
                LinearProgressIndicator(
                    progress = { relevance.toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier
                        .weight(1f)
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = relevanceColor,
                    trackColor = relevanceColor.copy(alpha = 0.15f),
                )
            }

            // Matched keywords
            val keywords = result.matchedKeywordsList()
            if (keywords.isNotEmpty()) {
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    keywords.forEach { keyword ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Primary.copy(alpha = 0.1f))
                                .padding(horizontal = 6.dp, vertical = 2.dp),
                        ) {
                            Text(
                                text = keyword,
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 10.sp,
                                color = Primary,
                            )
                        }
                    }
                }
            }

            // Action buttons (only for actionable states)
            if (result.status in listOf("new", "reviewed", null)) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Button(
                        onClick = { showConvertDialog = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Success),
                        shape = RoundedCornerShape(8.dp),
                    ) {
                        Text(
                            stringResource(R.string.scanner_result_convert),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                    ) {
                        Text(
                            stringResource(R.string.scanner_result_dismiss),
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                }
            }
        }
    }

    // Convert to rumor dialog
    if (showConvertDialog) {
        var convertTitle by remember { mutableStateOf(result.title ?: "") }
        var convertDesc by remember { mutableStateOf(result.content ?: "") }

        AlertDialog(
            onDismissRequest = { showConvertDialog = false },
            title = { Text(stringResource(R.string.scanner_result_convert_title)) },
            text = {
                Column {
                    OutlinedTextField(
                        value = convertTitle,
                        onValueChange = { convertTitle = it },
                        label = { Text(stringResource(R.string.scanner_result_convert_rumor_title)) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = convertDesc,
                        onValueChange = { convertDesc = it },
                        label = { Text(stringResource(R.string.scanner_result_convert_description)) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        minLines = 3,
                        maxLines = 5,
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onConvert(convertTitle.ifBlank { null }, convertDesc.ifBlank { null })
                        showConvertDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                ) {
                    Text(stringResource(R.string.scanner_result_convert))
                }
            },
            dismissButton = {
                TextButton(onClick = { showConvertDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            },
        )
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
