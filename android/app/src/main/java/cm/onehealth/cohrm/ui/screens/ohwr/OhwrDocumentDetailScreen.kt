package cm.onehealth.cohrm.ui.screens.ohwr

import android.content.Intent
import android.net.Uri
import android.webkit.WebView
import android.webkit.WebViewClient
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*
import java.net.URLEncoder

@Composable
fun OhwrDocumentDetailScreen(
    onBack: () -> Unit,
    viewModel: OhwrDocDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.ohwr_document_detail)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OhwrPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        when {
            state.isLoading -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = OhwrPrimary)
            }
            state.error != null -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(state.error!!, color = Danger)
            }
            state.document != null -> {
                val doc = state.document!!
                Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                    // Document metadata (scrollable header)
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        // Title
                        Text(doc.title, fontWeight = FontWeight.Bold, fontSize = 20.sp)

                        // Type badge + org
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            if (!doc.type.isNullOrBlank()) {
                                val typeIcon = when (doc.type.lowercase()) {
                                    "guide" -> Icons.Default.MenuBook
                                    "protocol" -> Icons.Default.Gavel
                                    "article" -> Icons.Default.Article
                                    "report" -> Icons.Default.Assessment
                                    "policy" -> Icons.Default.Policy
                                    else -> Icons.Default.Description
                                }
                                Surface(shape = RoundedCornerShape(8.dp), color = ELearningPrimary.copy(alpha = 0.1f)) {
                                    Row(modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(typeIcon, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(16.dp))
                                        Text(doc.type, fontSize = 12.sp, color = ELearningPrimary, fontWeight = FontWeight.Medium)
                                    }
                                }
                            }
                            if (!doc.organizationAcronym.isNullOrBlank()) {
                                Surface(shape = RoundedCornerShape(8.dp), color = Info.copy(alpha = 0.1f)) {
                                    Text(doc.organizationAcronym, fontSize = 12.sp, color = Info, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                                }
                            }
                        }

                        // Metadata rows
                        if (!doc.organizationName.isNullOrBlank()) {
                            DocInfoRow(Icons.Default.Business, stringResource(R.string.ohwr_organization), doc.organizationName + (doc.organizationAcronym?.let { " ($it)" } ?: ""))
                        }
                        if (!doc.publicationDate.isNullOrBlank()) {
                            DocInfoRow(Icons.Default.CalendarToday, stringResource(R.string.ohwr_publication_date), doc.publicationDate.take(10))
                        }
                        if (!doc.language.isNullOrBlank()) {
                            DocInfoRow(Icons.Default.Language, stringResource(R.string.ohwr_language), doc.language)
                        }

                        // View/download counts
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            if (doc.viewCount != null) {
                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Visibility, contentDescription = null, tint = Muted, modifier = Modifier.size(16.dp))
                                    Text("${doc.viewCount} ${stringResource(R.string.ohwr_views)}", fontSize = 12.sp, color = Muted)
                                }
                            }
                            if (doc.downloadCount != null) {
                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Download, contentDescription = null, tint = Muted, modifier = Modifier.size(16.dp))
                                    Text("${doc.downloadCount} ${stringResource(R.string.ohwr_downloads)}", fontSize = 12.sp, color = Muted)
                                }
                            }
                        }

                        // Description
                        if (!doc.description.isNullOrBlank()) {
                            Text(doc.description, fontSize = 14.sp, lineHeight = 22.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }

                        // Action buttons
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (!doc.filePath.isNullOrBlank()) {
                                Button(
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(doc.filePath))
                                        context.startActivity(intent)
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = OhwrPrimary),
                                ) {
                                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(stringResource(R.string.ohwr_download))
                                }
                            }
                            OutlinedButton(
                                onClick = {
                                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_SUBJECT, doc.title)
                                        putExtra(Intent.EXTRA_TEXT, doc.filePath ?: doc.title)
                                    }
                                    context.startActivity(Intent.createChooser(shareIntent, null))
                                },
                            ) {
                                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(stringResource(R.string.ohwr_share))
                            }
                        }
                    }

                    // PDF viewer using Google Docs
                    if (!doc.filePath.isNullOrBlank() && (doc.fileType?.lowercase()?.contains("pdf") == true || doc.filePath.lowercase().endsWith(".pdf"))) {
                        HorizontalDivider()
                        val encodedUrl = URLEncoder.encode(doc.filePath, "UTF-8")
                        val viewerUrl = "https://docs.google.com/gview?embedded=true&url=$encodedUrl"
                        AndroidView(
                            factory = { ctx ->
                                WebView(ctx).apply {
                                    settings.javaScriptEnabled = true
                                    settings.loadWithOverviewMode = true
                                    settings.useWideViewPort = true
                                    webViewClient = WebViewClient()
                                    loadUrl(viewerUrl)
                                }
                            },
                            modifier = Modifier.fillMaxSize(),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DocInfoRow(icon: ImageVector, label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Icon(icon, contentDescription = null, tint = OhwrLight, modifier = Modifier.size(20.dp))
        Column {
            Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        }
    }
}
