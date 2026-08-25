package cm.onehealth.cohrm.ui.screens.cohrm

import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*

@Composable
fun RumorsMapScreen(
    onRumorClick: (Int) -> Unit,
    onBack: () -> Unit,
    viewModel: RumorsMapViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val cameroon = LatLng(7.37, 12.35)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(cameroon, 6f)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.rumors_map_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Primary,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                ),
            )
        },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
            ) {
                val rumors = viewModel.filteredRumors
                rumors.forEach { rumor ->
                    if (rumor.latitude != null && rumor.longitude != null) {
                        val hue = when (rumor.status) {
                            "pending" -> BitmapDescriptorFactory.HUE_ORANGE
                            "investigating" -> BitmapDescriptorFactory.HUE_AZURE
                            "confirmed" -> BitmapDescriptorFactory.HUE_RED
                            "false_alarm" -> BitmapDescriptorFactory.HUE_GREEN
                            "closed" -> BitmapDescriptorFactory.HUE_VIOLET
                            else -> BitmapDescriptorFactory.HUE_ROSE
                        }
                        val statusLabel = rumor.status.replace("_", " ")
                            .replaceFirstChar { it.uppercase() }
                        val dateStr = if (rumor.createdAt.length >= 10) {
                            "${rumor.createdAt.substring(8, 10)}/${rumor.createdAt.substring(5, 7)}/${rumor.createdAt.substring(0, 4)}"
                        } else rumor.createdAt

                        MarkerInfoWindow(
                            state = MarkerState(position = LatLng(rumor.latitude, rumor.longitude)),
                            title = rumor.title.ifEmpty { rumor.code },
                            snippet = "$statusLabel - $dateStr",
                            icon = BitmapDescriptorFactory.defaultMarker(hue),
                            onInfoWindowClick = { onRumorClick(rumor.id) },
                        ) {
                            // Custom info window
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                shadowElevation = 4.dp,
                                color = MaterialTheme.colorScheme.surface,
                            ) {
                                Column(modifier = Modifier.padding(12.dp).widthIn(max = 220.dp)) {
                                    Text(
                                        text = rumor.title.ifEmpty { rumor.code },
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "$statusLabel - $dateStr",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Muted,
                                    )
                                    if (rumor.region.isNotEmpty()) {
                                        Text(
                                            text = "${rumor.region} - ${rumor.department}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Muted,
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = stringResource(R.string.rumors_map_tap_detail),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Primary,
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Filter chips at top
            Row(
                modifier = Modifier.align(Alignment.TopCenter).padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                FilterChip(
                    selected = state.statusFilter == null,
                    onClick = { viewModel.setStatusFilter(null) },
                    label = { Text(stringResource(R.string.rumors_map_all), fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Primary.copy(alpha = 0.2f)),
                )
                FilterChip(
                    selected = state.statusFilter == "pending",
                    onClick = { viewModel.setStatusFilter(if (state.statusFilter == "pending") null else "pending") },
                    label = { Text(stringResource(R.string.rumors_map_pending), fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Warning.copy(alpha = 0.2f)),
                )
                FilterChip(
                    selected = state.statusFilter == "investigating",
                    onClick = { viewModel.setStatusFilter(if (state.statusFilter == "investigating") null else "investigating") },
                    label = { Text(stringResource(R.string.rumors_map_investigating), fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Info.copy(alpha = 0.2f)),
                )
                FilterChip(
                    selected = state.statusFilter == "confirmed",
                    onClick = { viewModel.setStatusFilter(if (state.statusFilter == "confirmed") null else "confirmed") },
                    label = { Text(stringResource(R.string.rumors_map_confirmed), fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Danger.copy(alpha = 0.2f)),
                )
            }

            if (state.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = Primary)
            }
        }
    }
}
