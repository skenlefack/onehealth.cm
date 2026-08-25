package cm.onehealth.cohrm.ui.screens.platform

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.components.ModuleCard
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage
import kotlinx.coroutines.delay

@Composable
fun PlatformHomeScreen(
    onNavigateToCohrm: () -> Unit,
    onNavigateToELearning: () -> Unit,
    onNavigateToDussc: () -> Unit,
    onNavigateToOhwr: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onPostClick: (String) -> Unit = {},
    viewModel: PlatformHomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier.fillMaxSize(),
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFF1A7A5A), Color(0xFF2C8B56))
                    )
                )
                .padding(horizontal = 16.dp, vertical = 14.dp),
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Image(
                            painter = painterResource(R.drawable.one_health_logo),
                            contentDescription = null,
                            modifier = Modifier.size(40.dp).clip(CircleShape),
                            contentScale = ContentScale.Crop,
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = stringResource(R.string.platform_title),
                                color = Color.White,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                            )
                            Text(
                                text = stringResource(R.string.platform_subtitle),
                                color = Color.White.copy(alpha = 0.8f),
                                fontSize = 12.sp,
                            )
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        IconButton(onClick = onNavigateToNotifications) {
                            Icon(Icons.Default.Notifications, contentDescription = null, tint = Color.White)
                        }
                        IconButton(onClick = onNavigateToProfile) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = Color.White)
                        }
                    }
                }

            }
        }

        // Modules section
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = stringResource(R.string.platform_modules),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
            )

            ModuleCard(
                title = stringResource(R.string.platform_cohrm_title),
                subtitle = stringResource(R.string.platform_cohrm_subtitle),
                icon = Icons.Default.Warning,
                primaryColor = Primary,
                secondaryColor = PrimaryLight,
                stat1Label = stringResource(R.string.platform_rumors),
                stat1Value = "${state.cohrmRumorCount}",
                stat2Label = stringResource(R.string.platform_today),
                stat2Value = "${state.cohrmTodayCount}",
                onClick = onNavigateToCohrm,
            )

            ModuleCard(
                title = stringResource(R.string.platform_elearning_title),
                subtitle = stringResource(R.string.platform_elearning_subtitle),
                icon = Icons.Default.School,
                primaryColor = ELearningPrimary,
                secondaryColor = ELearningLight,
                stat1Label = stringResource(R.string.platform_courses),
                stat1Value = "${state.elCourseCount}",
                onClick = onNavigateToELearning,
            )

            ModuleCard(
                title = stringResource(R.string.platform_dussc_title),
                subtitle = stringResource(R.string.platform_dussc_subtitle),
                icon = Icons.Default.Quiz,
                primaryColor = DusscPrimary,
                secondaryColor = DusscLight,
                stat1Label = stringResource(R.string.platform_quiz),
                stat1Value = "15Q",
                onClick = onNavigateToDussc,
            )

            ModuleCard(
                title = stringResource(R.string.platform_ohwr_title),
                subtitle = stringResource(R.string.platform_ohwr_subtitle),
                icon = Icons.Default.Map,
                primaryColor = OhwrPrimary,
                secondaryColor = OhwrLight,
                stat1Label = stringResource(R.string.platform_experts),
                stat1Value = "${state.ohwrExpertCount}",
                stat2Label = stringResource(R.string.platform_organizations),
                stat2Value = "${state.ohwrOrgCount}",
                onClick = onNavigateToOhwr,
            )
        }

        // Latest publications — fills remaining space
        if (state.latestPosts.isNotEmpty()) {
            Column(
                modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            ) {
                LatestPublicationsSlideshow(posts = state.latestPosts, modifier = Modifier.weight(1f), onPostClick = onPostClick)
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun LatestPublicationsSlideshow(posts: List<cm.onehealth.cohrm.data.remote.PostDto>, modifier: Modifier = Modifier, onPostClick: (String) -> Unit = {}) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = stringResource(R.string.platform_latest_posts),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            )
            Icon(Icons.Default.Article, contentDescription = null, tint = Muted, modifier = Modifier.size(20.dp))
        }

        val pagerState = rememberPagerState(pageCount = { posts.size })

        // Auto-scroll
        LaunchedEffect(pagerState) {
            while (true) {
                delay(4000)
                val next = (pagerState.currentPage + 1) % posts.size
                pagerState.animateScrollToPage(next)
            }
        }

        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxWidth().weight(1f),
            pageSpacing = 12.dp,
        ) { page ->
            val post = posts[page]
            Card(
                modifier = Modifier.fillMaxSize().clickable { post.slug?.let { onPostClick(it) } },
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    if (!post.featuredImage.isNullOrBlank()) {
                        val imageUrl = if (post.featuredImage.startsWith("http")) post.featuredImage else "https://onehealth.cm${post.featuredImage}"
                        AsyncImage(
                            model = imageUrl,
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                        )
                    } else {
                        Box(
                            modifier = Modifier.fillMaxSize().background(
                                Brush.linearGradient(listOf(Color(0xFF1A7A5A), Color(0xFF2C8B56), LogoOrange))
                            ),
                        )
                    }
                    // Dark overlay for text readability
                    Box(
                        modifier = Modifier.fillMaxSize().background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.7f)),
                                startY = 60f,
                            )
                        ),
                    )
                    // Content overlay
                    Column(
                        modifier = Modifier.align(Alignment.BottomStart).padding(16.dp),
                    ) {
                        if (!post.categoryName.isNullOrBlank()) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = LogoOrange,
                            ) {
                                Text(
                                    text = post.categoryName,
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                        Text(
                            text = post.localizedTitle,
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            lineHeight = 20.sp,
                        )
                        if (post.localizedExcerpt.isNotBlank()) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = post.localizedExcerpt.replace(Regex("<[^>]*>"), ""),
                                color = Color.White.copy(alpha = 0.8f),
                                fontSize = 12.sp,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                                lineHeight = 16.sp,
                            )
                        }
                    }
                }
            }
        }

        // Pager indicator dots
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
            horizontalArrangement = Arrangement.Center,
        ) {
            repeat(posts.size) { index ->
                Box(
                    modifier = Modifier
                        .padding(horizontal = 3.dp)
                        .size(if (index == pagerState.currentPage) 8.dp else 6.dp)
                        .clip(CircleShape)
                        .background(
                            if (index == pagerState.currentPage) Color(0xFF1A7A5A)
                            else Muted.copy(alpha = 0.3f)
                        ),
                )
            }
        }
    }
}
