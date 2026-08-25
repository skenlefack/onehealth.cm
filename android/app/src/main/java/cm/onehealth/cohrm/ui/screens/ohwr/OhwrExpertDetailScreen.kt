package cm.onehealth.cohrm.ui.screens.ohwr

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage

@Composable
fun OhwrExpertDetailScreen(
    onBack: () -> Unit,
    viewModel: OhwrExpertDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.ohwr_expert_detail)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OhwrPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        when {
            state.isLoading -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OhwrPrimary) }
            state.error != null -> Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { Text(state.error!!, color = Danger) }
            state.expert != null -> {
                val expert = state.expert!!
                Column(modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState())) {
                    // Header
                    Box(modifier = Modifier.fillMaxWidth().background(OhwrPrimary.copy(alpha = 0.05f)).padding(24.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(
                                modifier = Modifier.size(80.dp).clip(CircleShape).background(OhwrLight.copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center,
                            ) {
                                if (expert.photo != null) {
                                    AsyncImage(model = expert.photo, contentDescription = null, modifier = Modifier.fillMaxSize().clip(CircleShape), contentScale = ContentScale.Crop)
                                } else {
                                    Text((expert.firstName?.firstOrNull() ?: "?").toString().uppercase(), fontWeight = FontWeight.Bold, fontSize = 28.sp, color = OhwrPrimary)
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(expert.fullName, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                                if (expert.isVerified == 1) Icon(Icons.Default.Verified, contentDescription = null, tint = Info, modifier = Modifier.size(20.dp))
                            }
                            if (!expert.title.isNullOrBlank()) Text(expert.title, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (!expert.category.isNullOrBlank()) InfoRow(Icons.Default.Category, stringResource(R.string.rumor_category), expert.category)
                        if (!expert.organizationName.isNullOrBlank()) InfoRow(Icons.Default.Business, stringResource(R.string.profile_organization), expert.organizationName + (expert.organizationAcronym?.let { " ($it)" } ?: ""))
                        if (!expert.region.isNullOrBlank()) InfoRow(Icons.Default.LocationOn, stringResource(R.string.rumor_region), "${expert.region}${expert.city?.let { ", $it" } ?: ""}")
                        if (expert.yearsExperience != null) InfoRow(Icons.Default.WorkHistory, stringResource(R.string.ohwr_experience), "${expert.yearsExperience} ${stringResource(R.string.ohwr_years)}")
                        if (!expert.email.isNullOrBlank()) InfoRow(Icons.Default.Email, stringResource(R.string.profile_email), expert.email)
                        if (!expert.phone.isNullOrBlank()) InfoRow(Icons.Default.Phone, stringResource(R.string.profile_phone), expert.phone)

                        if (!expert.biography.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(stringResource(R.string.ohwr_biography), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text(expert.biography, fontSize = 14.sp, lineHeight = 22.sp)
                        }
                        if (!expert.expertiseSummary.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(stringResource(R.string.ohwr_expertise), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text(expert.expertiseSummary, fontSize = 14.sp, lineHeight = 22.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoRow(icon: ImageVector, label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Icon(icon, contentDescription = null, tint = OhwrLight, modifier = Modifier.size(20.dp))
        Column {
            Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        }
    }
}
