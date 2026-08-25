package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import cm.onehealth.cohrm.data.remote.elearning.ELCertificateDto
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun CertificatesScreen(
    onBack: () -> Unit,
    viewModel: CertificatesViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = ELearningPrimary)
            }
        } else if (state.certificates.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = ELearningPrimary.copy(alpha = 0.3f), modifier = Modifier.size(80.dp))
                    Text("${state.stats?.certificates ?: 0}", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = ELearningPrimary)
                    Text(stringResource(R.string.el_certificates_earned), fontSize = 16.sp, color = Muted)
                    Card(modifier = Modifier.padding(horizontal = 32.dp), shape = RoundedCornerShape(12.dp)) {
                        Text(stringResource(R.string.el_no_certificates_yet), modifier = Modifier.padding(16.dp), fontSize = 14.sp, color = Muted)
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                // Stats header
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(28.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("${state.certificates.size}", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = ELearningPrimary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(stringResource(R.string.el_certificates_earned), fontSize = 14.sp, color = Muted)
                    }
                }
                items(state.certificates) { cert ->
                    CertificateCard(cert)
                }
            }
        }
}

@Composable
private fun CertificateCard(cert: ELCertificateDto) {
    val statusColor = when (cert.status) {
        "active" -> Success
        "revoked" -> Danger
        "expired" -> Warning
        else -> Muted
    }
    val statusLabel = when (cert.status) {
        "active" -> "Active"
        "revoked" -> "Revoked"
        "expired" -> "Expired"
        else -> cert.status ?: ""
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Verified, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        stringResource(R.string.el_cert_number, cert.certificateNumber ?: ""),
                        fontWeight = FontWeight.Bold, fontSize = 14.sp,
                    )
                }
                Surface(shape = RoundedCornerShape(12.dp), color = statusColor.copy(alpha = 0.15f)) {
                    Text(statusLabel, modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = statusColor)
                }
            }

            Text(cert.titleFr ?: cert.titleEn ?: "", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)

            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text(stringResource(R.string.el_issued_on), fontSize = 12.sp, color = Muted)
                    Text(cert.issueDate ?: "-", fontSize = 13.sp)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Score", fontSize = 12.sp, color = Muted)
                    Text("${cert.finalScore?.toInt() ?: 0}%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ELearningPrimary)
                }
            }

            if (!cert.verificationCode.isNullOrBlank()) {
                Surface(shape = RoundedCornerShape(8.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
                    Row(modifier = Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.el_verify_code), fontSize = 12.sp, color = Muted)
                        Spacer(modifier = Modifier.weight(1f))
                        Text(cert.verificationCode, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}
