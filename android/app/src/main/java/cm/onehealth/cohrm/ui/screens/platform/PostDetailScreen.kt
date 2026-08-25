package cm.onehealth.cohrm.ui.screens.platform

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.PostDto
import cm.onehealth.cohrm.data.remote.PostsApiService
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage
import dagger.hilt.android.lifecycle.HiltViewModel
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PostDetailState(
    val isLoading: Boolean = false,
    val post: PostDto? = null,
    val error: String? = null,
)

@HiltViewModel
class PostDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val postsApiService: PostsApiService,
) : ViewModel() {
    private val slug: String = savedStateHandle.get<String>("slug") ?: ""
    private val _state = MutableStateFlow(PostDetailState())
    val state: StateFlow<PostDetailState> = _state.asStateFlow()

    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            try {
                val response = postsApiService.getPost(slug)
                if (response.success && response.data != null) {
                    _state.update { it.copy(isLoading = false, post = response.data) }
                } else {
                    _state.update { it.copy(isLoading = false, error = "Article non trouvé") }
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.localizedMessage) }
            }
        }
    }
}

@Composable
fun PostDetailScreen(
    onBack: () -> Unit,
    viewModel: PostDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    when {
        state.isLoading -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF1A7A5A))
        }
        state.error != null -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(state.error ?: "", color = Danger)
        }
        state.post != null -> {
            val post = state.post!!
            Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                // Hero image
                Box(modifier = Modifier.fillMaxWidth().height(220.dp)) {
                    if (!post.featuredImage.isNullOrBlank()) {
                        val imageUrl = if (post.featuredImage.startsWith("http")) post.featuredImage else "https://onehealth.cm${post.featuredImage}"
                        AsyncImage(model = imageUrl, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    } else {
                        Box(modifier = Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF1A7A5A), Color(0xFF2C8B56), LogoOrange))))
                    }
                    Box(modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.6f)), startY = 100f)))

                    // Category badge
                    if (!post.categoryName.isNullOrBlank()) {
                        Surface(
                            modifier = Modifier.align(Alignment.TopStart).padding(16.dp),
                            shape = RoundedCornerShape(6.dp),
                            color = LogoOrange,
                        ) {
                            Text(post.categoryName, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp))
                        }
                    }
                }

                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Title
                    Text(post.localizedTitle, fontSize = 22.sp, fontWeight = FontWeight.Bold, lineHeight = 28.sp)

                    // Author + date row
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        if (!post.authorAvatar.isNullOrBlank()) {
                            AsyncImage(model = post.authorAvatar, contentDescription = null, modifier = Modifier.size(36.dp).clip(CircleShape), contentScale = ContentScale.Crop)
                        } else {
                            Box(modifier = Modifier.size(36.dp).clip(CircleShape).background(Color(0xFF1A7A5A).copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF1A7A5A), modifier = Modifier.size(20.dp))
                            }
                        }
                        Column {
                            if (post.authorName.isNotBlank()) Text(post.authorName, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                            if (!post.publishedAt.isNullOrBlank()) {
                                Text(post.publishedAt.take(10), fontSize = 12.sp, color = Muted)
                            }
                        }
                        Spacer(modifier = Modifier.weight(1f))
                        if (post.viewCount != null) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Icon(Icons.Default.Visibility, contentDescription = null, tint = Muted, modifier = Modifier.size(16.dp))
                                Text("${post.viewCount}", fontSize = 12.sp, color = Muted)
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f))

                    // Content - render HTML via WebView
                    val htmlContent = post.localizedContent
                    if (htmlContent.isNotBlank()) {
                        val styledHtml = """
                            <!DOCTYPE html>
                            <html><head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { font-family: -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: #333; margin: 0; padding: 0; }
                                img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }
                                h1, h2, h3 { color: #1A7A5A; margin-top: 20px; }
                                p { margin: 10px 0; }
                                a { color: #2980B9; }
                                blockquote { border-left: 3px solid #1A7A5A; padding-left: 12px; color: #555; margin: 12px 0; }
                                ul, ol { padding-left: 20px; }
                            </style>
                            </head><body>$htmlContent</body></html>
                        """.trimIndent()

                        AndroidView(
                            factory = { ctx ->
                                WebView(ctx).apply {
                                    webViewClient = WebViewClient()
                                    settings.javaScriptEnabled = false
                                    settings.loadWithOverviewMode = true
                                    settings.useWideViewPort = true
                                    loadDataWithBaseURL("https://onehealth.cm", styledHtml, "text/html", "utf-8", null)
                                }
                            },
                            modifier = Modifier.fillMaxWidth().heightIn(min = 300.dp),
                        )
                    } else if (post.localizedExcerpt.isNotBlank()) {
                        Text(post.localizedExcerpt.replace(Regex("<[^>]*>"), ""), fontSize = 15.sp, lineHeight = 24.sp)
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}
