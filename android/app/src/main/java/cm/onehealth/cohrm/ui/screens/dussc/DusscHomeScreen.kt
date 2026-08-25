package cm.onehealth.cohrm.ui.screens.dussc

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun DusscHomeScreen(
    onStartQuiz: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: DusscHomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
        ) {
            // Language toggle
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                horizontalArrangement = Arrangement.End,
            ) {
                TextButton(onClick = { viewModel.toggleLang() }) {
                    Text(
                        text = if (state.lang == "fr") "EN" else "FR",
                        color = DusscPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                    )
                }
            }
            // Header banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(DusscPrimary, DusscLight)))
                    .padding(20.dp),
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.Quiz, contentDescription = null, tint = Color.White, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(stringResource(R.string.dussc_full_title), color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    Text(stringResource(R.string.dussc_description), color = Color.White.copy(alpha = 0.9f), fontSize = 13.sp, textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        InfoChip("15", stringResource(R.string.dussc_questions))
                        InfoChip("~7", stringResource(R.string.dussc_minutes))
                    }
                }
            }

            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Modules covered
                if (state.modules.isNotEmpty()) {
                    Text(stringResource(R.string.dussc_modules_covered), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        state.modules.take(5).forEach { module ->
                            val bgColor = try { Color(android.graphics.Color.parseColor(module.color ?: "#27AE60")) } catch (_: Exception) { DusscLight }
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = bgColor.copy(alpha = 0.15f),
                            ) {
                                Text(
                                    text = module.name,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    fontSize = 11.sp,
                                    color = bgColor,
                                    fontWeight = FontWeight.Medium,
                                )
                            }
                        }
                    }
                }

                // Persona selection
                Text(stringResource(R.string.dussc_select_profile), fontWeight = FontWeight.Bold, fontSize = 16.sp)

                if (state.isLoading) {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = DusscPrimary)
                    }
                } else {
                    // Group personas by family
                    val familyLabels = mapOf(
                        "A" to stringResource(R.string.dussc_family_a),
                        "B" to stringResource(R.string.dussc_family_b),
                        "C" to stringResource(R.string.dussc_family_c),
                        "D" to stringResource(R.string.dussc_family_d),
                    )
                    val grouped = state.personas.groupBy { it.family }

                    grouped.forEach { (family, personas) ->
                        Text(
                            text = familyLabels[family] ?: family,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        personas.forEach { persona ->
                            val isSelected = state.selectedPersona?.code == persona.code
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.selectPersona(persona) },
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) DusscLight.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                border = if (isSelected) ButtonDefaults.outlinedButtonBorder.copy(
                                    brush = Brush.linearGradient(listOf(DusscLight, DusscPrimary))
                                ) else null,
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                ) {
                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { viewModel.selectPersona(persona) },
                                        colors = RadioButtonDefaults.colors(selectedColor = DusscPrimary),
                                    )
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(persona.name, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                                        if (!persona.description.isNullOrBlank()) {
                                            Text(persona.description, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                    }
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                }

                // Start button
                Button(
                    onClick = { viewModel.showConsentDialog() },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    enabled = state.selectedPersona != null,
                    colors = ButtonDefaults.buttonColors(containerColor = DusscPrimary),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.dussc_start_quiz), fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                if (state.error != null) {
                    Text(state.error!!, color = Danger, fontSize = 13.sp)
                }
            }
        }

        // Consent dialog
        if (state.showConsent) {
            AlertDialog(
                onDismissRequest = { viewModel.hideConsent() },
                title = { Text(stringResource(R.string.dussc_consent_title), fontWeight = FontWeight.Bold) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        if (state.consentText != null) {
                            Card(
                                modifier = Modifier.fillMaxWidth().heightIn(max = 300.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                                shape = RoundedCornerShape(8.dp),
                            ) {
                                Text(
                                    text = state.consentText!!,
                                    modifier = Modifier.padding(12.dp).verticalScroll(rememberScrollState()),
                                    fontSize = 13.sp,
                                    lineHeight = 20.sp,
                                )
                            }
                        } else {
                            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = DusscPrimary, modifier = Modifier.size(24.dp))
                            }
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = state.consentAccepted,
                                onCheckedChange = { viewModel.acceptConsent(it) },
                                colors = CheckboxDefaults.colors(checkedColor = DusscPrimary),
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.dussc_consent_accept), fontSize = 14.sp)
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.hideConsent()
                            state.selectedPersona?.let { onStartQuiz(it.code) }
                        },
                        enabled = state.consentAccepted,
                        colors = ButtonDefaults.buttonColors(containerColor = DusscPrimary),
                    ) {
                        Text(stringResource(R.string.dussc_start_quiz))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.hideConsent() }) {
                        Text(stringResource(R.string.dussc_back_home))
                    }
                },
            )
        }
    }

@Composable
private fun InfoChip(value: String, label: String) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Color.White.copy(alpha = 0.2f),
    ) {
        Row(modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(value, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(label, color = Color.White.copy(alpha = 0.9f), fontSize = 12.sp)
        }
    }
}
