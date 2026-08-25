package cm.onehealth.cohrm.ui.screens.ohwr

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun OhwrDocumentsScreen(
    onDocumentClick: (Int) -> Unit = {},
    onBack: () -> Unit,
    viewModel: OhwrDocumentsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
            // Search + Grid toggle
            Row(modifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = state.search,
                    onValueChange = { viewModel.setSearch(it) },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text(stringResource(R.string.ohwr_search)) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                )
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(onClick = { viewModel.toggleGridView() }) {
                    Icon(
                        if (state.isGridView) Icons.Default.ViewList else Icons.Default.GridView,
                        contentDescription = null,
                        tint = OhwrPrimary,
                    )
                }
            }

            // Type filter chips
            Row(
                modifier = Modifier.padding(horizontal = 16.dp).horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = state.type == null,
                    onClick = { viewModel.setType(null) },
                    label = { Text(stringResource(R.string.status_all)) },
                )
                listOf(
                    "guide" to R.string.ohwr_type_guide,
                    "protocol" to R.string.ohwr_type_protocol,
                    "article" to R.string.ohwr_type_article,
                    "report" to R.string.ohwr_type_report,
                    "policy" to R.string.ohwr_type_policy,
                ).forEach { (key, labelRes) ->
                    FilterChip(
                        selected = state.type == key,
                        onClick = { viewModel.setType(key) },
                        label = { Text(stringResource(labelRes)) },
                    )
                }
            }

            if (!state.isLoading && state.documents.isNotEmpty()) {
                Text(
                    "${state.documents.size} ${stringResource(R.string.ohwr_results_found)}",
                    fontSize = 12.sp,
                    color = Muted,
                    modifier = Modifier.padding(horizontal = 16.dp),
                )
            }

            if (state.isLoading && state.documents.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OhwrPrimary) }
            } else if (state.isGridView) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(state.documents) { doc ->
                        val typeIcon = when (doc.type?.lowercase()) {
                            "guide" -> Icons.Default.MenuBook; "protocol" -> Icons.Default.Gavel; "article" -> Icons.Default.Article
                            "report" -> Icons.Default.Assessment; "policy" -> Icons.Default.Policy; else -> Icons.Default.Description
                        }
                        Card(modifier = Modifier.fillMaxWidth().clickable { onDocumentClick(doc.id) }, shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(typeIcon, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(32.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(doc.title, fontWeight = FontWeight.Medium, fontSize = 15.sp, maxLines = 2)
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        if (!doc.type.isNullOrBlank()) Text(doc.type, fontSize = 11.sp, color = Muted)
                                        if (!doc.organizationAcronym.isNullOrBlank()) Text(doc.organizationAcronym, fontSize = 11.sp, color = Muted)
                                        if (!doc.publicationDate.isNullOrBlank()) Text(doc.publicationDate.take(10), fontSize = 11.sp, color = Muted)
                                    }
                                }
                            }
                        }
                    }
                    if (state.page < state.totalPages) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OhwrPrimary, modifier = Modifier.size(24.dp)) }
                            LaunchedEffect(Unit) { viewModel.loadMore() }
                        }
                    }
                }
            } else {
                LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(state.documents) { doc ->
                        val typeIcon = when (doc.type?.lowercase()) {
                            "guide" -> Icons.Default.MenuBook; "protocol" -> Icons.Default.Gavel; "article" -> Icons.Default.Article
                            "report" -> Icons.Default.Assessment; "policy" -> Icons.Default.Policy; else -> Icons.Default.Description
                        }
                        Card(modifier = Modifier.fillMaxWidth().clickable { onDocumentClick(doc.id) }, shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(typeIcon, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(32.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(doc.title, fontWeight = FontWeight.Medium, fontSize = 15.sp, maxLines = 2)
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        if (!doc.type.isNullOrBlank()) Text(doc.type, fontSize = 11.sp, color = Muted)
                                        if (!doc.organizationAcronym.isNullOrBlank()) Text(doc.organizationAcronym, fontSize = 11.sp, color = Muted)
                                        if (!doc.publicationDate.isNullOrBlank()) Text(doc.publicationDate.take(10), fontSize = 11.sp, color = Muted)
                                    }
                                }
                            }
                        }
                    }
                    if (state.page < state.totalPages) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OhwrPrimary, modifier = Modifier.size(24.dp)) }
                            LaunchedEffect(Unit) { viewModel.loadMore() }
                        }
                    }
                }
            }
        }
    }

