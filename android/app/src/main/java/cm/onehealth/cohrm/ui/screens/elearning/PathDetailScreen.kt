package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
fun PathDetailScreen(
    slug: String,
    onCourseClick: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: PathDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.path?.localizedTitle ?: stringResource(R.string.loading)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ELearningPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        when {
            state.isLoading -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
            state.error != null -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { Text(state.error!!, color = Danger) }
            state.path != null -> {
                val path = state.path!!
                Column(modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState())) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(path.localizedTitle, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                        val desc = path.descriptionFr ?: path.descriptionEn
                        if (!desc.isNullOrBlank()) Text(desc.replace(Regex("<[^>]*>"), ""), fontSize = 14.sp, lineHeight = 22.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            path.courseCount?.let { Text("$it cours", fontSize = 13.sp, color = Muted) }
                            path.durationHours?.let { Text("${it}h", fontSize = 13.sp, color = Muted) }
                        }

                        Text(stringResource(R.string.el_path_courses), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        path.courses?.forEachIndexed { idx, course ->
                            Card(modifier = Modifier.fillMaxWidth().clickable { course.slug?.let(onCourseClick) }, shape = RoundedCornerShape(12.dp)) {
                                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Surface(shape = RoundedCornerShape(8.dp), color = ELearningPrimary.copy(alpha = 0.1f)) {
                                        Text("${idx + 1}", modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), fontWeight = FontWeight.Bold, color = ELearningPrimary)
                                    }
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(course.localizedTitle, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            course.moduleCount?.let { Text("$it mod.", fontSize = 11.sp, color = Muted) }
                                            course.durationHours?.let { Text("${it}h", fontSize = 11.sp, color = Muted) }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
