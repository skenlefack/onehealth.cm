package cm.onehealth.cohrm.ui.screens.ohwr

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.ohwr.OhwrExpertDto
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage

@Composable
fun OhwrExpertsScreen(
    onExpertClick: (Int) -> Unit,
    onBack: () -> Unit,
    viewModel: OhwrExpertsViewModel = hiltViewModel(),
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

            // Category filter chips
            Row(
                modifier = Modifier.padding(horizontal = 16.dp).horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = state.category == null,
                    onClick = { viewModel.setCategory(null) },
                    label = { Text(stringResource(R.string.status_all)) },
                )
                listOf(
                    "santé humaine" to R.string.ohwr_category_human_health,
                    "santé animale" to R.string.ohwr_category_animal_health,
                    "environnement" to R.string.ohwr_category_environment,
                ).forEach { (key, labelRes) ->
                    FilterChip(
                        selected = state.category == key,
                        onClick = { viewModel.setCategory(key) },
                        label = { Text(stringResource(labelRes)) },
                    )
                }
            }

            if (!state.isLoading && state.experts.isNotEmpty()) {
                Text(
                    "${state.experts.size} ${stringResource(R.string.ohwr_results_found)}",
                    fontSize = 12.sp,
                    color = Muted,
                    modifier = Modifier.padding(horizontal = 16.dp),
                )
            }

            if (state.isLoading && state.experts.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = OhwrPrimary)
                }
            } else if (state.isGridView) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(state.experts) { expert ->
                        ExpertRow(expert = expert, onClick = { onExpertClick(expert.id) })
                    }
                    if (state.page < state.totalPages) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = OhwrPrimary, modifier = Modifier.size(24.dp))
                            }
                            LaunchedEffect(Unit) { viewModel.loadMore() }
                        }
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(state.experts) { expert ->
                        ExpertRow(expert = expert, onClick = { onExpertClick(expert.id) })
                    }
                    if (state.page < state.totalPages) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = OhwrPrimary, modifier = Modifier.size(24.dp))
                            }
                            LaunchedEffect(Unit) { viewModel.loadMore() }
                        }
                    }
                }
            }
        }
    }

@Composable
private fun ExpertRow(expert: OhwrExpertDto, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            // Avatar
            Box(
                modifier = Modifier.size(48.dp).clip(CircleShape).background(OhwrLight.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center,
            ) {
                if (expert.photo != null) {
                    AsyncImage(model = expert.photo, contentDescription = null, modifier = Modifier.fillMaxSize().clip(CircleShape), contentScale = ContentScale.Crop)
                } else {
                    Text(
                        text = (expert.firstName?.firstOrNull() ?: "?").toString().uppercase(),
                        fontWeight = FontWeight.Bold, fontSize = 18.sp, color = OhwrPrimary,
                    )
                }
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(expert.fullName, fontWeight = FontWeight.Medium, fontSize = 15.sp, maxLines = 1)
                if (!expert.title.isNullOrBlank()) {
                    Text(expert.title, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (!expert.category.isNullOrBlank()) {
                        Surface(shape = RoundedCornerShape(8.dp), color = OhwrLight.copy(alpha = 0.1f)) {
                            Text(expert.category, fontSize = 11.sp, color = OhwrPrimary, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }
                    if (!expert.region.isNullOrBlank()) {
                        Text(expert.region, fontSize = 11.sp, color = Muted)
                    }
                }
            }
            if (expert.isVerified == 1) {
                Icon(Icons.Default.Verified, contentDescription = null, tint = Info, modifier = Modifier.size(20.dp))
            }
        }
    }
}
