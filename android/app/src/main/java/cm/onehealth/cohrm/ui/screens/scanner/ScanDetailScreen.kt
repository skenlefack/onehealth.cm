package cm.onehealth.cohrm.ui.screens.scanner

import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.dto.ScanDetail
import cm.onehealth.cohrm.data.remote.dto.ScanResultItem
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.Success
import cm.onehealth.cohrm.ui.theme.Warning

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanDetailScreen(
    onBack: () -> Unit = {},
    viewModel: ScanDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.scanner_detail_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = null,
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Primary,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                ),
            )
        },
    ) { paddingValues ->
        when {
            state.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
            }
            state.error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = state.error ?: "",
                            color = Danger,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }
            state.detail != null -> {
                ScanDetailContent(
                    detail = state.detail!!,
                    modifier = Modifier.padding(paddingValues),
                )
            }
        }
    }
}

@Composable
private fun ScanDetailContent(
    detail: ScanDetail,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
    ) {
        // Summary card
        item {
            ScanSummaryCard(detail)
        }

        // Results title
        if (detail.results.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "${detail.results.size} resultats",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                )
            }
        }

        // Empty results
        if (detail.results.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = stringResource(R.string.scanner_no_results),
                        style = MaterialTheme.typography.bodyMedium,
                        color = Muted,
                    )
                }
            }
        }

        // Result items
        items(detail.results, key = { it.id }) { result ->
            ScanResultCard(result)
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ScanSummaryCard(detail: ScanDetail) {
    val statusColor = when (detail.status) {
        "running" -> Warning
        "completed" -> Success
        "failed" -> Danger
        "partial" -> Warning
        else -> Muted
    }
    val statusLabel = when (detail.status) {
        "running" -> R.string.scanner_status_running
        "completed" -> R.string.scanner_status_completed
        "failed" -> R.string.scanner_status_failed
        else -> R.string.scanner_status_running
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Source: ${formatSourceLabel(detail.source)}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                )
                // Status badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(statusColor.copy(alpha = 0.12f))
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                ) {
                    Text(
                        text = stringResource(statusLabel),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = statusColor,
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Stats
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                StatItem(
                    label = stringResource(R.string.scanner_items_scanned, detail.itemsScanned),
                    color = Info,
                )
                StatItem(
                    label = stringResource(R.string.scanner_rumors_found, detail.rumorsFound),
                    color = if (detail.rumorsFound > 0) Accent else Muted,
                )
                detail.duration?.let { duration ->
                    StatItem(
                        label = stringResource(R.string.scanner_duration, duration),
                        color = Muted,
                    )
                }
            }

            // Keywords
            val detailKeywords = detail.keywordsList()
            if (detailKeywords.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    detailKeywords.forEach { keyword ->
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
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatItem(label: String, color: Color) {
    Text(
        text = label,
        style = MaterialTheme.typography.bodySmall,
        fontWeight = FontWeight.Medium,
        color = color,
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ScanResultCard(result: ScanResultItem) {
    val context = LocalContext.current
    val relevance = result.relevanceScore ?: 0.0
    val relevanceColor = when {
        relevance > 0.7 -> Success
        relevance > 0.4 -> Warning
        else -> Danger
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Title
            result.title?.let { title ->
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(modifier = Modifier.height(4.dp))
            }

            // Content preview
            result.content?.let { content ->
                Text(
                    text = content,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(modifier = Modifier.height(6.dp))
            }

            // Source + Author row
            Row(
                verticalAlignment = Alignment.CenterVertically,
            ) {
                result.source?.let { source ->
                    Text(
                        text = source,
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                    )
                }
                if (result.source != null && result.author != null) {
                    Text(
                        text = " \u2022 ",
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                    )
                }
                result.author?.let { author ->
                    Text(
                        text = author,
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
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
            val resultKeywords = result.matchedKeywordsList()
            if (resultKeywords.isNotEmpty()) {
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    resultKeywords.forEach { keyword ->
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

            // URL
            result.url?.let { url ->
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = url,
                    style = MaterialTheme.typography.labelSmall,
                    color = Info,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.clickable {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                            context.startActivity(intent)
                        } catch (_: Exception) {
                            // No browser available
                        }
                    },
                )
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
