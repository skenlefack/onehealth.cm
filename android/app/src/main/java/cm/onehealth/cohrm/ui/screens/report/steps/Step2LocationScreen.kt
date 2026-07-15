package cm.onehealth.cohrm.ui.screens.report.steps

import android.Manifest
import android.widget.Toast
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.domain.model.CameroonRegions
import cm.onehealth.cohrm.ui.screens.report.ReportFormState
import cm.onehealth.cohrm.ui.screens.report.ReportViewModel
import cm.onehealth.cohrm.util.LocationHelper
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun Step2LocationScreen(
    state: ReportFormState,
    viewModel: ReportViewModel,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val locationHelper = remember { LocationHelper(context) }

    val locationPermissions = rememberMultiplePermissionsState(
        listOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
    )

    var regionExpanded by remember { mutableStateOf(false) }
    var departmentExpanded by remember { mutableStateOf(false) }

    val selectedRegion = CameroonRegions.find { it.code == state.region }
    val departments = selectedRegion?.departments ?: emptyList()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
    ) {
        Text(
            text = stringResource(R.string.step2_title),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = stringResource(R.string.step2_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Region dropdown
        ExposedDropdownMenuBox(
            expanded = regionExpanded,
            onExpandedChange = { regionExpanded = it },
        ) {
            OutlinedTextField(
                value = selectedRegion?.name ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text(stringResource(R.string.location_region)) },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = regionExpanded) },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(),
            )
            ExposedDropdownMenu(
                expanded = regionExpanded,
                onDismissRequest = { regionExpanded = false },
            ) {
                CameroonRegions.forEach { region ->
                    DropdownMenuItem(
                        text = { Text(region.name) },
                        onClick = {
                            viewModel.updateRegion(region.code)
                            regionExpanded = false
                        },
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Department dropdown
        ExposedDropdownMenuBox(
            expanded = departmentExpanded,
            onExpandedChange = { departmentExpanded = it },
        ) {
            OutlinedTextField(
                value = state.department,
                onValueChange = {},
                readOnly = true,
                label = { Text(stringResource(R.string.location_department)) },
                enabled = departments.isNotEmpty(),
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = departmentExpanded) },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(),
            )
            ExposedDropdownMenu(
                expanded = departmentExpanded,
                onDismissRequest = { departmentExpanded = false },
            ) {
                departments.forEach { dept ->
                    DropdownMenuItem(
                        text = { Text(dept) },
                        onClick = {
                            viewModel.updateDepartment(dept)
                            departmentExpanded = false
                        },
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // District
        OutlinedTextField(
            value = state.district,
            onValueChange = { viewModel.updateDistrict(it) },
            label = { Text(stringResource(R.string.location_district)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Arrondissement
        OutlinedTextField(
            value = state.arrondissement,
            onValueChange = { viewModel.updateArrondissement(it) },
            label = { Text(stringResource(R.string.location_arrondissement)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Commune
        OutlinedTextField(
            value = state.commune,
            onValueChange = { viewModel.updateCommune(it) },
            label = { Text(stringResource(R.string.location_commune)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Aire de sante
        OutlinedTextField(
            value = state.aireSante,
            onValueChange = { viewModel.updateAireSante(it) },
            label = { Text(stringResource(R.string.location_aire_sante)) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // GPS button
        Button(
            onClick = {
                if (locationPermissions.allPermissionsGranted) {
                    scope.launch {
                        val location = locationHelper.getCurrentLocation()
                        if (location != null) {
                            viewModel.updateLocation(location.latitude, location.longitude)
                            Toast.makeText(context, context.getString(R.string.location_gps_acquired), Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, context.getString(R.string.location_gps_error), Toast.LENGTH_SHORT).show()
                        }
                    }
                } else {
                    locationPermissions.launchMultiplePermissionRequest()
                }
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Icon(Icons.Default.MyLocation, contentDescription = null)
            Spacer(modifier = Modifier.height(8.dp))
            Text(stringResource(R.string.location_use_gps))
        }

        if (state.latitude != null && state.longitude != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "${stringResource(R.string.location_gps)}: ${String.format("%.6f", state.latitude)}, ${String.format("%.6f", state.longitude)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
