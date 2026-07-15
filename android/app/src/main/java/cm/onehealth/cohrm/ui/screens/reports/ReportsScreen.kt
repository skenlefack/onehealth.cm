package cm.onehealth.cohrm.ui.screens.reports

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.dto.ActorWorkload
import cm.onehealth.cohrm.data.remote.dto.CategoryCount
import cm.onehealth.cohrm.data.remote.dto.RegionStat
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.PrimaryLight
import cm.onehealth.cohrm.ui.theme.Success
import cm.onehealth.cohrm.ui.theme.Warning

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
    onBack: () -> Unit = {},
    viewModel: ReportsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(stringResource(R.string.reports_title)) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                }
            },
            actions = {
                IconButton(onClick = { viewModel.refresh() }, enabled = !state.isLoading) {
                    if (state.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp,
                        )
                    } else {
                        Icon(Icons.Default.Refresh, contentDescription = null)
                    }
                }
            },
        )

        if (state.isLoading && state.totals == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            PullToRefreshBox(
                isRefreshing = state.isLoading,
                onRefresh = { viewModel.refresh() },
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(bottom = 16.dp),
                ) {
                    // Period selector
                    PeriodSelector(
                        selected = state.selectedPeriod,
                        onSelect = { viewModel.selectPeriod(it) },
                    )

                    // Error
                    state.error?.let { error ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp),
                            colors = CardDefaults.cardColors(containerColor = Danger.copy(alpha = 0.1f)),
                        ) {
                            Text(
                                text = error,
                                modifier = Modifier.padding(12.dp),
                                color = Danger,
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Summary KPIs
                    SummaryCards(state)

                    Spacer(modifier = Modifier.height(20.dp))

                    // By Status
                    if (state.byStatus.isNotEmpty()) {
                        SectionTitle(
                            stringResource(R.string.reports_by_status),
                            Icons.Default.Assessment,
                        )
                        StatusBars(state.byStatus)
                        Spacer(modifier = Modifier.height(20.dp))
                    }

                    // By Region (geographic)
                    if (state.regionStats.isNotEmpty()) {
                        SectionTitle(
                            stringResource(R.string.reports_by_region),
                            Icons.Default.Map,
                        )
                        RegionBars(state.regionStats)
                        Spacer(modifier = Modifier.height(20.dp))
                    }

                    // Performance metrics
                    SectionTitle(
                        stringResource(R.string.reports_performance),
                        Icons.Default.Speed,
                    )
                    PerformanceCards(state)

                    Spacer(modifier = Modifier.height(20.dp))

                    // Actor workload
                    if (state.actorWorkload.isNotEmpty()) {
                        SectionTitle(
                            stringResource(R.string.reports_workload),
                            Icons.Default.People,
                        )
                        WorkloadList(state.actorWorkload)
                    }
                }
            }
        }
    }
}

@Composable
private fun PeriodSelector(selected: String, onSelect: (String) -> Unit) {
    val periods = listOf(
        "7" to stringResource(R.string.reports_period_7d),
        "30" to stringResource(R.string.reports_period_30d),
        "90" to stringResource(R.string.reports_period_90d),
        "365" to stringResource(R.string.reports_period_1y),
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        periods.forEach { (key, label) ->
            FilterChip(
                selected = selected == key,
                onClick = { onSelect(key) },
                label = { Text(label) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Primary,
                    selectedLabelColor = Color.White,
                ),
            )
        }
    }
}

@Composable
private fun SummaryCards(state: ReportsUiState) {
    val totals = state.totals
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        SummaryCard(
            label = stringResource(R.string.reports_total),
            value = "${totals?.total ?: 0}",
            color = Primary,
            icon = Icons.Default.Assessment,
        )
        SummaryCard(
            label = stringResource(R.string.reports_resolved),
            value = "${totals?.closed ?: 0}",
            color = Success,
            icon = Icons.Default.CheckCircle,
        )
        SummaryCard(
            label = stringResource(R.string.reports_pending),
            value = "${totals?.pending ?: 0}",
            color = Warning,
            icon = Icons.Default.HourglassEmpty,
        )
        SummaryCard(
            label = stringResource(R.string.reports_high_risk),
            value = "${totals?.highRisk ?: 0}",
            color = Danger,
            icon = Icons.Default.Warning,
        )
        SummaryCard(
            label = stringResource(R.string.reports_avg_resolution),
            value = "${state.avgResolutionHours}h",
            color = Info,
            icon = Icons.Default.Timer,
        )
    }
}

@Composable
private fun SummaryCard(
    label: String,
    value: String,
    color: Color,
    icon: ImageVector,
) {
    Card(
        modifier = Modifier.width(140.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = value,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = color,
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun SectionTitle(title: String, icon: ImageVector? = null) {
    Row(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun StatusBars(items: List<CategoryCount>) {
    val maxValue = items.maxOfOrNull { it.count ?: 0 } ?: 1
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .animateContentSize(),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            items.forEach { entry ->
                val count = entry.count ?: 0
                val fraction = count.toFloat() / maxValue.coerceAtLeast(1)
                val label = entry.status ?: entry.category ?: ""
                val color = statusColor(label)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = formatLabel(label),
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.width(100.dp),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(20.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(color.copy(alpha = 0.1f)),
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(fraction)
                                .height(20.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(color),
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "$count",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = color,
                    )
                }
            }
        }
    }
}

@Composable
private fun RegionBars(items: List<RegionStat>) {
    val maxValue = items.maxOfOrNull { it.count ?: 0 } ?: 1
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .animateContentSize(),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            items.forEach { entry ->
                val count = entry.count ?: 0
                val fraction = count.toFloat() / maxValue.coerceAtLeast(1)
                val color = regionColor(entry.region ?: "")
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = entry.region ?: "",
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.width(100.dp),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(20.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(color.copy(alpha = 0.1f)),
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(fraction)
                                .height(20.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(color),
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "$count",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = color,
                        )
                        if ((entry.highPriority ?: 0) > 0) {
                            Text(
                                text = "${entry.highPriority} HP",
                                style = MaterialTheme.typography.labelSmall,
                                color = Danger,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PerformanceCards(state: ReportsUiState) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            PerformanceRow(
                label = stringResource(R.string.reports_avg_first_validation),
                value = "${state.avgFirstValidationHours}h",
                color = Info,
                icon = Icons.Default.Timer,
            )
            Spacer(modifier = Modifier.height(12.dp))
            PerformanceRow(
                label = stringResource(R.string.reports_avg_close_time),
                value = "${state.avgCloseTimeHours}h",
                color = Accent,
                icon = Icons.Default.CheckCircle,
            )
            Spacer(modifier = Modifier.height(12.dp))
            PerformanceRow(
                label = stringResource(R.string.reports_avg_resolution),
                value = "${state.avgResolutionHours}h",
                color = Primary,
                icon = Icons.Default.Speed,
            )
        }
    }
}

@Composable
private fun PerformanceRow(
    label: String,
    value: String,
    color: Color,
    icon: ImageVector,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = color,
        )
    }
}

@Composable
private fun WorkloadList(items: List<ActorWorkload>) {
    val maxVal = items.maxOfOrNull { it.validationsCount ?: 0 } ?: 1
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .animateContentSize(),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            items.take(10).forEach { actor ->
                val count = actor.validationsCount ?: 0
                val fraction = count.toFloat() / maxVal.coerceAtLeast(1)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(modifier = Modifier.width(120.dp)) {
                        Text(
                            text = actor.name ?: "",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            text = "N${actor.actorLevel ?: 0}",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    LinearProgressIndicator(
                        progress = { fraction },
                        modifier = Modifier
                            .weight(1f)
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = PrimaryLight,
                        trackColor = PrimaryLight.copy(alpha = 0.1f),
                        strokeCap = StrokeCap.Round,
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "$count",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = PrimaryLight,
                    )
                }
            }
        }
    }
}

// Color mapping functions
private fun statusColor(status: String): Color = when (status) {
    "pending" -> Warning
    "investigating" -> Info
    "confirmed" -> Accent
    "false_alarm" -> Muted
    "closed" -> Color(0xFF78909C)
    else -> Muted
}

private fun regionColor(region: String): Color {
    val colors = listOf(
        Primary, Accent, Warning, Info, Danger, Color(0xFF8E44AD),
        Color(0xFF1ABC9C), Color(0xFF795548), Color(0xFFE91E63), PrimaryLight,
    )
    val index = region.hashCode().and(0x7FFFFFFF) % colors.size
    return colors[index]
}

private fun formatLabel(label: String): String =
    label.replace("_", " ").replaceFirstChar { it.uppercase() }
