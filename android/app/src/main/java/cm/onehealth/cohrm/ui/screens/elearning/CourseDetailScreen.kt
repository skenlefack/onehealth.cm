package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage

@Composable
fun CourseDetailScreen(
    slug: String,
    onLessonClick: (Int) -> Unit,
    onQuizClick: (Int) -> Unit,
    onBack: () -> Unit,
    viewModel: CourseDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.course?.localizedTitle ?: stringResource(R.string.loading)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ELearningPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        when {
            state.isLoading -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
            state.error != null -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { Text(state.error!!, color = Danger) }
            state.course != null -> {
                val course = state.course!!
                Column(modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState())) {
                    // Header image
                    Box(modifier = Modifier.fillMaxWidth().height(180.dp)) {
                        if (course.thumbnail != null) AsyncImage(model = course.thumbnail, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                        else Box(modifier = Modifier.fillMaxSize().background(Brush.linearGradient(listOf(ELearningPrimary, ELearningLight))))
                        // Level + category badges
                        Row(modifier = Modifier.align(Alignment.BottomStart).padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            course.level?.let { Surface(shape = RoundedCornerShape(8.dp), color = Color.Black.copy(alpha = 0.6f)) { Text(it, color = Color.White, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)) } }
                            course.categoryNameFr?.let { Surface(shape = RoundedCornerShape(8.dp), color = ELearningPrimary.copy(alpha = 0.9f)) { Text(it, color = Color.White, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)) } }
                        }
                    }

                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(course.localizedTitle, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        if (course.instructorName.isNotBlank()) {
                            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                    if (course.instructorAvatar != null) {
                                        AsyncImage(
                                            model = course.instructorAvatar,
                                            contentDescription = null,
                                            modifier = Modifier.size(48.dp).clip(RoundedCornerShape(24.dp)),
                                            contentScale = ContentScale.Crop,
                                        )
                                    } else {
                                        Box(
                                            modifier = Modifier.size(48.dp).clip(RoundedCornerShape(24.dp)).background(ELearningPrimary.copy(alpha = 0.1f)),
                                            contentAlignment = Alignment.Center,
                                        ) {
                                            Text(
                                                course.instructorName.take(2).uppercase(),
                                                fontWeight = FontWeight.Bold,
                                                color = ELearningPrimary,
                                            )
                                        }
                                    }
                                    Column {
                                        Text(stringResource(R.string.el_instructor), fontSize = 12.sp, color = Muted)
                                        Text(course.instructorName, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                                    }
                                }
                            }
                        }

                        // Stats row
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            course.durationHours?.let { CourseStatItem(Icons.Default.AccessTime, "${it}h") }
                            course.moduleCount?.let { CourseStatItem(Icons.Default.Folder, "$it mod.") }
                            course.lessonCount?.let { CourseStatItem(Icons.Default.PlayCircle, "$it leçons") }
                            course.enrolledCount?.let { CourseStatItem(Icons.Default.People, "$it") }
                        }

                        // Enrollment
                        if (course.enrollment != null) {
                            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = ELearningPrimary.copy(alpha = 0.08f))) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(stringResource(R.string.el_your_progress), fontWeight = FontWeight.Medium)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    LinearProgressIndicator(
                                        progress = { (course.enrollment.progressPercent ?: 0) / 100f },
                                        modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                        color = ELearningPrimary,
                                    )
                                    Text("${course.enrollment.progressPercent ?: 0}%", fontSize = 13.sp, color = ELearningPrimary)
                                }
                            }
                            TextButton(
                                onClick = { viewModel.unenroll() },
                                modifier = Modifier.align(Alignment.End),
                            ) {
                                Icon(Icons.Default.ExitToApp, contentDescription = null, tint = Danger, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(stringResource(R.string.el_unenroll), color = Danger, fontSize = 12.sp)
                            }
                        } else {
                            Button(
                                onClick = { viewModel.enroll() },
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ELearningPrimary),
                                shape = RoundedCornerShape(12.dp),
                                enabled = !state.isEnrolling,
                            ) {
                                if (state.isEnrolling) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                                else { Icon(Icons.Default.School, contentDescription = null); Spacer(modifier = Modifier.width(8.dp)); Text(stringResource(R.string.el_enroll), fontWeight = FontWeight.Bold) }
                            }
                        }

                        // Description
                        val desc = course.descriptionFr ?: course.descriptionEn
                        if (!desc.isNullOrBlank()) {
                            Text(stringResource(R.string.el_description), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text(desc.replace(Regex("<[^>]*>"), ""), fontSize = 14.sp, lineHeight = 22.sp)
                        }

                        // Learning objectives
                        if (!course.learningObjectives.isNullOrEmpty()) {
                            Text(stringResource(R.string.el_objectives), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            course.learningObjectives.forEach { obj ->
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Success, modifier = Modifier.size(18.dp))
                                    Text(obj, fontSize = 14.sp)
                                }
                            }
                        }

                        // Prerequisites
                        if (!course.prerequisites.isNullOrEmpty()) {
                            Text(stringResource(R.string.el_prerequisites), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            course.prerequisites.forEach { prereq ->
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Icon(Icons.Default.ArrowRight, contentDescription = null, tint = Warning, modifier = Modifier.size(18.dp))
                                    Text(prereq, fontSize = 14.sp)
                                }
                            }
                        }

                        // Curriculum
                        val modules = state.curriculum?.modules ?: course.modules
                        if (!modules.isNullOrEmpty()) {
                            Text(stringResource(R.string.el_curriculum), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            modules.forEachIndexed { mi, module ->
                                var expanded by remember { mutableStateOf(mi == 0) }
                                Card(modifier = Modifier.fillMaxWidth()) {
                                    Column {
                                        Row(
                                            modifier = Modifier.fillMaxWidth().clickable { expanded = !expanded }.padding(12.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically,
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(module.localizedTitle, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                                Text("${module.lessonCount ?: module.lessons?.size ?: 0} leçons", fontSize = 12.sp, color = Muted)
                                            }
                                            Icon(if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore, contentDescription = null)
                                        }
                                        if (expanded) {
                                            module.lessons?.forEach { lesson ->
                                                HorizontalDivider()
                                                Row(
                                                    modifier = Modifier.fillMaxWidth().clickable(enabled = lesson.isLocked != true) { onLessonClick(lesson.id) }.padding(horizontal = 16.dp, vertical = 10.dp),
                                                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
                                                ) {
                                                    Icon(
                                                        when {
                                                            lesson.isLocked == true -> Icons.Default.Lock
                                                            lesson.isCompleted == true -> Icons.Default.CheckCircle
                                                            else -> Icons.Default.PlayCircleOutline
                                                        },
                                                        contentDescription = null,
                                                        tint = when {
                                                            lesson.isCompleted == true -> Success
                                                            lesson.isLocked == true -> Muted
                                                            else -> ELearningPrimary
                                                        },
                                                        modifier = Modifier.size(20.dp),
                                                    )
                                                    Column(modifier = Modifier.weight(1f)) {
                                                        Text(lesson.localizedTitle, fontSize = 13.sp, color = if (lesson.isLocked == true) Muted else MaterialTheme.colorScheme.onSurface)
                                                        if (lesson.durationMinutes != null) Text("${lesson.durationMinutes} min", fontSize = 11.sp, color = Muted)
                                                    }
                                                    lesson.contentType?.let { Text(it, fontSize = 10.sp, color = Muted) }
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
    }
}

@Composable
private fun CourseStatItem(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(20.dp))
        Text(text, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}
