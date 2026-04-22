package cm.onehealth.cohrm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import androidx.datastore.preferences.core.Preferences
import cm.onehealth.cohrm.ui.screens.settings.SettingsViewModel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cm.onehealth.cohrm.data.preferences.dataStore
import cm.onehealth.cohrm.ui.navigation.CohrmNavigation
import cm.onehealth.cohrm.ui.theme.CohrmTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Apply saved language preference on startup
        try {
            val prefs: Preferences = runBlocking { dataStore.data.first() }
            val savedLang = prefs[SettingsViewModel.LANGUAGE_KEY] ?: "fr"
            AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(savedLang))
        } catch (_: Exception) {}

        // Read saved theme preference
        val savedTheme = try {
            val prefs: Preferences = runBlocking { dataStore.data.first() }
            prefs[androidx.datastore.preferences.core.stringPreferencesKey("theme")] ?: "system"
        } catch (_: Exception) { "system" }

        setContent {
            val isDark = when (savedTheme) {
                "dark" -> true
                "light" -> false
                else -> androidx.compose.foundation.isSystemInDarkTheme()
            }
            CohrmTheme(darkTheme = isDark) {
                // Check for previous crash log
                var crashLog by remember { mutableStateOf(CohrmApp.getCrashLog(this@MainActivity)) }

                if (crashLog != null) {
                    CrashReportScreen(
                        crashLog = crashLog!!,
                        onDismiss = {
                            CohrmApp.clearCrashLog(this@MainActivity)
                            crashLog = null
                        },
                    )
                } else {
                    CohrmNavigation()
                }
            }
        }
    }
}

@Composable
private fun CrashReportScreen(
    crashLog: String,
    onDismiss: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1A1A2E))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
    ) {
        Spacer(modifier = Modifier.height(48.dp))

        Text(
            text = "CRASH REPORT",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFE74C3C),
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "L'application a rencontré une erreur. Voici le détail :",
            fontSize = 14.sp,
            color = Color.White.copy(alpha = 0.8f),
        )
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = crashLog,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            color = Color(0xFF00FF88),
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF0D0D1A))
                .padding(12.dp),
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onDismiss,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF27AE60)),
        ) {
            Text("Effacer et relancer l'application", color = Color.White)
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
