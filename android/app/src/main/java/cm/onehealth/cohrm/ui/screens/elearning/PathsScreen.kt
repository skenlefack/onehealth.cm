package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
fun PathsScreen(
    onPathClick: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: PathsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.el_paths)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ELearningPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(
                value = state.search, onValueChange = { viewModel.setSearch(it) },
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                placeholder = { Text(stringResource(R.string.rumors_search)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true, shape = RoundedCornerShape(12.dp),
            )
            if (state.isLoading && state.paths.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
            } else {
                LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(state.paths) { path ->
                        Card(modifier = Modifier.fillMaxWidth().clickable { path.slug?.let(onPathClick) }, shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(Icons.Default.Route, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(36.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(path.localizedTitle, fontWeight = FontWeight.Medium, fontSize = 15.sp)
                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Text("${path.courseCount ?: 0} cours", fontSize = 12.sp, color = Muted)
                                        if (path.durationHours != null) Text("${path.durationHours}h", fontSize = 12.sp, color = Muted)
                                        if (path.enrolledCount != null) Text("${path.enrolledCount} inscrits", fontSize = 12.sp, color = Muted)
                                    }
                                }
                                if (path.certificateEnabled == true) Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = Warning, modifier = Modifier.size(20.dp))
                            }
                        }
                    }
                    if (state.page < state.totalPages) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary, modifier = Modifier.size(24.dp)) }
                            LaunchedEffect(Unit) { viewModel.loadMore() }
                        }
                    }
                }
            }
        }
    }
}
