package cm.onehealth.cohrm.ui.screens.login

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.AuthInterceptor
import cm.onehealth.cohrm.data.remote.dto.DeviceRegistrationRequest
import cm.onehealth.cohrm.data.remote.dto.LoginRequest
import cm.onehealth.cohrm.util.DeviceHelper
import com.google.firebase.messaging.FirebaseMessaging
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val emailError: Boolean = false,
    val passwordError: Boolean = false,
)

sealed interface LoginEvent {
    data object Success : LoginEvent
    data class Error(val message: String) : LoginEvent
}

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val dataStore: DataStore<Preferences>,
    private val apiService: ApiService,
    private val authInterceptor: AuthInterceptor,
    private val deviceHelper: DeviceHelper,
) : ViewModel() {

    companion object {
        val IS_LOGGED_IN = booleanPreferencesKey("is_logged_in")
        val AUTH_TOKEN = stringPreferencesKey("auth_token")
        val USER_ID = intPreferencesKey("user_id")
        val USER_NAME = stringPreferencesKey("user_name")
        val USER_EMAIL = stringPreferencesKey("user_email")
        val USER_ROLE = stringPreferencesKey("user_role")
        val USER_AVATAR = stringPreferencesKey("user_avatar")
        val ACTOR_LEVEL = intPreferencesKey("actor_level")
        val ACTOR_LEVEL_LABEL = stringPreferencesKey("actor_level_label")
        val ACTOR_TYPE = stringPreferencesKey("actor_type")
        val ACTOR_REGION = stringPreferencesKey("actor_region")
        val ACTOR_DEPARTMENT = stringPreferencesKey("actor_department")
        val ACTOR_ORGANIZATION = stringPreferencesKey("actor_organization")
    }

    private val _state = MutableStateFlow(LoginState())
    val state: StateFlow<LoginState> = _state.asStateFlow()

    private val _events = MutableSharedFlow<LoginEvent>()
    val events: SharedFlow<LoginEvent> = _events.asSharedFlow()

    fun updateEmail(value: String) = _state.update { it.copy(email = value, emailError = false) }
    fun updatePassword(value: String) = _state.update { it.copy(password = value, passwordError = false) }

    fun login() {
        val s = _state.value
        var hasError = false

        if (s.email.isBlank()) {
            _state.update { it.copy(emailError = true) }
            hasError = true
        }
        if (s.password.isBlank()) {
            _state.update { it.copy(passwordError = true) }
            hasError = true
        }
        if (hasError) return

        _state.update { it.copy(isLoading = true) }

        viewModelScope.launch {
            try {
                val response = apiService.login(LoginRequest(email = s.email, password = s.password))

                if (response.success && response.data != null) {
                    val data = response.data
                    val user = data.user
                    val actor = data.actor

                    // Update in-memory token cache immediately (non-blocking)
                    android.util.Log.d("LoginVM", "LOGIN OK - token received: ${data.token?.take(30)}... (len=${data.token?.length})")
                    authInterceptor.updateToken(data.token)
                    android.util.Log.d("LoginVM", "Token saved to interceptor, hasToken=${authInterceptor.hasToken()}")

                    try {
                        dataStore.edit { prefs ->
                            prefs[IS_LOGGED_IN] = true
                            prefs[AUTH_TOKEN] = data.token ?: ""
                            prefs[USER_ID] = user?.id ?: 0
                            prefs[USER_NAME] = user?.name ?: ""
                            prefs[USER_EMAIL] = user?.email ?: ""
                            prefs[USER_ROLE] = user?.role ?: ""
                            prefs[USER_AVATAR] = user?.avatar ?: ""
                            prefs[ACTOR_LEVEL] = actor?.level ?: 0
                            prefs[ACTOR_LEVEL_LABEL] = actor?.levelLabel ?: ""
                            prefs[ACTOR_TYPE] = actor?.type ?: ""
                            prefs[ACTOR_REGION] = actor?.region ?: ""
                            prefs[ACTOR_DEPARTMENT] = actor?.department ?: ""
                            prefs[ACTOR_ORGANIZATION] = actor?.organization ?: ""
                        }
                    } catch (e: Exception) {
                        // DataStore write failed, still allow login
                        android.util.Log.e("LoginVM", "DataStore write failed", e)
                    }
                    // Register FCM token with backend
                    registerFcmToken()

                    _events.emit(LoginEvent.Success)
                } else {
                    _events.emit(LoginEvent.Error(response.message ?: "Identifiants incorrects"))
                }
            } catch (e: retrofit2.HttpException) {
                val msg = when (e.code()) {
                    401 -> "Identifiants incorrects"
                    403 -> "Accès non autorisé. Contactez votre administrateur."
                    else -> "Erreur serveur (${e.code()})"
                }
                _events.emit(LoginEvent.Error(msg))
            } catch (e: java.net.ConnectException) {
                _events.emit(LoginEvent.Error("Impossible de joindre le serveur"))
            } catch (e: java.net.UnknownHostException) {
                _events.emit(LoginEvent.Error("Serveur introuvable. Vérifiez votre connexion internet."))
            } catch (e: java.net.SocketTimeoutException) {
                _events.emit(LoginEvent.Error("Le serveur ne répond pas"))
            } catch (e: javax.net.ssl.SSLException) {
                _events.emit(LoginEvent.Error("Erreur de sécurité SSL"))
            } catch (e: java.io.IOException) {
                _events.emit(LoginEvent.Error("Erreur réseau: ${e.localizedMessage}"))
            } catch (e: Exception) {
                android.util.Log.e("LoginVM", "Login error", e)
                _events.emit(LoginEvent.Error("Erreur inattendue: ${e.localizedMessage}"))
            } finally {
                _state.update { it.copy(isLoading = false) }
            }
        }
    }

    private fun registerFcmToken() {
        try {
            FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
                viewModelScope.launch {
                    try {
                        apiService.registerDevice(
                            DeviceRegistrationRequest(
                                fcmToken = token,
                                deviceId = deviceHelper.getDeviceId(),
                            )
                        )
                    } catch (_: Exception) {
                        // FCM registration is best-effort
                    }
                }
            }
        } catch (_: Exception) {
            // Firebase not configured yet
        }
    }

    suspend fun isLoggedIn(): Boolean {
        val prefs = dataStore.data.first()
        val token = prefs[AUTH_TOKEN]

        if (token.isNullOrEmpty() || prefs[IS_LOGGED_IN] != true) return false

        // Check if JWT token is expired by decoding the payload
        if (isTokenExpired(token)) {
            android.util.Log.w("LoginVM", "Token expired, clearing session")
            authInterceptor.clearToken()
            dataStore.edit { it.clear() }
            return false
        }

        // Pre-warm the interceptor's in-memory cache
        authInterceptor.updateToken(token)
        return true
    }

    private fun isTokenExpired(jwt: String): Boolean {
        return try {
            val parts = jwt.split(".")
            if (parts.size < 2) return true
            val payload = String(android.util.Base64.decode(parts[1], android.util.Base64.URL_SAFE or android.util.Base64.NO_PADDING or android.util.Base64.NO_WRAP))
            val exp = org.json.JSONObject(payload).optLong("exp", 0L)
            if (exp == 0L) return false
            System.currentTimeMillis() / 1000 >= exp
        } catch (_: Exception) {
            false
        }
    }
}
