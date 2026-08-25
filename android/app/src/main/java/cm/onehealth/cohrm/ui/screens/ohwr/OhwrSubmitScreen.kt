package cm.onehealth.cohrm.ui.screens.ohwr

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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OhwrSubmitScreen(
    onBack: () -> Unit,
    viewModel: OhwrSubmitViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.ohwr_submit_resource)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OhwrPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // Success message
            if (state.success) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Success.copy(alpha = 0.1f),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Success)
                        Text(stringResource(R.string.ohwr_submit_success), color = Success, fontWeight = FontWeight.Medium)
                    }
                }
                return@Column
            }

            // Error message
            state.error?.let { error ->
                Surface(shape = RoundedCornerShape(12.dp), color = Danger.copy(alpha = 0.1f), modifier = Modifier.fillMaxWidth()) {
                    Text(error, modifier = Modifier.padding(12.dp), color = Danger, fontSize = 13.sp)
                }
            }

            // Resource type selector
            Text(stringResource(R.string.ohwr_select_type), fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = state.resourceType == "expert",
                    onClick = { viewModel.setResourceType("expert") },
                    label = { Text(stringResource(R.string.ohwr_submit_expert)) },
                    leadingIcon = { if (state.resourceType == "expert") Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) },
                )
                FilterChip(
                    selected = state.resourceType == "organization",
                    onClick = { viewModel.setResourceType("organization") },
                    label = { Text(stringResource(R.string.ohwr_submit_org)) },
                    leadingIcon = { if (state.resourceType == "organization") Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) },
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            when (state.resourceType) {
                "expert" -> ExpertForm(state, viewModel)
                "organization" -> OrganizationForm(state, viewModel)
            }

            if (state.resourceType.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { viewModel.submit() },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !state.isSubmitting,
                    colors = ButtonDefaults.buttonColors(containerColor = OhwrPrimary),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    if (state.isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(stringResource(R.string.ohwr_submit_resource))
                    }
                }
            }
        }
    }
}

@Composable
private fun ExpertForm(state: OhwrSubmitState, viewModel: OhwrSubmitViewModel) {
    OutlinedTextField(
        value = state.fields["first_name"] ?: "",
        onValueChange = { viewModel.setField("first_name", it) },
        label = { Text(stringResource(R.string.ohwr_first_name)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["last_name"] ?: "",
        onValueChange = { viewModel.setField("last_name", it) },
        label = { Text(stringResource(R.string.ohwr_last_name)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["title"] ?: "",
        onValueChange = { viewModel.setField("title", it) },
        label = { Text(stringResource(R.string.ohwr_title_field)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["category"] ?: "",
        onValueChange = { viewModel.setField("category", it) },
        label = { Text(stringResource(R.string.ohwr_category_human_health)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["email"] ?: "",
        onValueChange = { viewModel.setField("email", it) },
        label = { Text(stringResource(R.string.ohwr_email)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["phone"] ?: "",
        onValueChange = { viewModel.setField("phone", it) },
        label = { Text(stringResource(R.string.ohwr_phone)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["region"] ?: "",
        onValueChange = { viewModel.setField("region", it) },
        label = { Text(stringResource(R.string.dashboard_by_region)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["city"] ?: "",
        onValueChange = { viewModel.setField("city", it) },
        label = { Text(stringResource(R.string.ohwr_city)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
}

@Composable
private fun OrganizationForm(state: OhwrSubmitState, viewModel: OhwrSubmitViewModel) {
    OutlinedTextField(
        value = state.fields["name"] ?: "",
        onValueChange = { viewModel.setField("name", it) },
        label = { Text(stringResource(R.string.ohwr_org_name)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["acronym"] ?: "",
        onValueChange = { viewModel.setField("acronym", it) },
        label = { Text(stringResource(R.string.ohwr_acronym)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["type"] ?: "",
        onValueChange = { viewModel.setField("type", it) },
        label = { Text(stringResource(R.string.ohwr_org_type)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["description"] ?: "",
        onValueChange = { viewModel.setField("description", it) },
        label = { Text(stringResource(R.string.el_description)) },
        modifier = Modifier.fillMaxWidth(),
        minLines = 3,
    )
    OutlinedTextField(
        value = state.fields["region"] ?: "",
        onValueChange = { viewModel.setField("region", it) },
        label = { Text(stringResource(R.string.dashboard_by_region)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
    OutlinedTextField(
        value = state.fields["contact_email"] ?: "",
        onValueChange = { viewModel.setField("contact_email", it) },
        label = { Text(stringResource(R.string.ohwr_email)) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
    )
}
