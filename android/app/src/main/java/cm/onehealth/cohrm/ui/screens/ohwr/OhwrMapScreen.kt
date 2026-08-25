package cm.onehealth.cohrm.ui.screens.ohwr

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
import androidx.compose.ui.text.font.FontWeight
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OhwrMapScreen(
    onNavigateToExpert: (Int) -> Unit = {},
    onBack: () -> Unit,
    viewModel: OhwrMapViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val cameroon = LatLng(5.96, 10.15)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(cameroon, 6f)
    }
    val sheetState = rememberModalBottomSheetState()

    Box(modifier = Modifier.fillMaxSize()) {
        Box(modifier = Modifier.fillMaxSize()) {
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
            ) {
                viewModel.filteredMarkers.forEach { marker ->
                    if (marker.lat != null && marker.lng != null) {
                        val hue = when (marker.type) {
                            "human" -> BitmapDescriptorFactory.HUE_BLUE
                            "organization" -> BitmapDescriptorFactory.HUE_GREEN
                            "material" -> BitmapDescriptorFactory.HUE_ORANGE
                            else -> BitmapDescriptorFactory.HUE_RED
                        }
                        Marker(
                            state = MarkerState(position = LatLng(marker.lat, marker.lng)),
                            title = marker.name,
                            snippet = "${marker.category ?: marker.type} - ${marker.region ?: ""}",
                            icon = BitmapDescriptorFactory.defaultMarker(hue),
                            onClick = {
                                viewModel.selectMarker(marker)
                                true
                            },
                        )
                    }
                }
            }

            // Filter chips
            Row(
                modifier = Modifier.align(Alignment.TopCenter).padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = state.showExperts,
                    onClick = { viewModel.toggleExperts() },
                    label = { Text(stringResource(R.string.ohwr_experts_label), fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.People, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Info.copy(alpha = 0.2f)),
                )
                FilterChip(
                    selected = state.showOrganizations,
                    onClick = { viewModel.toggleOrganizations() },
                    label = { Text(stringResource(R.string.ohwr_organizations_label), fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Business, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Success.copy(alpha = 0.2f)),
                )
                FilterChip(
                    selected = state.showMaterials,
                    onClick = { viewModel.toggleMaterials() },
                    label = { Text(stringResource(R.string.ohwr_materials_label), fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Build, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Warning.copy(alpha = 0.2f)),
                )
            }

            if (state.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = OhwrPrimary)
            }
        }

        // Bottom sheet for selected marker
        if (state.selectedMarker != null) {
            val marker = state.selectedMarker!!
            ModalBottomSheet(
                onDismissRequest = { viewModel.selectMarker(null) },
                sheetState = sheetState,
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 24.dp).padding(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    // Name
                    Text(marker.name, fontWeight = FontWeight.Bold, fontSize = 20.sp)

                    // Type badge + category
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        val (typeLabel, typeColor) = when (marker.type) {
                            "human" -> "Expert" to Info
                            "organization" -> "Organisation" to Success
                            "material" -> "Equipement" to Warning
                            else -> marker.type to Muted
                        }
                        Surface(shape = RoundedCornerShape(8.dp), color = typeColor.copy(alpha = 0.1f)) {
                            Text(typeLabel, fontSize = 12.sp, color = typeColor, fontWeight = FontWeight.Medium, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                        }
                        if (!marker.category.isNullOrBlank()) {
                            Surface(shape = RoundedCornerShape(8.dp), color = OhwrLight.copy(alpha = 0.1f)) {
                                Text(marker.category, fontSize = 12.sp, color = OhwrPrimary, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                            }
                        }
                    }

                    // Region/City
                    if (!marker.region.isNullOrBlank() || !marker.city.isNullOrBlank()) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = OhwrLight, modifier = Modifier.size(18.dp))
                            Text(
                                listOfNotNull(marker.region, marker.city).joinToString(", "),
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }

                    // Title (for experts)
                    if (!marker.title.isNullOrBlank()) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Work, contentDescription = null, tint = OhwrLight, modifier = Modifier.size(18.dp))
                            Text(marker.title, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    // Status (for materials)
                    if (!marker.status.isNullOrBlank()) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = OhwrLight, modifier = Modifier.size(18.dp))
                            Text(marker.status, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    // Navigate to detail button (for experts)
                    if (marker.type == "human") {
                        Button(
                            onClick = {
                                viewModel.selectMarker(null)
                                onNavigateToExpert(marker.id)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = OhwrPrimary),
                        ) {
                            Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.ohwr_view_detail))
                        }
                    }
                }
            }
        }
    }
}
