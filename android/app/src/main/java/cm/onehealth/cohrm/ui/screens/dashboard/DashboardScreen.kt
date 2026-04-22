package cm.onehealth.cohrm.ui.screens.dashboard

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.domain.model.ChartEntry
import cm.onehealth.cohrm.domain.model.DashboardUiState
import cm.onehealth.cohrm.domain.model.RumorItem
import cm.onehealth.cohrm.domain.model.TrendEntry
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Alert
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.PrimaryLight
import cm.onehealth.cohrm.ui.theme.Success
import cm.onehealth.cohrm.ui.theme.Warning

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNewReport: () -> Unit = {},
    onRumorClick: (Int) -> Unit = {},
    onViewAllRumors: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Box(modifier = Modifier.fillMaxSize()) {
        if (state.isLoading && state.stats.total == 0) {
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
                    .verticalScroll(rememberScrollState()),
            ) {
                // Refresh row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = stringResource(R.string.dashboard_title),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
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
                }

                // Error
                state.error?.let { error ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
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

                // KPI Cards
                KpiSection(state)

                Spacer(modifier = Modifier.height(16.dp))

                // Quick Stats Row
                QuickStatsRow(state)

                Spacer(modifier = Modifier.height(20.dp))

                // Trend Chart
                if (state.trends.isNotEmpty()) {
                    SectionTitle(stringResource(R.string.dashboard_trends), Icons.AutoMirrored.Filled.TrendingUp)
                    TrendChart(state.trends)
                    Spacer(modifier = Modifier.height(20.dp))
                }

                // By Status
                if (state.byStatus.isNotEmpty()) {
                    SectionTitle(stringResource(R.string.dashboard_by_status), Icons.Default.Assessment)
                    HorizontalBarChart(state.byStatus, ::statusColor)
                    Spacer(modifier = Modifier.height(20.dp))
                }

                // By Region
                if (state.byRegion.isNotEmpty()) {
                    SectionTitle(stringResource(R.string.dashboard_by_region))
                    HorizontalBarChart(state.byRegion, ::regionColor)
                    Spacer(modifier = Modifier.height(20.dp))
                }

                // By Category
                if (state.byCategory.isNotEmpty()) {
                    SectionTitle(stringResource(R.string.dashboard_by_category))
                    DonutChart(state.byCategory, ::categoryColor)
                    Spacer(modifier = Modifier.height(20.dp))
                }

                // By Source
                if (state.bySource.isNotEmpty()) {
                    SectionTitle(stringResource(R.string.dashboard_by_source))
                    HorizontalBarChart(state.bySource, ::sourceColor)
                    Spacer(modifier = Modifier.height(20.dp))
                }

                // By Priority
                if (state.byPriority.isNotEmpty()) {
                    SectionTitle(stringResource(R.string.dashboard_by_priority))
                    HorizontalBarChart(state.byPriority, ::priorityColor)
                    Spacer(modifier = Modifier.height(20.dp))
                }

                // Recent Rumors
                if (state.recentRumors.isNotEmpty()) {
                    SectionTitle(
                        stringResource(R.string.dashboard_recent),
                        Icons.Default.Notifications,
                    )
                    RecentRumorsList(
                        rumors = state.recentRumors,
                        onRumorClick = onRumorClick,
                        onViewAll = onViewAllRumors,
                    )
                }

                Spacer(modifier = Modifier.height(80.dp))
            }
            } // PullToRefreshBox
        }

        // FAB
        FloatingActionButton(
            onClick = onNewReport,
            containerColor = Accent,
            contentColor = Color.White,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
        ) {
            Icon(Icons.Default.Add, contentDescription = stringResource(R.string.home_new_report))
        }
    }
}

@Composable
private fun KpiSection(state: DashboardUiState) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        KpiCard(
            label = stringResource(R.string.dashboard_total),
            value = "${state.stats.total}",
            color = Primary,
            icon = Icons.Default.Assessment,
        )
        KpiCard(
            label = stringResource(R.string.status_pending),
            value = "${state.stats.pending}",
            color = Warning,
            icon = Icons.Default.Notifications,
        )
        KpiCard(
            label = stringResource(R.string.status_investigating),
            value = "${state.stats.investigating}",
            color = Info,
        )
        KpiCard(
            label = stringResource(R.string.status_confirmed),
            value = "${state.stats.confirmed}",
            color = Accent,
        )
        KpiCard(
            label = stringResource(R.string.dashboard_alerts),
            value = "${state.stats.highPriority + state.stats.critical}",
            color = Danger,
            icon = Icons.Default.Warning,
        )
    }
}

@Composable
private fun KpiCard(
    label: String,
    value: String,
    color: Color,
    icon: ImageVector? = null,
) {
    Card(
        modifier = Modifier.width(140.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (icon != null) {
                    Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                }
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
private fun QuickStatsRow(state: DashboardUiState) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        QuickStatChip(
            label = stringResource(R.string.dashboard_today),
            value = "${state.stats.todayCount}",
            color = Info,
            modifier = Modifier.weight(1f),
        )
        QuickStatChip(
            label = stringResource(R.string.dashboard_this_week),
            value = "${state.stats.weekCount}",
            color = Accent,
            modifier = Modifier.weight(1f),
        )
        QuickStatChip(
            label = stringResource(R.string.dashboard_this_month),
            value = "${state.stats.monthCount}",
            color = Primary,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun QuickStatChip(
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.08f)),
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(text = value, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = color)
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
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
private fun TrendChart(trends: List<TrendEntry>) {
    val lineColor = PrimaryLight
    val fillColor = PrimaryLight.copy(alpha = 0.15f)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .height(180.dp),
        shape = RoundedCornerShape(16.dp),
    ) {
        if (trends.isEmpty()) return@Card

        val maxCount = trends.maxOfOrNull { it.count } ?: 1
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
        ) {
            val w = size.width
            val h = size.height
            val step = if (trends.size > 1) w / (trends.size - 1) else w

            // Grid lines
            for (i in 0..4) {
                val y = h * i / 4
                drawLine(Color.LightGray.copy(alpha = 0.3f), Offset(0f, y), Offset(w, y))
            }

            if (trends.size < 2) return@Canvas

            // Line path
            val linePath = Path()
            val fillPath = Path()
            trends.forEachIndexed { index, entry ->
                val x = index * step
                val y = h - (entry.count.toFloat() / maxCount.coerceAtLeast(1)) * h
                if (index == 0) {
                    linePath.moveTo(x, y)
                    fillPath.moveTo(x, h)
                    fillPath.lineTo(x, y)
                } else {
                    linePath.lineTo(x, y)
                    fillPath.lineTo(x, y)
                }
            }
            fillPath.lineTo(w, h)
            fillPath.close()

            drawPath(fillPath, fillColor)
            drawPath(linePath, lineColor, style = Stroke(width = 3f))

            // Points
            trends.forEachIndexed { index, entry ->
                val x = index * step
                val y = h - (entry.count.toFloat() / maxCount.coerceAtLeast(1)) * h
                drawCircle(lineColor, radius = 4f, center = Offset(x, y))
            }

            // Labels
            val paint = android.graphics.Paint().apply {
                color = android.graphics.Color.GRAY
                textSize = 24f
                textAlign = android.graphics.Paint.Align.CENTER
            }
            val labelStep = (trends.size / 5).coerceAtLeast(1)
            trends.forEachIndexed { index, entry ->
                if (index % labelStep == 0 || index == trends.size - 1) {
                    val x = index * step
                    val dateStr = entry.date.takeLast(5)
                    drawContext.canvas.nativeCanvas.drawText(dateStr, x, h + 28f, paint)
                }
            }
        }
    }
}

@Composable
private fun HorizontalBarChart(
    items: List<ChartEntry>,
    colorFn: (String) -> Color,
) {
    val maxValue = items.maxOfOrNull { it.value } ?: 1
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .animateContentSize(),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            items.take(10).forEach { entry ->
                val fraction = entry.value.toFloat() / maxValue.coerceAtLeast(1)
                val color = colorFn(entry.key)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = formatLabel(entry.label),
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.width(90.dp),
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
                        text = "${entry.value}",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = color,
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun DonutChart(items: List<ChartEntry>, colorFn: (String) -> Color) {
    val total = items.sumOf { it.value }.coerceAtLeast(1)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Canvas(modifier = Modifier.size(120.dp)) {
                var startAngle = -90f
                items.forEach { entry ->
                    val sweep = (entry.value.toFloat() / total) * 360f
                    val color = colorFn(entry.key)
                    drawArc(
                        color = color,
                        startAngle = startAngle,
                        sweepAngle = sweep,
                        useCenter = false,
                        topLeft = Offset(10f, 10f),
                        size = Size(size.width - 20f, size.height - 20f),
                        style = Stroke(width = 28f),
                    )
                    startAngle += sweep
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                items.forEach { entry ->
                    val color = colorFn(entry.key)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(color),
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${formatLabel(entry.label)} (${entry.value})",
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun RecentRumorsList(
    rumors: List<RumorItem>,
    onRumorClick: (Int) -> Unit,
    onViewAll: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column {
            rumors.take(10).forEach { rumor ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onRumorClick(rumor.id) }
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    // Status dot
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(statusColor(rumor.status)),
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = rumor.title.ifEmpty { rumor.code },
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            text = "${rumor.region} • ${formatLabel(rumor.category)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    PriorityBadge(rumor.priority)
                }
            }
            // View all button
            Text(
                text = stringResource(R.string.see_all),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onViewAll() }
                    .padding(12.dp),
                style = MaterialTheme.typography.labelMedium,
                color = PrimaryLight,
                fontWeight = FontWeight.SemiBold,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            )
        }
    }
}

@Composable
private fun PriorityBadge(priority: String) {
    val color = priorityColor(priority)
    val label = when (priority) {
        "low" -> "B"
        "medium" -> "M"
        "high" -> "H"
        "critical" -> "C"
        else -> "?"
    }
    Box(
        modifier = Modifier
            .size(28.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.15f)),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = color)
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

private fun priorityColor(priority: String): Color = when (priority) {
    "low" -> Accent
    "medium" -> Warning
    "high" -> Alert
    "critical" -> Danger
    else -> Muted
}

private fun categoryColor(category: String): Color = when (category) {
    "human_health" -> Color(0xFFE74C3C)
    "animal_health" -> Color(0xFF9B59B6)
    "environmental" -> Color(0xFF27AE60)
    "safety" -> Color(0xFFE67E22)
    "disaster" -> Color(0xFF3498DB)
    "other" -> Muted
    else -> Muted
}

private fun sourceColor(source: String): Color = when (source) {
    "direct" -> Primary
    "field" -> Accent
    "sms" -> Warning
    "mobile" -> Info
    "web" -> Color(0xFF8E44AD)
    "scanner" -> Color(0xFF1ABC9C)
    "social_media" -> Color(0xFFE91E63)
    "media" -> Color(0xFF795548)
    else -> Muted
}

private fun regionColor(region: String): Color {
    val colors = listOf(
        Primary, Accent, Warning, Info, Alert, Color(0xFF8E44AD),
        Color(0xFF1ABC9C), Danger, Color(0xFF795548), Color(0xFFE91E63),
    )
    val index = region.hashCode().and(0x7FFFFFFF) % colors.size
    return colors[index]
}

private fun formatLabel(label: String): String =
    label.replace("_", " ").replaceFirstChar { it.uppercase() }
