package cm.onehealth.cohrm.ui.screens.login

import android.widget.Toast
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Login
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.LogoBlue
import cm.onehealth.cohrm.ui.theme.LogoGreen
import cm.onehealth.cohrm.ui.theme.LogoOrange
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onPublicReport: () -> Unit = {},
    viewModel: LoginViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is LoginEvent.Success -> onLoginSuccess()
                is LoginEvent.Error -> {
                    Toast.makeText(context, event.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    // Animated background
    val infiniteTransition = rememberInfiniteTransition(label = "bg")
    val animPhase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(25000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "phase",
    )
    val pulsePhase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulse",
    )

    // Fade-in animation
    var visible by remember { mutableStateOf(false) }
    val contentAlpha by animateFloatAsState(
        targetValue = if (visible) 1f else 0f,
        animationSpec = tween(1000, easing = FastOutSlowInEasing),
        label = "fade",
    )
    LaunchedEffect(Unit) { visible = true }

    Box(modifier = Modifier.fillMaxSize()) {
        // Animated gradient background with mesh, orbs, and aurora
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawAnimatedBackground(animPhase, pulsePhase)
        }

        // Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
                .alpha(contentAlpha),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(modifier = Modifier.height(60.dp))

            // Logo with glow effect
            Box(contentAlignment = Alignment.Center) {
                // Outer glow ring
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(
                                    LogoOrange.copy(alpha = 0.3f),
                                    LogoGreen.copy(alpha = 0.15f),
                                    LogoBlue.copy(alpha = 0.1f),
                                    Color.Transparent,
                                ),
                            )
                        )
                )
                // Logo
                Image(
                    painter = painterResource(R.drawable.one_health_logo),
                    contentDescription = "One Health Logo",
                    modifier = Modifier
                        .size(120.dp)
                        .clip(CircleShape)
                        .shadow(16.dp, CircleShape),
                    contentScale = ContentScale.Crop,
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Title
            Text(
                text = "COHRM",
                fontSize = 38.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                letterSpacing = 6.sp,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = stringResource(R.string.home_subtitle),
                fontSize = 12.sp,
                color = Color.White.copy(alpha = 0.85f),
                textAlign = TextAlign.Center,
                letterSpacing = 0.5.sp,
                lineHeight = 16.sp,
            )

            Spacer(modifier = Modifier.height(40.dp))

            // Login card with glass morphism
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(32.dp, RoundedCornerShape(28.dp)),
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color.White.copy(alpha = 0.95f),
                ),
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        text = stringResource(R.string.login_title),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1A3A4A),
                    )
                    Text(
                        text = stringResource(R.string.login_subtitle),
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF636E72),
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    // Email / Login field
                    OutlinedTextField(
                        value = state.email,
                        onValueChange = { viewModel.updateEmail(it) },
                        label = { Text(stringResource(R.string.login_email)) },
                        placeholder = { Text(stringResource(R.string.login_email_hint)) },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = null,
                                tint = LogoBlue,
                            )
                        },
                        isError = state.emailError,
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LogoBlue,
                            cursorColor = LogoBlue,
                        ),
                    )
                    if (state.emailError) {
                        Text(
                            text = stringResource(R.string.required_field),
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(start = 16.dp, top = 4.dp),
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Password field
                    var passwordVisible by remember { mutableStateOf(false) }
                    OutlinedTextField(
                        value = state.password,
                        onValueChange = { viewModel.updatePassword(it) },
                        label = { Text(stringResource(R.string.login_password)) },
                        placeholder = { Text(stringResource(R.string.login_password_hint)) },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Lock,
                                contentDescription = null,
                                tint = LogoGreen,
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    if (passwordVisible) Icons.Default.VisibilityOff
                                    else Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = Color(0xFF636E72),
                                )
                            }
                        },
                        isError = state.passwordError,
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        visualTransformation = if (passwordVisible) VisualTransformation.None
                            else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LogoGreen,
                            cursorColor = LogoGreen,
                        ),
                    )
                    if (state.passwordError) {
                        Text(
                            text = stringResource(R.string.required_field),
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(start = 16.dp, top = 4.dp),
                        )
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    // Login button with gradient
                    Button(
                        onClick = { viewModel.login() },
                        enabled = !state.isLoading,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.Transparent,
                        ),
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.horizontalGradient(
                                        colors = listOf(
                                            LogoBlue,
                                            LogoGreen,
                                            LogoOrange,
                                        ),
                                    ),
                                    shape = RoundedCornerShape(16.dp),
                                ),
                            contentAlignment = Alignment.Center,
                        ) {
                            if (state.isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Color.White,
                                    strokeWidth = 2.dp,
                                )
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center,
                                ) {
                                    Icon(
                                        Icons.AutoMirrored.Filled.Login,
                                        contentDescription = null,
                                        tint = Color.White,
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = stringResource(R.string.login_button),
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White,
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Public report button (no auth required)
            OutlinedButton(
                onClick = onPublicReport,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color.White,
                ),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.5f)),
            ) {
                Text(
                    text = stringResource(R.string.public_report_login_button),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Footer
            Text(
                text = stringResource(R.string.login_footer),
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White.copy(alpha = 0.85f),
                textAlign = TextAlign.Center,
                letterSpacing = 1.5.sp,
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

/**
 * Draws an animated background with bright gradient, vivid floating orbs and aurora waves.
 */
private fun DrawScope.drawAnimatedBackground(phase: Float, pulse: Float) {
    val w = size.width
    val h = size.height
    val rad = Math.toRadians(phase.toDouble())

    // Light, vibrant base gradient
    drawRect(
        brush = Brush.verticalGradient(
            colors = listOf(
                Color(0xFF2980B9),
                Color(0xFF1B6FA0),
                Color(0xFF1A7A5A),
                Color(0xFF2C8B56),
            )
        )
    )

    // Warm diagonal overlay
    drawRect(
        brush = Brush.linearGradient(
            colors = listOf(
                Color(0xFFF7941D).copy(alpha = 0.25f),
                Color.Transparent,
                Color(0xFF4BA3DB).copy(alpha = 0.2f),
            ),
            start = Offset(w, 0f),
            end = Offset(0f, h),
        )
    )

    // Aurora wave top
    val auroraPath1 = Path().apply {
        moveTo(0f, h * 0.18f)
        val waveY1 = h * 0.16f + (h * 0.03f * sin(rad * 0.7)).toFloat()
        val waveY2 = h * 0.13f + (h * 0.04f * sin(rad * 0.5 + 1.0)).toFloat()
        val waveY3 = h * 0.19f + (h * 0.02f * sin(rad * 0.9 + 2.0)).toFloat()
        cubicTo(w * 0.25f, waveY1, w * 0.5f, waveY2, w * 0.75f, waveY3)
        cubicTo(w * 0.9f, h * 0.15f, w, h * 0.22f, w, h * 0.22f)
        lineTo(w, 0f)
        lineTo(0f, 0f)
        close()
    }
    drawPath(
        path = auroraPath1,
        brush = Brush.verticalGradient(
            colors = listOf(
                Color(0xFFF7941D).copy(alpha = 0.35f + pulse * 0.1f),
                Color(0xFFF7C948).copy(alpha = 0.15f),
                Color.Transparent,
            )
        )
    )

    // Aurora wave bottom
    val auroraPath2 = Path().apply {
        moveTo(0f, h * 0.8f)
        val bWaveY1 = h * 0.78f + (h * 0.025f * cos(rad * 0.6 + 1.5)).toFloat()
        val bWaveY2 = h * 0.83f + (h * 0.03f * sin(rad * 0.4 + 3.0)).toFloat()
        cubicTo(w * 0.3f, bWaveY1, w * 0.65f, bWaveY2, w, h * 0.81f)
        lineTo(w, h)
        lineTo(0f, h)
        close()
    }
    drawPath(
        path = auroraPath2,
        brush = Brush.verticalGradient(
            colors = listOf(
                Color.Transparent,
                Color(0xFF4BA3DB).copy(alpha = 0.2f),
                Color(0xFF2980B9).copy(alpha = 0.3f + pulse * 0.08f),
            )
        )
    )

    // Large floating orbs
    // Orange orb (top-right)
    val orangeX = w * 0.78f + (w * 0.08f * cos(rad)).toFloat()
    val orangeY = h * 0.1f + (h * 0.05f * sin(rad * 1.3)).toFloat()
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                Color(0xFFF7941D).copy(alpha = 0.6f + pulse * 0.1f),
                Color(0xFFF7941D).copy(alpha = 0.3f),
                Color(0xFFF7941D).copy(alpha = 0.08f),
                Color.Transparent,
            ),
            center = Offset(orangeX, orangeY),
            radius = w * 0.4f,
        ),
        radius = w * 0.4f,
        center = Offset(orangeX, orangeY),
    )

    // Green orb (left-center)
    val greenX = w * 0.18f + (w * 0.07f * cos(rad * 0.8 + 2.0)).toFloat()
    val greenY = h * 0.52f + (h * 0.06f * sin(rad * 1.1 + 1.0)).toFloat()
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                Color(0xFF6DB33F).copy(alpha = 0.55f + pulse * 0.1f),
                Color(0xFF6DB33F).copy(alpha = 0.25f),
                Color(0xFF6DB33F).copy(alpha = 0.06f),
                Color.Transparent,
            ),
            center = Offset(greenX, greenY),
            radius = w * 0.42f,
        ),
        radius = w * 0.42f,
        center = Offset(greenX, greenY),
    )

    // Blue orb (bottom-right)
    val blueX = w * 0.65f + (w * 0.06f * sin(rad * 0.6 + 4.0)).toFloat()
    val blueY = h * 0.82f + (h * 0.04f * cos(rad * 0.9 + 3.0)).toFloat()
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                Color(0xFF4BA3DB).copy(alpha = 0.5f + pulse * 0.08f),
                Color(0xFF4BA3DB).copy(alpha = 0.25f),
                Color(0xFF4BA3DB).copy(alpha = 0.06f),
                Color.Transparent,
            ),
            center = Offset(blueX, blueY),
            radius = w * 0.4f,
        ),
        radius = w * 0.4f,
        center = Offset(blueX, blueY),
    )

    // Secondary smaller orbs
    val smallRad = Math.toRadians((phase * 1.8).toDouble())

    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                Color(0xFFF7C948).copy(alpha = 0.3f),
                Color.Transparent,
            ),
            center = Offset(
                w * 0.35f + (w * 0.04f * sin(smallRad + 1.0)).toFloat(),
                h * 0.3f + (h * 0.03f * cos(smallRad)).toFloat(),
            ),
            radius = w * 0.15f,
        ),
        radius = w * 0.15f,
        center = Offset(
            w * 0.35f + (w * 0.04f * sin(smallRad + 1.0)).toFloat(),
            h * 0.3f + (h * 0.03f * cos(smallRad)).toFloat(),
        ),
    )

    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                Color(0xFF2DD4BF).copy(alpha = 0.25f),
                Color.Transparent,
            ),
            center = Offset(
                w * 0.85f + (w * 0.03f * cos(smallRad + 2.5)).toFloat(),
                h * 0.42f + (h * 0.04f * sin(smallRad + 1.5)).toFloat(),
            ),
            radius = w * 0.12f,
        ),
        radius = w * 0.12f,
        center = Offset(
            w * 0.85f + (w * 0.03f * cos(smallRad + 2.5)).toFloat(),
            h * 0.42f + (h * 0.04f * sin(smallRad + 1.5)).toFloat(),
        ),
    )

    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                Color.White.copy(alpha = 0.15f),
                Color.Transparent,
            ),
            center = Offset(
                w * 0.5f + (w * 0.05f * sin(smallRad * 0.7 + 3.0)).toFloat(),
                h * 0.68f + (h * 0.02f * cos(smallRad * 0.5)).toFloat(),
            ),
            radius = w * 0.1f,
        ),
        radius = w * 0.1f,
        center = Offset(
            w * 0.5f + (w * 0.05f * sin(smallRad * 0.7 + 3.0)).toFloat(),
            h * 0.68f + (h * 0.02f * cos(smallRad * 0.5)).toFloat(),
        ),
    )

    // Soft light overlay for brightness
    drawRect(
        brush = Brush.radialGradient(
            colors = listOf(
                Color.White.copy(alpha = 0.08f),
                Color.Transparent,
            ),
            center = Offset(w * 0.5f, h * 0.35f),
            radius = w * 0.8f,
        )
    )
}
