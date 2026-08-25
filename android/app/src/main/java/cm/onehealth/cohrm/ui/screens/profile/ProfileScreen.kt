package cm.onehealth.cohrm.ui.screens.profile

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onBack: () -> Unit = {},
    onLogout: () -> Unit = {},
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showLogoutDialog by remember { mutableStateOf(false) }
    var showPasswordSection by remember { mutableStateOf(false) }

    // Photo picker
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent(),
    ) { uri: Uri? ->
        uri?.let { viewModel.updateAvatar(it.toString()) }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            icon = { Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, tint = Danger) },
            title = { Text(stringResource(R.string.profile_logout_title)) },
            text = { Text(stringResource(R.string.profile_logout_confirm)) },
            confirmButton = {
                Button(
                    onClick = { showLogoutDialog = false; onLogout() },
                    colors = ButtonDefaults.buttonColors(containerColor = Danger),
                ) { Text(stringResource(R.string.menu_logout)) }
            },
            dismissButton = {
                OutlinedButton(onClick = { showLogoutDialog = false }) { Text(stringResource(R.string.cancel)) }
            },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.profile_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1A7A5A),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                ),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState()),
        ) {
            // Profile header with gradient
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(Color(0xFF1A7A5A), Color(0xFF2C8B56))))
                    .padding(vertical = 32.dp),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    // Avatar with camera overlay
                    Box(contentAlignment = Alignment.BottomEnd) {
                        val initials = state.name
                            .split(" ")
                            .mapNotNull { it.firstOrNull()?.uppercaseChar() }
                            .take(2)
                            .joinToString("")
                            .ifEmpty { "?" }

                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .border(3.dp, Color.White, CircleShape)
                                .clickable { photoPickerLauncher.launch("image/*") },
                            contentAlignment = Alignment.Center,
                        ) {
                            if (!state.avatar.isNullOrBlank()) {
                                AsyncImage(
                                    model = state.avatar,
                                    contentDescription = null,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop,
                                )
                            } else {
                                Box(
                                    modifier = Modifier.fillMaxSize().background(Color.White.copy(alpha = 0.2f)),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(initials, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 36.sp)
                                }
                            }
                        }

                        // Camera icon overlay
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(2.dp, Color(0xFF1A7A5A), CircleShape),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(Icons.Default.CameraAlt, contentDescription = null, tint = Color(0xFF1A7A5A), modifier = Modifier.size(18.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(state.name.ifBlank { "Utilisateur" }, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    if (state.role.isNotEmpty()) {
                        Surface(shape = RoundedCornerShape(12.dp), color = Color.White.copy(alpha = 0.2f), modifier = Modifier.padding(top = 6.dp)) {
                            Text(state.role, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp))
                        }
                    }
                    if (state.email.isNotBlank()) {
                        Text(state.email, color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }

            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Info cards
                Text(stringResource(R.string.profile_personal_info), fontWeight = FontWeight.Bold, fontSize = 16.sp)

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        ProfileField(icon = Icons.Default.Person, label = stringResource(R.string.profile_name), value = state.name, onValueChange = { viewModel.updateName(it) })
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f))
                        ProfileField(icon = Icons.Default.Email, label = stringResource(R.string.profile_email), value = state.email, onValueChange = { viewModel.updateEmail(it) })
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f))
                        ProfileField(icon = Icons.Default.Phone, label = stringResource(R.string.profile_phone), value = state.phone, onValueChange = { viewModel.updatePhone(it) })
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f))
                        ProfileField(icon = Icons.Default.Business, label = stringResource(R.string.profile_organization), value = state.organization, onValueChange = { viewModel.updateOrganization(it) })
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f))
                        ProfileField(icon = Icons.Default.LocationOn, label = stringResource(R.string.profile_region), value = state.region, onValueChange = { viewModel.updateRegion(it) })
                    }
                }

                Button(
                    onClick = { viewModel.saveProfile() },
                    enabled = !state.isSaving,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A7A5A)),
                ) {
                    if (state.isSaving) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                    else { Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp)); Spacer(modifier = Modifier.width(8.dp)); Text(stringResource(R.string.profile_save), fontWeight = FontWeight.Bold) }
                }

                state.saveMessage?.let { msg ->
                    val isSuccess = msg == "saved"
                    Surface(shape = RoundedCornerShape(8.dp), color = (if (isSuccess) Success else Danger).copy(alpha = 0.1f)) {
                        Row(modifier = Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(if (isSuccess) Icons.Default.CheckCircle else Icons.Default.Error, contentDescription = null, tint = if (isSuccess) Success else Danger, modifier = Modifier.size(18.dp))
                            Text(if (isSuccess) stringResource(R.string.profile_saved) else stringResource(R.string.error), color = if (isSuccess) Success else Danger, fontSize = 13.sp)
                        }
                    }
                }

                // Password section
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { showPasswordSection = !showPasswordSection },
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF1A7A5A))
                                Text(stringResource(R.string.profile_change_password), fontWeight = FontWeight.SemiBold)
                            }
                            Icon(if (showPasswordSection) Icons.Default.ExpandLess else Icons.Default.ExpandMore, contentDescription = null, tint = Muted)
                        }

                        if (showPasswordSection) {
                            Spacer(modifier = Modifier.height(16.dp))
                            OutlinedTextField(value = state.currentPassword, onValueChange = { viewModel.updateCurrentPassword(it) }, label = { Text(stringResource(R.string.profile_current_password)) }, modifier = Modifier.fillMaxWidth(), singleLine = true, shape = RoundedCornerShape(12.dp), visualTransformation = PasswordVisualTransformation())
                            Spacer(modifier = Modifier.height(10.dp))
                            OutlinedTextField(value = state.newPassword, onValueChange = { viewModel.updateNewPassword(it) }, label = { Text(stringResource(R.string.profile_new_password)) }, modifier = Modifier.fillMaxWidth(), singleLine = true, shape = RoundedCornerShape(12.dp), visualTransformation = PasswordVisualTransformation())
                            Spacer(modifier = Modifier.height(10.dp))
                            OutlinedTextField(value = state.confirmPassword, onValueChange = { viewModel.updateConfirmPassword(it) }, label = { Text(stringResource(R.string.profile_confirm_password)) }, modifier = Modifier.fillMaxWidth(), singleLine = true, shape = RoundedCornerShape(12.dp), visualTransformation = PasswordVisualTransformation())
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(onClick = { viewModel.changePassword() }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A7A5A))) {
                                Text(stringResource(R.string.profile_change_password))
                            }
                            state.passwordMessage?.let { msg ->
                                Spacer(modifier = Modifier.height(8.dp))
                                val text = when (msg) { "changed" -> stringResource(R.string.profile_password_changed); "mismatch" -> stringResource(R.string.profile_password_mismatch); else -> msg }
                                val color = if (msg == "changed") Success else Danger
                                Text(text = text, color = color, fontSize = 12.sp)
                            }
                        }
                    }
                }

                // Logout button
                OutlinedButton(
                    onClick = { showLogoutDialog = true },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Danger),
                ) {
                    Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, tint = Danger, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.menu_logout), color = Danger, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun ProfileField(icon: ImageVector, label: String, value: String, onValueChange: (String) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(
            modifier = Modifier.size(40.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFF1A7A5A).copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = Color(0xFF1A7A5A), modifier = Modifier.size(20.dp))
        }
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            label = { Text(label, fontSize = 12.sp) },
            modifier = Modifier.weight(1f),
            singleLine = true,
            shape = RoundedCornerShape(10.dp),
            textStyle = LocalTextStyle.current.copy(fontSize = 14.sp),
        )
    }
}
