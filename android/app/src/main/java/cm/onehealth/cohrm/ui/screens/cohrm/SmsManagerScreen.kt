package cm.onehealth.cohrm.ui.screens.cohrm

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.SmsCodeDetailDto
import cm.onehealth.cohrm.data.remote.dto.SmsDecodedDto
import cm.onehealth.cohrm.data.remote.dto.SmsLogDto
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.Success
import cm.onehealth.cohrm.ui.theme.Warning
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// --- ViewModel ---

data class SmsManagerUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    // Decoder
    val decoderInput: String = "",
    val isDecoding: Boolean = false,
    val decodedResult: SmsDecodedDto? = null,
    // Codes
    val codes: List<SmsCodeDetailDto> = emptyList(),
    val isLoadingCodes: Boolean = false,
    // Logs
    val logs: List<SmsLogDto> = emptyList(),
    val isLoadingLogs: Boolean = false,
    val logsPage: Int = 1,
    val isLoadingMoreLogs: Boolean = false,
)

@HiltViewModel
class SmsManagerViewModel @Inject constructor(
    private val apiService: ApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(SmsManagerUiState())
    val state: StateFlow<SmsManagerUiState> = _state.asStateFlow()

    init {
        loadCodes()
        loadLogs()
    }

    fun setDecoderInput(value: String) {
        _state.update { it.copy(decoderInput = value) }
    }

    fun decode() {
        val message = _state.value.decoderInput.trim()
        if (message.isBlank()) return
        _state.update { it.copy(isDecoding = true, decodedResult = null, error = null) }
        viewModelScope.launch {
            try {
                val response = apiService.decodeSms(
                    cm.onehealth.cohrm.data.remote.dto.SmsDecodeRequest(message),
                )
                _state.update { it.copy(isDecoding = false, decodedResult = response.data) }
            } catch (e: Exception) {
                _state.update { it.copy(isDecoding = false, error = e.localizedMessage) }
            }
        }
    }

    fun loadCodes() {
        _state.update { it.copy(isLoadingCodes = true) }
        viewModelScope.launch {
            try {
                val response = apiService.getSmsCodes()
                _state.update { it.copy(isLoadingCodes = false, codes = response.data ?: emptyList()) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoadingCodes = false, error = e.localizedMessage) }
            }
        }
    }

    fun createCode(code: String, category: String, description: String?) {
        viewModelScope.launch {
            try {
                apiService.createSmsCode(
                    cm.onehealth.cohrm.data.remote.dto.SmsCodeCreateRequest(code, category, description),
                )
                loadCodes()
            } catch (e: Exception) {
                _state.update { it.copy(error = e.localizedMessage) }
            }
        }
    }

    fun deleteCode(id: Int) {
        viewModelScope.launch {
            try {
                apiService.deleteSmsCode(id)
                loadCodes()
            } catch (e: Exception) {
                _state.update { it.copy(error = e.localizedMessage) }
            }
        }
    }

    fun loadLogs() {
        _state.update { it.copy(isLoadingLogs = true, logsPage = 1) }
        viewModelScope.launch {
            try {
                val response = apiService.getSmsLogs(page = 1)
                _state.update { it.copy(isLoadingLogs = false, logs = response.data ?: emptyList()) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoadingLogs = false, error = e.localizedMessage) }
            }
        }
    }

    fun loadMoreLogs() {
        if (_state.value.isLoadingMoreLogs) return
        _state.update { it.copy(isLoadingMoreLogs = true, logsPage = it.logsPage + 1) }
        viewModelScope.launch {
            try {
                val response = apiService.getSmsLogs(page = _state.value.logsPage)
                val newLogs = response.data ?: emptyList()
                _state.update { it.copy(isLoadingMoreLogs = false, logs = it.logs + newLogs) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoadingMoreLogs = false, error = e.localizedMessage) }
            }
        }
    }
}

// --- Screen ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmsManagerScreen(
    onBack: () -> Unit = {},
    viewModel: SmsManagerViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var selectedTab by remember { mutableIntStateOf(0) }
    var showAddCodeDialog by remember { mutableStateOf(false) }

    val tabTitles = listOf(
        stringResource(R.string.sms_decoder_tab),
        stringResource(R.string.sms_codes_tab),
        stringResource(R.string.sms_logs_tab),
    )

    if (showAddCodeDialog) {
        AddSmsCodeDialog(
            onDismiss = { showAddCodeDialog = false },
            onConfirm = { code, category, description ->
                viewModel.createCode(code, category, description)
                showAddCodeDialog = false
            },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.sms_manager_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                },
            )
        },
        floatingActionButton = {
            if (selectedTab == 1) {
                FloatingActionButton(
                    onClick = { showAddCodeDialog = true },
                    containerColor = Primary,
                ) {
                    Icon(Icons.Default.Add, contentDescription = stringResource(R.string.sms_add_code), tint = Color.White)
                }
            }
        },
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            TabRow(selectedTabIndex = selectedTab) {
                tabTitles.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) },
                        icon = {
                            when (index) {
                                0 -> Icon(Icons.Default.Sms, contentDescription = null, modifier = Modifier.size(18.dp))
                                1 -> Icon(Icons.Default.Code, contentDescription = null, modifier = Modifier.size(18.dp))
                                2 -> Icon(Icons.Default.History, contentDescription = null, modifier = Modifier.size(18.dp))
                            }
                        },
                    )
                }
            }

            when (selectedTab) {
                0 -> DecoderTab(state, viewModel)
                1 -> CodesTab(state, viewModel)
                2 -> LogsTab(state, viewModel)
            }
        }
    }
}

@Composable
private fun DecoderTab(state: SmsManagerUiState, viewModel: SmsManagerViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        OutlinedTextField(
            value = state.decoderInput,
            onValueChange = { viewModel.setDecoderInput(it) },
            modifier = Modifier.fillMaxWidth(),
            label = { Text(stringResource(R.string.sms_enter_message)) },
            minLines = 3,
            maxLines = 5,
            shape = RoundedCornerShape(12.dp),
        )

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = { viewModel.decode() },
            modifier = Modifier.fillMaxWidth(),
            enabled = state.decoderInput.isNotBlank() && !state.isDecoding,
            colors = ButtonDefaults.buttonColors(containerColor = Primary),
            shape = RoundedCornerShape(12.dp),
        ) {
            if (state.isDecoding) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(stringResource(R.string.sms_decode_button))
        }

        state.error?.let { error ->
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = error, color = Danger, style = MaterialTheme.typography.bodySmall)
        }

        state.decodedResult?.let { result ->
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .animateContentSize(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Success.copy(alpha = 0.08f)),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = stringResource(R.string.sms_decoded_result),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Primary,
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    DecodedField("Code", result.code)
                    DecodedField("Localite", result.localite)
                    DecodedField("Symptomes", result.symptomes)
                    DecodedField("Espece", result.espece)
                    DecodedField("Nombre", result.nombre)
                    DecodedField("Details", result.details)
                }
            }
        }
    }
}

@Composable
private fun DecodedField(label: String, value: String?) {
    if (value.isNullOrBlank()) return
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
    ) {
        Text(
            text = "$label:",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.width(100.dp),
            color = MaterialTheme.colorScheme.onSurface,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun CodesTab(state: SmsManagerUiState, viewModel: SmsManagerViewModel) {
    if (state.isLoadingCodes) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    if (state.codes.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = stringResource(R.string.sms_no_codes),
                    style = MaterialTheme.typography.titleMedium,
                    color = Muted,
                )
            }
        }
        return
    }

    val grouped = state.codes.groupBy { it.category ?: "Autre" }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        grouped.forEach { (category, codes) ->
            item {
                Text(
                    text = category.replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = Primary,
                    modifier = Modifier.padding(vertical = 4.dp),
                )
            }
            items(codes, key = { it.id }) { code ->
                SmsCodeCard(code = code, onDelete = { viewModel.deleteCode(code.id) })
            }
        }
    }
}

@Composable
private fun SmsCodeCard(code: SmsCodeDetailDto, onDelete: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(Primary.copy(alpha = 0.1f))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
            ) {
                Text(
                    text = code.code,
                    fontWeight = FontWeight.Bold,
                    color = Primary,
                    fontSize = 14.sp,
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = code.description ?: code.code,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = stringResource(R.string.delete), tint = Danger)
            }
        }
    }
}

@Composable
private fun LogsTab(state: SmsManagerUiState, viewModel: SmsManagerViewModel) {
    if (state.isLoadingLogs) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    if (state.logs.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                text = stringResource(R.string.sms_no_logs),
                style = MaterialTheme.typography.titleMedium,
                color = Muted,
            )
        }
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(state.logs, key = { it.id }) { log ->
            SmsLogCard(log)
        }
        if (state.isLoadingMoreLogs) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp))
                }
            }
        }
        item {
            TextButton(
                onClick = { viewModel.loadMoreLogs() },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.rumors_load_more))
            }
        }
    }
}

@Composable
private fun SmsLogCard(log: SmsLogDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = log.sender ?: "Inconnu",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                LogStatusBadge(log.status ?: "unknown")
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = log.message ?: "",
                style = MaterialTheme.typography.bodySmall,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = formatLogDate(log.createdAt ?: ""),
                style = MaterialTheme.typography.labelSmall,
                color = Muted,
            )
        }
    }
}

@Composable
private fun LogStatusBadge(status: String) {
    val color = when (status) {
        "processed" -> Success
        "pending" -> Warning
        "error", "failed" -> Danger
        else -> Muted
    }
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 8.dp, vertical = 3.dp),
    ) {
        Text(
            text = status.replaceFirstChar { it.uppercase() },
            fontSize = 10.sp,
            color = color,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun AddSmsCodeDialog(
    onDismiss: () -> Unit,
    onConfirm: (code: String, category: String, description: String?) -> Unit,
) {
    var code by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.sms_add_code)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it },
                    label = { Text("Code") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = { Text("Categorie") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3,
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(code, category, description.ifBlank { null }) },
                enabled = code.isNotBlank() && category.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = Primary),
            ) { Text(stringResource(R.string.save)) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
        },
    )
}

private fun formatLogDate(dateStr: String): String {
    if (dateStr.length < 10) return dateStr
    return try {
        "${dateStr.substring(8, 10)}/${dateStr.substring(5, 7)}/${dateStr.substring(0, 4)} ${dateStr.substring(11, 16)}"
    } catch (_: Exception) {
        dateStr
    }
}
