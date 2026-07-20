package cm.onehealth.cohrm.ui.screens.rumors

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Alert
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.Warning

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RumorsListScreen(
    onRumorClick: (Int) -> Unit = {},
    viewModel: RumorsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showSearch by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = {
                Text("${stringResource(R.string.rumors_title)} (${state.total})")
            },
            actions = {
                androidx.compose.material3.IconButton(onClick = { showSearch = !showSearch }) {
                    Icon(Icons.Default.Search, contentDescription = null)
                }
                androidx.compose.material3.IconButton(onClick = { viewModel.clearFilters() }) {
                    Icon(Icons.Default.FilterList, contentDescription = null)
                }
            },
        )

        // Search bar
        if (showSearch) {
            OutlinedTextField(
                value = state.searchQuery,
                onValueChange = { viewModel.setSearch(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                placeholder = { Text(stringResource(R.string.rumors_search)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
            )
        }

        // Status filter chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            val statuses = listOf(
                null to stringResource(R.string.status_all),
                "pending" to stringResource(R.string.status_pending),
                "investigating" to stringResource(R.string.status_investigating),
                "confirmed" to stringResource(R.string.status_confirmed),
                "false_alarm" to stringResource(R.string.status_false_alarm),
                "closed" to stringResource(R.string.status_closed),
            )
            statuses.forEach { (value, label) ->
                FilterChip(
                    selected = state.filterStatus == value,
                    onClick = { viewModel.setFilter(status = value) },
                    label = { Text(label, style = MaterialTheme.typography.labelSmall) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Primary.copy(alpha = 0.15f),
                    ),
                )
            }
        }

        // Offline data indicator
        if (state.isOfflineData) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF57C00))
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    Icons.Default.FilterList,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(14.dp),
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = stringResource(R.string.connectivity_offline) + " - Données en cache",
                    color = Color.White,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Medium,
                )
            }
        }

        // Content
        if (state.isLoading && state.rumors.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (state.rumors.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = stringResource(R.string.rumors_empty),
                        style = MaterialTheme.typography.titleMedium,
                        color = Muted,
                    )
                    Text(
                        text = stringResource(R.string.rumors_empty_subtitle),
                        style = MaterialTheme.typography.bodySmall,
                        color = Muted,
                    )
                }
            }
        } else {
            val listState = rememberLazyListState()
            val shouldLoadMore by remember {
                derivedStateOf {
                    val lastVisibleItem = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
                    lastVisibleItem >= state.rumors.size - 3
                }
            }

            LaunchedEffect(shouldLoadMore) {
                snapshotFlow { shouldLoadMore }.collect { if (it) viewModel.loadMore() }
            }

            PullToRefreshBox(
                isRefreshing = state.isLoading,
                onRefresh = { viewModel.loadRumors() },
            ) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                ) {
                    items(state.rumors, key = { it.id }) { rumor ->
                        RumorListItem(rumor = rumor, onClick = { onRumorClick(rumor.id) })
                    }
                    if (state.isLoadingMore) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RumorListItem(rumor: RumorDetail, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.Top,
        ) {
            // Status indicator
            Box(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .size(12.dp)
                    .clip(CircleShape)
                    .background(statusColor(rumor.status)),
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                // Title + code
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        text = rumor.title.ifEmpty { "Sans titre" },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                    )
                    if (rumor.code.isNotEmpty()) {
                        Text(
                            text = rumor.code,
                            style = MaterialTheme.typography.labelSmall,
                            color = Muted,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Info row
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    InfoChip(text = formatLabel(rumor.category), color = categoryColor(rumor.category))
                    InfoChip(text = rumor.region, color = Muted)
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Bottom row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = formatDate(rumor.createdAt),
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        PriorityChip(rumor.priority)
                        if (rumor.riskLevel != "unknown") {
                            RiskChip(rumor.riskLevel)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoChip(text: String, color: Color) {
    if (text.isBlank()) return
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.1f))
            .padding(horizontal = 6.dp, vertical = 2.dp),
    ) {
        Text(text = text, fontSize = 10.sp, color = color, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun PriorityChip(priority: String) {
    val color = priorityColor(priority)
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 6.dp, vertical = 2.dp),
    ) {
        Text(text = formatLabel(priority), fontSize = 10.sp, color = color, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun RiskChip(risk: String) {
    val color = riskColor(risk)
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 6.dp, vertical = 2.dp),
    ) {
        Text(text = "R:${risk.take(3).uppercase()}", fontSize = 10.sp, color = color, fontWeight = FontWeight.Bold)
    }
}

// Utility functions
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

private fun riskColor(risk: String): Color = when (risk) {
    "low" -> Accent
    "moderate" -> Warning
    "high" -> Alert
    "very_high" -> Danger
    else -> Muted
}

private fun categoryColor(category: String): Color = when (category) {
    "human_health" -> Color(0xFFE74C3C)
    "animal_health" -> Color(0xFF9B59B6)
    "environmental" -> Color(0xFF27AE60)
    "safety" -> Color(0xFFE67E22)
    "disaster" -> Color(0xFF3498DB)
    else -> Muted
}

private fun formatLabel(label: String): String =
    label.replace("_", " ").replaceFirstChar { it.uppercase() }

private fun formatDate(dateStr: String): String {
    if (dateStr.length < 10) return dateStr
    return try {
        "${dateStr.substring(8, 10)}/${dateStr.substring(5, 7)}/${dateStr.substring(0, 4)}"
    } catch (e: Exception) {
        dateStr
    }
}
