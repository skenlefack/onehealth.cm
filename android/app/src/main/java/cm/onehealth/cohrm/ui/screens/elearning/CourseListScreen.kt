package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun CourseListScreen(
    onCourseClick: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: CourseListViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
            OutlinedTextField(
                value = state.search, onValueChange = { viewModel.setSearch(it) },
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                placeholder = { Text(stringResource(R.string.rumors_search)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true, shape = RoundedCornerShape(12.dp),
            )
            // Level filter chips
            Row(modifier = Modifier.padding(horizontal = 16.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(null to stringResource(R.string.status_all), "beginner" to stringResource(R.string.el_level_beginner), "intermediate" to stringResource(R.string.el_level_intermediate), "advanced" to stringResource(R.string.el_level_advanced)).forEach { (level, label) ->
                    FilterChip(selected = state.level == level, onClick = { viewModel.setLevel(level) }, label = { Text(label) })
                }
            }
            // Category filter chips
            if (state.categories.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(modifier = Modifier.padding(horizontal = 16.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = state.category == null, onClick = { viewModel.setCategory(null) }, label = { Text(stringResource(R.string.status_all)) })
                    state.categories.forEach { cat ->
                        FilterChip(
                            selected = state.category == cat.slug,
                            onClick = { viewModel.setCategory(cat.slug) },
                            label = { Text(cat.nameFr ?: cat.nameEn ?: "") },
                        )
                    }
                }
            }
            // Sort dropdown
            Spacer(modifier = Modifier.height(4.dp))
            Row(modifier = Modifier.padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                var sortExpanded by remember { mutableStateOf(false) }
                val sortOptions = listOf(
                    null to stringResource(R.string.status_all),
                    "recent" to stringResource(R.string.el_sort_recent),
                    "popular" to stringResource(R.string.el_sort_popular),
                    "duration" to stringResource(R.string.el_sort_duration),
                )
                val currentSortLabel = sortOptions.firstOrNull { it.first == state.sort }?.second ?: stringResource(R.string.el_sort)
                Box {
                    OutlinedButton(onClick = { sortExpanded = true }, shape = RoundedCornerShape(8.dp)) {
                        Icon(Icons.Default.Sort, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${stringResource(R.string.el_sort)}: $currentSortLabel")
                    }
                    DropdownMenu(expanded = sortExpanded, onDismissRequest = { sortExpanded = false }) {
                        sortOptions.forEach { (value, label) ->
                            DropdownMenuItem(
                                text = { Text(label) },
                                onClick = { viewModel.setSort(value); sortExpanded = false },
                            )
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))

            if (state.isLoading && state.courses.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(state.courses) { course ->
                        CourseCard(course = course, onClick = { course.slug?.let(onCourseClick) })
                    }
                    if (state.page < state.totalPages) {
                        item(span = { GridItemSpan(2) }) {
                            Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary, modifier = Modifier.size(24.dp)) }
                            LaunchedEffect(Unit) { viewModel.loadMore() }
                        }
                    }
                }
            }
        }
    }

