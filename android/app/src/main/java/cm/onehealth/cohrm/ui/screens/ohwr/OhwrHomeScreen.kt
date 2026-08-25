package cm.onehealth.cohrm.ui.screens.ohwr

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun OhwrHomeScreen(
    onExpertsClick: () -> Unit,
    onOrganizationsClick: () -> Unit,
    onMaterialsClick: () -> Unit,
    onDocumentsClick: () -> Unit,
    onMapClick: () -> Unit,
    onSubmitClick: () -> Unit = {},
    onMySubmissionsClick: () -> Unit = {},
    onBack: () -> Unit,
    viewModel: OhwrHomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
        ) {
            // Stats banner
            Box(
                modifier = Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(OhwrPrimary, OhwrLight))).padding(20.dp),
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    StatCard(value = "${state.expertCount}", label = stringResource(R.string.ohwr_experts_label), icon = Icons.Default.People)
                    StatCard(value = "${state.orgCount}", label = stringResource(R.string.ohwr_organizations_label), icon = Icons.Default.Business)
                    StatCard(value = "${state.materialCount}", label = stringResource(R.string.ohwr_materials_label), icon = Icons.Default.Build)
                    StatCard(value = "${state.documentCount}", label = stringResource(R.string.ohwr_documents_label), icon = Icons.Default.Description)
                }
            }

            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Map card
                Card(
                    modifier = Modifier.fillMaxWidth().clickable(onClick = onMapClick),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                ) {
                    Box(
                        modifier = Modifier.fillMaxWidth().height(160.dp).background(Brush.linearGradient(listOf(OhwrPrimary.copy(alpha = 0.1f), OhwrLight.copy(alpha = 0.1f)))),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Map, contentDescription = null, tint = OhwrPrimary, modifier = Modifier.size(48.dp))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(stringResource(R.string.ohwr_view_map), fontWeight = FontWeight.Bold, color = OhwrPrimary)
                            Text("${state.markerCount} ${stringResource(R.string.ohwr_resources_mapped)}", fontSize = 13.sp, color = OhwrLight)
                        }
                    }
                }

                // 4 Pillar cards
                Text(stringResource(R.string.ohwr_explore_resources), fontWeight = FontWeight.Bold, fontSize = 18.sp)

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    PillarCard(
                        title = stringResource(R.string.ohwr_experts_label),
                        icon = Icons.Default.People,
                        color = Info,
                        count = state.expertCount,
                        onClick = onExpertsClick,
                        modifier = Modifier.weight(1f),
                    )
                    PillarCard(
                        title = stringResource(R.string.ohwr_materials_label),
                        icon = Icons.Default.Build,
                        color = Warning,
                        count = state.materialCount,
                        onClick = onMaterialsClick,
                        modifier = Modifier.weight(1f),
                    )
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    PillarCard(
                        title = stringResource(R.string.ohwr_organizations_label),
                        icon = Icons.Default.Business,
                        color = Success,
                        count = state.orgCount,
                        onClick = onOrganizationsClick,
                        modifier = Modifier.weight(1f),
                    )
                    PillarCard(
                        title = stringResource(R.string.ohwr_documents_label),
                        icon = Icons.Default.Description,
                        color = ELearningPrimary,
                        count = state.documentCount,
                        onClick = onDocumentsClick,
                        modifier = Modifier.weight(1f),
                    )
                }

                // Trending searches
                Text(stringResource(R.string.ohwr_trending), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Row(modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Épidémiologie", "Laboratoire", "Zoonoses", "FAO", "OMS", "Vaccination").forEach { tag ->
                        AssistChip(
                            onClick = { onExpertsClick() },
                            label = { Text(tag, fontSize = 12.sp) },
                            leadingIcon = { Icon(Icons.Default.TrendingUp, contentDescription = null, modifier = Modifier.size(16.dp)) },
                        )
                    }
                }

                // Recent documents
                if (state.recentDocuments.isNotEmpty()) {
                    Text(stringResource(R.string.ohwr_recent_docs), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    state.recentDocuments.take(3).forEach { doc ->
                        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(Icons.Default.Description, contentDescription = null, tint = OhwrLight, modifier = Modifier.size(32.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(doc.title, fontWeight = FontWeight.Medium, fontSize = 14.sp, maxLines = 1)
                                    Text(doc.organizationAcronym ?: doc.type ?: "", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                }

                // Submit / My Submissions actions
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = onSubmitClick,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(stringResource(R.string.ohwr_submit_resource), fontSize = 12.sp, maxLines = 1)
                    }
                    OutlinedButton(
                        onClick = onMySubmissionsClick,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                    ) {
                        Icon(Icons.Default.ListAlt, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(stringResource(R.string.ohwr_my_submissions), fontSize = 12.sp, maxLines = 1)
                    }
                }

                if (state.error != null) {
                    Text(state.error!!, color = Danger, fontSize = 13.sp)
                }
            }
        }
}

@Composable
private fun StatCard(value: String, label: String, icon: ImageVector) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(20.dp))
        Text(value, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
        Text(label, color = Color.White.copy(alpha = 0.8f), fontSize = 10.sp)
    }
}

@Composable
private fun PillarCard(title: String, icon: ImageVector, color: Color, count: Int, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier.size(48.dp).background(color.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center,
            ) { Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp)) }
            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Medium, fontSize = 13.sp)
            Text("$count", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = color)
        }
    }
}

private val CircleShape = RoundedCornerShape(50)
