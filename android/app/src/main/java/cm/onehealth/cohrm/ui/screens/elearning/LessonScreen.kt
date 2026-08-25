package cm.onehealth.cohrm.ui.screens.elearning

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun LessonScreen(
    onQuizClick: (Int) -> Unit,
    onNextLesson: (Int) -> Unit,
    onBack: () -> Unit,
    viewModel: LessonViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.lesson?.localizedTitle ?: stringResource(R.string.loading), maxLines = 1) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ELearningPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        when {
            state.isLoading -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
            state.error != null -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { Text(state.error!!, color = Danger) }
            state.lesson != null -> {
                val lesson = state.lesson!!

                // Periodic progress save for video content
                if (lesson.contentType == "video") {
                    LaunchedEffect(lesson.id) {
                        var elapsed = 0
                        while (true) {
                            kotlinx.coroutines.delay(30_000L)
                            elapsed += 30
                            viewModel.updateProgress(
                                progressPercent = ((elapsed.toFloat() / ((lesson.videoDurationSeconds ?: 600).coerceAtLeast(1))) * 100).toInt().coerceAtMost(100),
                                videoPosition = elapsed,
                                timeSpent = elapsed,
                            )
                        }
                    }
                }

                Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                    // Resume indicator
                    if (lesson.progress?.videoLastPositionSeconds != null && lesson.progress.videoLastPositionSeconds > 0) {
                        val minutes = lesson.progress.videoLastPositionSeconds / 60
                        val seconds = lesson.progress.videoLastPositionSeconds % 60
                        Surface(shape = RoundedCornerShape(8.dp), color = Info.copy(alpha = 0.1f), modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)) {
                            Row(modifier = Modifier.padding(8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.PlayCircle, contentDescription = null, tint = Info, modifier = Modifier.size(18.dp))
                                Text(stringResource(R.string.el_resume_at, "${minutes}:${String.format("%02d", seconds)}"), fontSize = 13.sp, color = Info)
                            }
                        }
                    }

                    // Content area
                    Box(modifier = Modifier.weight(1f)) {
                        when (lesson.contentType) {
                            "video" -> VideoContent(lesson.videoUrl, lesson.videoProvider)
                            "pdf" -> PdfContent(lesson.pdfUrl)
                            "text", "html", "mixed" -> HtmlContent(lesson.localizedContent)
                            "interactive" -> HtmlContent(lesson.localizedContent)
                            "pptx" -> OfficeContent(lesson.pptxUrl)
                            "docx" -> OfficeContent(lesson.docxUrl)
                            else -> HtmlContent(lesson.localizedContent)
                        }
                    }

                    // Bottom bar
                    Surface(tonalElevation = 3.dp) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically,
                        ) {
                            // Previous
                            if (lesson.prevLesson != null) {
                                OutlinedButton(onClick = { onNextLesson(lesson.prevLesson.id) }) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(stringResource(R.string.report_previous), fontSize = 13.sp)
                                }
                            } else Spacer(modifier = Modifier.width(1.dp))

                            // Complete
                            if (lesson.isCompleted != true) {
                                Button(
                                    onClick = { viewModel.completeLesson() },
                                    colors = ButtonDefaults.buttonColors(containerColor = ELearningPrimary),
                                    shape = RoundedCornerShape(12.dp),
                                    enabled = !state.isCompleting,
                                ) {
                                    if (state.isCompleting) CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.White)
                                    else { Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp)); Spacer(modifier = Modifier.width(4.dp)); Text(stringResource(R.string.el_mark_complete), fontSize = 13.sp) }
                                }
                            } else {
                                Surface(shape = RoundedCornerShape(8.dp), color = Success.copy(alpha = 0.1f)) {
                                    Row(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Success, modifier = Modifier.size(18.dp))
                                        Text(stringResource(R.string.el_completed), color = Success, fontSize = 13.sp)
                                    }
                                }
                            }

                            // Next / Quiz
                            if (lesson.hasQuiz == true && lesson.quizId != null) {
                                Button(onClick = { onQuizClick(lesson.quizId) }, colors = ButtonDefaults.buttonColors(containerColor = Warning)) {
                                    Icon(Icons.Default.Quiz, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Quiz", fontSize = 13.sp)
                                }
                            } else if (lesson.nextLesson != null) {
                                Button(onClick = { onNextLesson(lesson.nextLesson.id) }, colors = ButtonDefaults.buttonColors(containerColor = ELearningPrimary)) {
                                    Text(stringResource(R.string.report_next), fontSize = 13.sp)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                                }
                            } else Spacer(modifier = Modifier.width(1.dp))
                        }
                    }

                    // Completion overlay
                    state.completionResult?.let { result ->
                        if (result.lessonCompleted == true) {
                            AlertDialog(
                                onDismissRequest = {},
                                confirmButton = {
                                    if (state.lesson?.nextLesson != null) {
                                        Button(onClick = { onNextLesson(state.lesson!!.nextLesson!!.id) }) { Text(stringResource(R.string.el_next_lesson)) }
                                    } else {
                                        Button(onClick = onBack) { Text(stringResource(R.string.el_back_to_course)) }
                                    }
                                },
                                title = { Text(stringResource(R.string.el_lesson_complete)) },
                                text = {
                                    Column {
                                        Text(stringResource(R.string.el_lesson_complete_msg))
                                        if (result.courseCompleted == true) {
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Text(stringResource(R.string.el_course_complete), fontWeight = FontWeight.Bold, color = Success)
                                        }
                                    }
                                },
                                icon = { Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = ELearningPrimary) },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun VideoContent(url: String?, provider: String?) {
    if (url.isNullOrBlank()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("No video URL") }
        return
    }
    val embedUrl = when {
        provider == "youtube" || url.contains("youtube") || url.contains("youtu.be") -> {
            val videoId = url.substringAfter("v=").substringBefore("&").ifBlank { url.substringAfterLast("/") }
            "https://www.youtube.com/embed/$videoId"
        }
        provider == "vimeo" || url.contains("vimeo") -> {
            val videoId = url.substringAfterLast("/")
            "https://player.vimeo.com/video/$videoId"
        }
        else -> url
    }
    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false
                webViewClient = WebViewClient()
                loadUrl(embedUrl)
            }
        },
        modifier = Modifier.fillMaxSize(),
    )
}

@Composable
private fun PdfContent(url: String?) {
    if (url.isNullOrBlank()) { Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("No PDF") }; return }
    val viewerUrl = "https://docs.google.com/gview?embedded=true&url=$url"
    AndroidView(
        factory = { ctx -> WebView(ctx).apply { settings.javaScriptEnabled = true; webViewClient = WebViewClient(); loadUrl(viewerUrl) } },
        modifier = Modifier.fillMaxSize(),
    )
}

@Composable
private fun HtmlContent(content: String) {
    if (content.isBlank()) { Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("No content") }; return }
    val html = """<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:sans-serif;padding:16px;line-height:1.6;color:#333}img{max-width:100%;height:auto}</style></head><body>$content</body></html>"""
    AndroidView(
        factory = { ctx -> WebView(ctx).apply { settings.javaScriptEnabled = true; webViewClient = WebViewClient(); loadDataWithBaseURL(null, html, "text/html", "UTF-8", null) } },
        modifier = Modifier.fillMaxSize(),
    )
}

@Composable
private fun OfficeContent(url: String?) {
    if (url.isNullOrBlank()) { Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("No document") }; return }
    val viewerUrl = "https://view.officeapps.live.com/op/embed.aspx?src=$url"
    AndroidView(
        factory = { ctx -> WebView(ctx).apply { settings.javaScriptEnabled = true; webViewClient = WebViewClient(); loadUrl(viewerUrl) } },
        modifier = Modifier.fillMaxSize(),
    )
}
