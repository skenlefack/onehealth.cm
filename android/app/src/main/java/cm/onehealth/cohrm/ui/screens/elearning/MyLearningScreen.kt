package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage

@Composable
fun MyLearningScreen(
    onCourseClick: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: MyLearningViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
            // Filter tabs
            Row(modifier = Modifier.padding(16.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("all" to stringResource(R.string.status_all), "in_progress" to stringResource(R.string.el_in_progress), "completed" to stringResource(R.string.el_completed)).forEach { (key, label) ->
                    FilterChip(selected = state.filter == key, onClick = { viewModel.setFilter(key) }, label = { Text(label) })
                }
            }

            if (state.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
            } else if (state.enrollments.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(stringResource(R.string.el_no_enrollments), color = Muted) }
            } else {
                LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(state.enrollments) { enrollment ->
                        Card(modifier = Modifier.fillMaxWidth().clickable { enrollment.slug?.let(onCourseClick) }, shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                if (enrollment.thumbnail != null) {
                                    AsyncImage(model = enrollment.thumbnail, contentDescription = null, modifier = Modifier.size(80.dp, 60.dp).clip(RoundedCornerShape(8.dp)), contentScale = ContentScale.Crop)
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(enrollment.localizedTitle, fontWeight = FontWeight.Medium, fontSize = 14.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    LinearProgressIndicator(
                                        progress = { (enrollment.progressPercent ?: 0) / 100f },
                                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                                        color = if (enrollment.status == "completed") Success else ELearningPrimary,
                                    )
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("${enrollment.progressPercent ?: 0}%", fontSize = 12.sp, color = Muted)
                                        val statusColor = when (enrollment.status) { "completed" -> Success; "in_progress" -> ELearningPrimary; else -> Muted }
                                        Text(enrollment.status ?: "", fontSize = 11.sp, color = statusColor)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        if (enrollment.lessonsCompleted != null) {
                                            Text("${enrollment.lessonsCompleted} ${stringResource(R.string.el_lessons_done)}", fontSize = 11.sp, color = Muted)
                                        }
                                        if (enrollment.totalTimeSpentMinutes != null && enrollment.totalTimeSpentMinutes > 0) {
                                            Text("${enrollment.totalTimeSpentMinutes} min", fontSize = 11.sp, color = Muted)
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

