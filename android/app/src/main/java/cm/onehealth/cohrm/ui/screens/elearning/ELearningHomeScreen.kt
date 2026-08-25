package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.elearning.ELCourseDto
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage

@Composable
fun ELearningHomeScreen(
    onCourseClick: (String) -> Unit,
    onViewAllCourses: () -> Unit,
    onViewMyLearning: () -> Unit,
    onViewPaths: () -> Unit,
    onBack: () -> Unit,
    viewModel: ELearningHomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        // Header
        Box(
            modifier = Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(ELearningPrimary, ELearningLight))).padding(20.dp),
        ) {
            Column {
                // Stats
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    ELStatPill("${state.stats?.enrolled ?: 0}", stringResource(R.string.el_enrolled))
                    ELStatPill("${state.stats?.completed ?: 0}", stringResource(R.string.el_completed))
                    ELStatPill("${state.stats?.certificates ?: 0}", stringResource(R.string.el_certificates))
                }
            }
        }

        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            // Quick actions
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                QuickAction(title = stringResource(R.string.el_all_courses), icon = Icons.Default.MenuBook, onClick = onViewAllCourses, modifier = Modifier.weight(1f))
                QuickAction(title = stringResource(R.string.el_my_learning), icon = Icons.Default.School, onClick = onViewMyLearning, modifier = Modifier.weight(1f))
                QuickAction(title = stringResource(R.string.el_paths), icon = Icons.Default.Route, onClick = onViewPaths, modifier = Modifier.weight(1f))
            }

            // Featured courses
            if (state.featuredCourses.isNotEmpty()) {
                SectionHeader(title = stringResource(R.string.el_featured_courses), onSeeAll = onViewAllCourses)
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    state.featuredCourses.forEach { course ->
                        CourseCard(course = course, onClick = { course.slug?.let(onCourseClick) }, modifier = Modifier.width(260.dp))
                    }
                }
            }

            // Continue learning
            if (state.inProgressEnrollments.isNotEmpty()) {
                SectionHeader(title = stringResource(R.string.el_continue_learning), onSeeAll = onViewMyLearning)
                state.inProgressEnrollments.forEach { enrollment ->
                    Card(modifier = Modifier.fillMaxWidth().clickable { enrollment.slug?.let(onCourseClick) }, shape = RoundedCornerShape(12.dp)) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            if (enrollment.thumbnail != null) {
                                AsyncImage(model = enrollment.thumbnail, contentDescription = null, modifier = Modifier.size(60.dp, 45.dp).clip(RoundedCornerShape(8.dp)), contentScale = ContentScale.Crop)
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(enrollment.localizedTitle, fontWeight = FontWeight.Medium, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Spacer(modifier = Modifier.height(4.dp))
                                LinearProgressIndicator(
                                    progress = { (enrollment.progressPercent ?: 0) / 100f },
                                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                                    color = ELearningPrimary,
                                    trackColor = ELearningPrimary.copy(alpha = 0.15f),
                                )
                                Text("${enrollment.progressPercent ?: 0}%", fontSize = 12.sp, color = Muted)
                            }
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = ELearningPrimary)
                        }
                    }
                }
            }

            // Categories
            if (state.categories.isNotEmpty()) {
                Text(stringResource(R.string.el_categories), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    state.categories.forEach { category ->
                        val color = try { Color(android.graphics.Color.parseColor(category.color ?: "#9B59B6")) } catch (_: Exception) { ELearningPrimary }
                        Surface(
                            modifier = Modifier.clickable { onViewAllCourses() },
                            shape = RoundedCornerShape(12.dp),
                            color = color.copy(alpha = 0.1f),
                        ) {
                            Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(category.nameFr ?: category.nameEn ?: "", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = color)
                                Text("${category.courseCount ?: 0} cours", fontSize = 11.sp, color = color.copy(alpha = 0.7f))
                            }
                        }
                    }
                }
            }

            if (state.isLoading) {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
            }
        }
    }
}

@Composable
fun CourseCard(course: ELCourseDto, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Card(modifier = modifier.clickable(onClick = onClick), shape = RoundedCornerShape(12.dp), elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)) {
        Column {
            Box(modifier = Modifier.height(120.dp).fillMaxWidth()) {
                if (course.thumbnail != null) {
                    AsyncImage(model = course.thumbnail, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                } else {
                    Box(modifier = Modifier.fillMaxSize().background(Brush.linearGradient(listOf(ELearningPrimary, ELearningLight))))
                }
                // Level badge
                course.level?.let { level ->
                    Surface(
                        modifier = Modifier.align(Alignment.TopEnd).padding(8.dp),
                        shape = RoundedCornerShape(8.dp),
                        color = Color.Black.copy(alpha = 0.6f),
                    ) { Text(level, color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)) }
                }
            }
            Column(modifier = Modifier.padding(12.dp)) {
                if (course.categoryNameFr != null) {
                    Text(course.categoryNameFr, fontSize = 11.sp, color = ELearningPrimary, fontWeight = FontWeight.Medium)
                }
                Text(course.localizedTitle, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (course.durationHours != null) Text("${course.durationHours}h", fontSize = 11.sp, color = Muted)
                    if (course.moduleCount != null) Text("${course.moduleCount} mod.", fontSize = 11.sp, color = Muted)
                    if (course.enrolledCount != null) Text("${course.enrolledCount} inscrits", fontSize = 11.sp, color = Muted)
                }
            }
        }
    }
}

@Composable
private fun ELStatPill(value: String, label: String) {
    Surface(shape = RoundedCornerShape(16.dp), color = Color.White.copy(alpha = 0.2f)) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Text(label, color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp)
        }
    }
}

@Composable
private fun QuickAction(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Card(modifier = modifier.clickable(onClick = onClick), shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(title, fontSize = 11.sp, fontWeight = FontWeight.Medium, maxLines = 1)
        }
    }
}

@Composable
private fun SectionHeader(title: String, onSeeAll: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        TextButton(onClick = onSeeAll) { Text(stringResource(R.string.see_all)) }
    }
}
