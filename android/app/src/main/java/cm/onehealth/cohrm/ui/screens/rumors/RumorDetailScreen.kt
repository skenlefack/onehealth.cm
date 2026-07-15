package cm.onehealth.cohrm.ui.screens.rumors

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.dto.FeedbackItem
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.data.remote.dto.ValidationItem
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Alert
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.PrimaryLight
import cm.onehealth.cohrm.ui.theme.Warning

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun RumorDetailScreen(
    onBack: () -> Unit = {},
    onValidate: (Int) -> Unit = {},
    viewModel: RumorDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is RumorDetailEvent.Success -> {}
                is RumorDetailEvent.Error -> {}
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(state.rumor?.code ?: stringResource(R.string.rumor_detail)) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                }
            },
            actions = {
                IconButton(onClick = {
                    val rumor = state.rumor ?: return@IconButton
                    val shareText = "COHRM - ${rumor.code}\n${rumor.title}\n${rumor.region} - ${rumor.department}\nStatut: ${rumor.status}\nPriorité: ${rumor.priority}"
                    val intent = Intent.createChooser(
                        Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, shareText)
                        },
                        null,
                    )
                    context.startActivity(intent)
                }) {
                    Icon(Icons.Default.Share, contentDescription = null)
                }
            },
        )

        when {
            state.isLoading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            state.error != null -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(state.error ?: "", color = Danger)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { viewModel.loadRumor() }) {
                            Text(stringResource(R.string.retry))
                        }
                    }
                }
            }
            state.rumor != null -> {
                val rumor = state.rumor!!
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState()),
                ) {
                    // Status banner
                    StatusBanner(rumor)

                    // Info section
                    InfoSection(rumor)

                    // Description
                    if (rumor.description.isNotEmpty()) {
                        SectionCard(stringResource(R.string.rumor_description)) {
                            Text(rumor.description, style = MaterialTheme.typography.bodyMedium)
                        }
                    }

                    // Location
                    SectionCard(stringResource(R.string.rumor_location)) {
                        DetailRow(stringResource(R.string.rumor_region), rumor.region)
                        DetailRow(stringResource(R.string.rumor_department), rumor.department)
                        rumor.district?.let { DetailRow(stringResource(R.string.rumor_district), it) }
                        if (rumor.latitude != null && rumor.longitude != null) {
                            DetailRow("GPS", "${rumor.latitude}, ${rumor.longitude}")
                        }
                    }

                    // Reporter
                    if (!rumor.reporterName.isNullOrEmpty()) {
                        SectionCard(stringResource(R.string.rumor_reporter)) {
                            DetailRow(stringResource(R.string.rumor_reporter), rumor.reporterName ?: "")
                            rumor.reporterPhone?.let { DetailRow("Tél.", it) }
                        }
                    }

                    // Validation Timeline
                    if (rumor.validations.isNotEmpty()) {
                        SectionCard(stringResource(R.string.rumor_timeline)) {
                            ValidationTimeline(rumor.validations)
                        }
                    }

                    // Action buttons
                    if (rumor.status != "closed") {
                        ActionButtons(
                            rumor = rumor,
                            onValidate = { onValidate(rumor.id) },
                        )
                    }

                    // Feedback section
                    FeedbackSection(
                        feedback = rumor.feedback,
                        isSending = state.isSendingFeedback,
                        onSend = { viewModel.addFeedback(it) },
                    )

                    Spacer(modifier = Modifier.height(32.dp))
                }
            }
        }
    }
}

@Composable
private fun StatusBanner(rumor: RumorDetail) {
    val statusColor = statusColor(rumor.status)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(statusColor.copy(alpha = 0.1f))
            .padding(16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(14.dp)
                        .clip(CircleShape)
                        .background(statusColor),
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = formatLabel(rumor.status),
                    fontWeight = FontWeight.Bold,
                    color = statusColor,
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Badge(formatLabel(rumor.priority), priorityColor(rumor.priority))
                if (rumor.riskLevel != "unknown") {
                    Badge(formatLabel(rumor.riskLevel), riskColor(rumor.riskLevel))
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun InfoSection(rumor: RumorDetail) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = rumor.title.ifEmpty { "Sans titre" },
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Badge(formatLabel(rumor.category), categoryColor(rumor.category))
                Badge(formatLabel(rumor.source), sourceColor(rumor.source))
                rumor.species?.let { Badge(it, Muted) }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Schedule, contentDescription = null, modifier = Modifier.size(14.dp), tint = Muted)
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = formatDate(rumor.createdAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = Muted,
                )
            }
            if (rumor.affectedCount != null && rumor.affectedCount > 0) {
                DetailRow(stringResource(R.string.rumor_affected), "${rumor.affectedCount}")
            }
        }
    }
}

@Composable
private fun SectionCard(title: String, content: @Composable () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(8.dp))
            content()
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    if (value.isBlank()) return
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = Muted)
        Text(text = value, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun ValidationTimeline(validations: List<ValidationItem>) {
    validations.forEachIndexed { index, v ->
        Row(modifier = Modifier.padding(vertical = 4.dp)) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(validationColor(v.decision)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                }
                if (index < validations.size - 1) {
                    Box(
                        modifier = Modifier
                            .width(2.dp)
                            .height(30.dp)
                            .background(Muted.copy(alpha = 0.3f)),
                    )
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Row {
                    Text(
                        text = v.actorName,
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "(${v.actorLevelLabel})",
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                    )
                }
                Badge(formatLabel(v.decision), validationColor(v.decision))
                v.notes?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Text(formatDate(v.createdAt), style = MaterialTheme.typography.labelSmall, color = Muted)
            }
        }
    }
}

@Composable
private fun ActionButtons(rumor: RumorDetail, onValidate: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.rumor_actions),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = onValidate,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = Primary),
            ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.rumor_validate))
            }
        }
    }
}

@Composable
private fun FeedbackSection(
    feedback: List<FeedbackItem>,
    isSending: Boolean,
    onSend: (String) -> Unit,
) {
    var message by remember { mutableStateOf("") }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.rumor_feedback),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(modifier = Modifier.height(8.dp))

            feedback.forEach { f ->
                Row(modifier = Modifier.padding(vertical = 4.dp)) {
                    Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp), tint = Muted)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Row {
                            Text(f.userName, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.SemiBold)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(formatDate(f.createdAt), style = MaterialTheme.typography.labelSmall, color = Muted)
                        }
                        Text(f.message, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            if (feedback.isEmpty()) {
                Text(stringResource(R.string.feedback_empty), style = MaterialTheme.typography.bodySmall, color = Muted)
            }

            Spacer(modifier = Modifier.height(8.dp))
            Divider()
            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = message,
                    onValueChange = { message = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text(stringResource(R.string.feedback_hint)) },
                    singleLine = true,
                    shape = RoundedCornerShape(8.dp),
                )
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = {
                        onSend(message)
                        message = ""
                    },
                    enabled = message.isNotBlank() && !isSending,
                ) {
                    if (isSending) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp))
                    } else {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, tint = PrimaryLight)
                    }
                }
            }
        }
    }
}

@Composable
private fun Badge(text: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.12f))
            .padding(horizontal = 8.dp, vertical = 3.dp),
    ) {
        Text(text = text, fontSize = 11.sp, color = color, fontWeight = FontWeight.SemiBold)
    }
}

private fun statusColor(s: String): Color = when (s) {
    "pending" -> Warning; "investigating" -> Info; "confirmed" -> Accent; "false_alarm" -> Muted; "closed" -> Color(0xFF78909C); else -> Muted
}
private fun priorityColor(p: String): Color = when (p) {
    "low" -> Accent; "medium" -> Warning; "high" -> Alert; "critical" -> Danger; else -> Muted
}
private fun riskColor(r: String): Color = when (r) {
    "low" -> Accent; "moderate" -> Warning; "high" -> Alert; "very_high" -> Danger; else -> Muted
}
private fun categoryColor(c: String): Color = when (c) {
    "human_health" -> Color(0xFFE74C3C); "animal_health" -> Color(0xFF9B59B6); "environmental" -> Accent; "safety" -> Color(0xFFE67E22); "disaster" -> Info; else -> Muted
}
private fun sourceColor(s: String): Color = when (s) {
    "direct" -> Primary; "field" -> Accent; "sms" -> Warning; "mobile" -> Info; "scanner" -> Color(0xFF1ABC9C); else -> Muted
}
private fun validationColor(d: String): Color = when (d) {
    "approved" -> Accent; "rejected" -> Danger; "escalated" -> Warning; "needs_info" -> Info; else -> Muted
}
private fun formatLabel(l: String): String = l.replace("_", " ").replaceFirstChar { it.uppercase() }
private fun formatDate(d: String): String {
    if (d.length < 10) return d
    return try { "${d.substring(8, 10)}/${d.substring(5, 7)}/${d.substring(0, 4)}" } catch (e: Exception) { d }
}
