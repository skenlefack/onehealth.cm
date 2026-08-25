package cm.onehealth.cohrm.ui.screens.ohwr

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OhwrMySubmissionsScreen(
    onBack: () -> Unit,
    viewModel: OhwrMySubmissionsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.ohwr_my_submissions)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OhwrPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        when {
            state.isLoading -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = OhwrPrimary)
            }
            state.submissions.isEmpty() -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.Inbox, contentDescription = null, modifier = Modifier.size(48.dp), tint = Color.Gray)
                    Text(stringResource(R.string.ohwr_no_submissions), color = Color.Gray)
                }
            }
            else -> LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(state.submissions) { submission ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                // Resource type badge
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = OhwrPrimary.copy(alpha = 0.1f),
                                ) {
                                    Text(
                                        text = submission.resourceType ?: "---",
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        fontSize = 12.sp,
                                        color = OhwrPrimary,
                                        fontWeight = FontWeight.Medium,
                                    )
                                }

                                // Status badge
                                val (statusText, statusColor) = when (submission.submissionStatus) {
                                    "approved" -> stringResource(R.string.ohwr_status_approved) to Success
                                    "rejected" -> stringResource(R.string.ohwr_status_rejected) to Danger
                                    else -> stringResource(R.string.ohwr_status_pending) to Warning
                                }
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = statusColor.copy(alpha = 0.1f),
                                ) {
                                    Text(
                                        text = statusText,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        fontSize = 12.sp,
                                        color = statusColor,
                                        fontWeight = FontWeight.Medium,
                                    )
                                }
                            }

                            Text(
                                text = submission.resourceName ?: "---",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 15.sp,
                            )

                            submission.submittedAt?.let { date ->
                                Text(text = date.take(10), fontSize = 12.sp, color = Color.Gray)
                            }

                            if (submission.submissionStatus == "rejected" && !submission.rejectionReason.isNullOrBlank()) {
                                Surface(shape = RoundedCornerShape(8.dp), color = Danger.copy(alpha = 0.05f)) {
                                    Text(
                                        text = submission.rejectionReason,
                                        modifier = Modifier.padding(8.dp),
                                        fontSize = 12.sp,
                                        color = Danger,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
