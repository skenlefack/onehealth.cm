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
fun OhwrOrganizationsScreen(
    onBack: () -> Unit,
    viewModel: OhwrOrganizationsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.ohwr_organizations_label)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OhwrPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
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
                    "gouvernement" to "Gouvernement",
                    "ong" to "ONG",
                    "international" to "International",
                    "recherche" to "Recherche",
                    "privé" to "Privé",
                ).forEach { (key, label) ->
                    FilterChip(
                        selected = state.type == key,
                        onClick = { viewModel.setType(key) },
                        label = { Text(label) },
                    )
                }
            }

            if (!state.isLoading && state.organizations.isNotEmpty()) {
                Text(
                    "${state.organizations.size} ${stringResource(R.string.ohwr_results_found)}",
                    fontSize = 12.sp,
                    color = Muted,
                    modifier = Modifier.padding(horizontal = 16.dp),
                )
            }

            if (state.isLoading && state.organizations.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OhwrPrimary) }
            } else if (state.isGridView) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(state.organizations) { org ->
                        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(Icons.Default.Business, contentDescription = null, tint = Success, modifier = Modifier.size(32.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(org.displayName, fontWeight = FontWeight.Medium, fontSize = 15.sp, maxLines = 1)
                                    if (!org.type.isNullOrBlank()) Text(org.type, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    if (!org.region.isNullOrBlank()) Text(org.region, fontSize = 11.sp, color = Muted)
                                }
                                if (org.expertCount != null && org.expertCount > 0) {
                                    Surface(shape = RoundedCornerShape(8.dp), color = Info.copy(alpha = 0.1f)) {
                                        Text("${org.expertCount}", fontSize = 12.sp, color = Info, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
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
                    items(state.organizations) { org ->
                        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(Icons.Default.Business, contentDescription = null, tint = Success, modifier = Modifier.size(32.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(org.displayName, fontWeight = FontWeight.Medium, fontSize = 15.sp, maxLines = 1)
                                    if (!org.type.isNullOrBlank()) Text(org.type, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    if (!org.region.isNullOrBlank()) Text(org.region, fontSize = 11.sp, color = Muted)
                                }
                                if (org.expertCount != null && org.expertCount > 0) {
                                    Surface(shape = RoundedCornerShape(8.dp), color = Info.copy(alpha = 0.1f)) {
                                        Text("${org.expertCount}", fontSize = 12.sp, color = Info, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
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
}
