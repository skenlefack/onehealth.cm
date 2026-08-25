package cm.onehealth.cohrm.ui.screens.elearning

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.elearning.ELCertificateDto
import cm.onehealth.cohrm.domain.repository.elearning.ELearningRepository
import cm.onehealth.cohrm.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CertVerifyState(
    val code: String = "",
    val isLoading: Boolean = false,
    val certificate: ELCertificateDto? = null,
    val error: String? = null,
    val searched: Boolean = false,
)

@HiltViewModel
class CertVerifyViewModel @Inject constructor(private val repo: ELearningRepository) : ViewModel() {
    private val _state = MutableStateFlow(CertVerifyState())
    val state: StateFlow<CertVerifyState> = _state.asStateFlow()

    fun setCode(code: String) { _state.update { it.copy(code = code) } }

    fun verify() {
        _state.update { it.copy(isLoading = true, error = null, certificate = null) }
        viewModelScope.launch {
            repo.verifyCertificate(_state.value.code).fold(
                onSuccess = { cert -> _state.update { it.copy(isLoading = false, certificate = cert, searched = true) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage, searched = true) } },
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CertificateVerifyScreen(
    onBack: () -> Unit,
    viewModel: CertVerifyViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.el_verify_certificate)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ELearningPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Input field
            OutlinedTextField(
                value = state.code,
                onValueChange = { viewModel.setCode(it) },
                label = { Text(stringResource(R.string.el_enter_code)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.QrCode, contentDescription = null) },
            )

            // Verify button
            Button(
                onClick = { viewModel.verify() },
                modifier = Modifier.fillMaxWidth(),
                enabled = state.code.isNotBlank() && !state.isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = ELearningPrimary),
                shape = RoundedCornerShape(12.dp),
            ) {
                if (state.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Icon(Icons.Default.Verified, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.el_verify_button))
                }
            }

            // Results
            if (state.searched) {
                if (state.certificate != null) {
                    val cert = state.certificate!!
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Success.copy(alpha = 0.05f)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Success, modifier = Modifier.size(24.dp))
                                Text(stringResource(R.string.el_cert_valid), fontWeight = FontWeight.Bold, color = Success, fontSize = 16.sp)
                            }

                            HorizontalDivider()

                            cert.recipientName?.let {
                                CertDetailRow(label = "Recipient", value = it)
                            }
                            val courseTitle = cert.titleFr ?: cert.titleEn ?: ""
                            if (courseTitle.isNotBlank()) {
                                CertDetailRow(label = "Course", value = courseTitle)
                            }
                            cert.issueDate?.let {
                                CertDetailRow(label = stringResource(R.string.el_issued_on), value = it.take(10))
                            }
                            cert.finalScore?.let {
                                CertDetailRow(label = "Score", value = "${it.toInt()}%")
                            }
                            cert.status?.let {
                                CertDetailRow(label = "Status", value = it.replaceFirstChar { c -> c.uppercase() })
                            }
                            cert.certificateNumber?.let {
                                CertDetailRow(label = stringResource(R.string.el_verify_code), value = it)
                            }
                        }
                    }
                } else if (state.error != null) {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Danger.copy(alpha = 0.05f)),
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(Icons.Default.Error, contentDescription = null, tint = Danger)
                            Text(stringResource(R.string.el_cert_not_found), color = Danger, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CertDetailRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontSize = 13.sp, color = Color.Gray)
        Text(value, fontSize = 13.sp, fontWeight = FontWeight.Medium)
    }
}
