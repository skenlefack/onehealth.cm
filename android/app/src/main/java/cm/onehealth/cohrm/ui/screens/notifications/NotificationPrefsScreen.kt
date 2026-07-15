package cm.onehealth.cohrm.ui.screens.notifications

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationPrefsScreen(
    onBack: () -> Unit = {},
    viewModel: NotificationPrefsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(stringResource(R.string.notif_prefs_title)) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                }
            },
        )

        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
            ) {
                // Error
                state.error?.let { error ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = Danger.copy(alpha = 0.1f),
                        ),
                    ) {
                        Text(
                            text = error,
                            modifier = Modifier.padding(12.dp),
                            color = Danger,
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Success
                if (state.saveSuccess) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = Accent.copy(alpha = 0.1f),
                        ),
                    ) {
                        Text(
                            text = stringResource(R.string.notif_prefs_saved),
                            modifier = Modifier.padding(12.dp),
                            color = Accent,
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Notification types section
                SectionHeader(
                    icon = Icons.Default.Notifications,
                    title = stringResource(R.string.notif_prefs_types),
                )
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_new_rumor),
                            checked = state.notifyNewRumor,
                            onCheckedChange = { viewModel.toggleNotifyNewRumor(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_escalation),
                            checked = state.notifyEscalation,
                            onCheckedChange = { viewModel.toggleNotifyEscalation(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_validation),
                            checked = state.notifyValidation,
                            onCheckedChange = { viewModel.toggleNotifyValidation(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_rejection),
                            checked = state.notifyRejection,
                            onCheckedChange = { viewModel.toggleNotifyRejection(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_risk_assessment),
                            checked = state.notifyRiskAssessment,
                            onCheckedChange = { viewModel.toggleNotifyRiskAssessment(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_reminder),
                            checked = state.notifyReminder,
                            onCheckedChange = { viewModel.toggleNotifyReminder(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_feedback),
                            checked = state.notifyFeedback,
                            onCheckedChange = { viewModel.toggleNotifyFeedback(it) },
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Preferred channels section
                SectionHeader(
                    icon = Icons.Default.Email,
                    title = stringResource(R.string.notif_prefs_channels),
                )
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_email),
                            checked = state.preferEmail,
                            onCheckedChange = { viewModel.togglePreferEmail(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_sms),
                            checked = state.preferSms,
                            onCheckedChange = { viewModel.togglePreferSms(it) },
                        )
                        NotifToggle(
                            label = stringResource(R.string.notif_pref_push),
                            checked = state.preferPush,
                            onCheckedChange = { viewModel.togglePreferPush(it) },
                        )
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Save button
                Button(
                    onClick = { viewModel.savePreferences() },
                    enabled = !state.isSaving,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    if (state.isSaving) {
                        CircularProgressIndicator(
                            modifier = Modifier
                                .padding(end = 8.dp)
                                .height(20.dp)
                                .width(20.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.onPrimary,
                        )
                    }
                    Text(stringResource(R.string.save))
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun NotifToggle(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f),
        )
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
        )
    }
}

@Composable
private fun SectionHeader(
    icon: ImageVector,
    title: String,
) {
    Row(
        modifier = Modifier.padding(bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
        )
    }
}
