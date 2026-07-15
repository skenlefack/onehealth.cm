package cm.onehealth.cohrm.ui.screens.splash

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import cm.onehealth.cohrm.ui.theme.LogoBlue
import cm.onehealth.cohrm.ui.theme.LogoGreen
import cm.onehealth.cohrm.ui.theme.LogoOrange
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToHome: () -> Unit,
    loginViewModel: LoginViewModel = hiltViewModel(),
) {
    var startAnimation by remember { mutableStateOf(false) }
    val alpha by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
        label = "splash_alpha",
    )

    LaunchedEffect(Unit) {
        startAnimation = true
        delay(2000)
        if (loginViewModel.isLoggedIn()) {
            onNavigateToHome()
        } else {
            onNavigateToLogin()
        }
    }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        // Bright gradient background matching login screen
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

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
            val auroraTop = Path().apply {
                moveTo(0f, h * 0.18f)
                cubicTo(w * 0.25f, h * 0.14f, w * 0.5f, h * 0.2f, w * 0.75f, h * 0.15f)
                cubicTo(w * 0.9f, h * 0.13f, w, h * 0.19f, w, h * 0.19f)
                lineTo(w, 0f)
                lineTo(0f, 0f)
                close()
            }
            drawPath(
                path = auroraTop,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFF7941D).copy(alpha = 0.35f),
                        Color(0xFFF7C948).copy(alpha = 0.15f),
                        Color.Transparent,
                    )
                )
            )

            // Aurora wave bottom
            val auroraBottom = Path().apply {
                moveTo(0f, h * 0.8f)
                cubicTo(w * 0.3f, h * 0.78f, w * 0.65f, h * 0.84f, w, h * 0.81f)
                lineTo(w, h)
                lineTo(0f, h)
                close()
            }
            drawPath(
                path = auroraBottom,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.Transparent,
                        Color(0xFF4BA3DB).copy(alpha = 0.2f),
                        Color(0xFF2980B9).copy(alpha = 0.3f),
                    )
                )
            )

            // Large orbs
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFFF7941D).copy(alpha = 0.6f),
                        Color(0xFFF7941D).copy(alpha = 0.3f),
                        Color(0xFFF7941D).copy(alpha = 0.08f),
                        Color.Transparent,
                    ),
                    center = Offset(w * 0.8f, h * 0.12f),
                    radius = w * 0.4f,
                ),
                radius = w * 0.4f,
                center = Offset(w * 0.8f, h * 0.12f),
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF6DB33F).copy(alpha = 0.55f),
                        Color(0xFF6DB33F).copy(alpha = 0.25f),
                        Color(0xFF6DB33F).copy(alpha = 0.06f),
                        Color.Transparent,
                    ),
                    center = Offset(w * 0.15f, h * 0.6f),
                    radius = w * 0.42f,
                ),
                radius = w * 0.42f,
                center = Offset(w * 0.15f, h * 0.6f),
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF4BA3DB).copy(alpha = 0.5f),
                        Color(0xFF4BA3DB).copy(alpha = 0.25f),
                        Color(0xFF4BA3DB).copy(alpha = 0.06f),
                        Color.Transparent,
                    ),
                    center = Offset(w * 0.65f, h * 0.85f),
                    radius = w * 0.4f,
                ),
                radius = w * 0.4f,
                center = Offset(w * 0.65f, h * 0.85f),
            )

            // Small accent orbs
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFFF7C948).copy(alpha = 0.3f), Color.Transparent),
                    center = Offset(w * 0.35f, h * 0.3f),
                    radius = w * 0.15f,
                ),
                radius = w * 0.15f,
                center = Offset(w * 0.35f, h * 0.3f),
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF2DD4BF).copy(alpha = 0.25f), Color.Transparent),
                    center = Offset(w * 0.9f, h * 0.4f),
                    radius = w * 0.12f,
                ),
                radius = w * 0.12f,
                center = Offset(w * 0.9f, h * 0.4f),
            )

            // Light overlay
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

        Column(
            modifier = Modifier.alpha(alpha),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            // Logo with glow
            Box(contentAlignment = Alignment.Center) {
                Box(
                    modifier = Modifier
                        .size(170.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(
                                    LogoOrange.copy(alpha = 0.25f),
                                    LogoGreen.copy(alpha = 0.12f),
                                    LogoBlue.copy(alpha = 0.08f),
                                    Color.Transparent,
                                ),
                            )
                        )
                )
                Image(
                    painter = painterResource(R.drawable.one_health_logo),
                    contentDescription = "One Health Logo",
                    modifier = Modifier
                        .size(140.dp)
                        .clip(CircleShape)
                        .shadow(16.dp, CircleShape),
                    contentScale = ContentScale.Crop,
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "COHRM",
                fontSize = 44.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                letterSpacing = 6.sp,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.home_subtitle),
                fontSize = 12.sp,
                color = Color.White.copy(alpha = 0.85f),
                letterSpacing = 0.5.sp,
                textAlign = TextAlign.Center,
                lineHeight = 16.sp,
            )
            Spacer(modifier = Modifier.height(32.dp))
            Text(
                text = stringResource(R.string.login_footer),
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White.copy(alpha = 0.6f),
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center,
            )
        }
    }
}
