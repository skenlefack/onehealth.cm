package cm.onehealth.cohrm.data.remote

import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import okhttp3.Interceptor
import okhttp3.Response
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Provides auth tokens synchronously for OkHttp interceptors.
 *
 * Tokens are cached in memory with a fallback to SharedPreferences
 * (synchronous read -- safe for OkHttp threads, unlike DataStore which
 * requires coroutines and previously caused ANR via `runBlocking`).
 *
 * Token expiry is checked by decoding the JWT `exp` claim; expired
 * tokens are not sent, preventing 401 round-trips.
 */
@Singleton
class TokenProvider @Inject constructor(
    @ApplicationContext context: Context,
) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("cohrm_token_prefs", Context.MODE_PRIVATE)

    @Volatile
    private var cachedToken: String? = null

    @Volatile
    private var tokenExpiry: Long = 0L // epoch seconds

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_EXPIRY = "token_expiry"
        // Refresh 60 s before actual expiry to avoid edge-case failures
        private const val EXPIRY_BUFFER_SECONDS = 60L
    }

    /**
     * Returns the current valid token, or null if absent/expired.
     * This is safe to call from any thread (no coroutines).
     */
    fun getToken(): String? {
        val token = cachedToken ?: prefs.getString(KEY_TOKEN, null)
        if (token.isNullOrEmpty()) return null

        // Check expiry
        val expiry = if (tokenExpiry > 0) tokenExpiry else prefs.getLong(KEY_EXPIRY, 0L)
        if (expiry > 0 && System.currentTimeMillis() / 1000 >= expiry - EXPIRY_BUFFER_SECONDS) {
            // Token expired -- clear it
            clearToken()
            return null
        }

        // Populate in-memory cache if it was read from prefs
        if (cachedToken == null) {
            cachedToken = token
            tokenExpiry = expiry
        }
        return token
    }

    /**
     * Store a new token (called after login or token refresh).
     */
    fun updateToken(token: String?) {
        cachedToken = token
        tokenExpiry = token?.let { extractExpiry(it) } ?: 0L
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putLong(KEY_EXPIRY, tokenExpiry)
            .apply()
    }

    /**
     * Clear the cached token (called on logout).
     */
    fun clearToken() {
        cachedToken = null
        tokenExpiry = 0L
        prefs.edit().clear().apply()
    }

    /**
     * Decode the `exp` claim from a JWT token.
     * Returns epoch seconds, or 0 if decoding fails.
     */
    private fun extractExpiry(jwt: String): Long {
        return try {
            val parts = jwt.split(".")
            if (parts.size < 2) return 0L
            val payload = String(Base64.decode(parts[1], Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP))
            val json = JSONObject(payload)
            json.optLong("exp", 0L)
        } catch (_: Exception) {
            0L
        }
    }
}

@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenProvider: TokenProvider,
    private val dataStore: DataStore<Preferences>,
) : Interceptor {

    companion object {
        private val AUTH_TOKEN = stringPreferencesKey("auth_token")
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // Don't add token to login or public requests
        if (original.url.encodedPath.contains("mobile/login") ||
            original.url.encodedPath.contains("public/")
        ) {
            return chain.proceed(original)
        }

        val token = tokenProvider.getToken()

        val request = if (!token.isNullOrEmpty()) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            original
        }

        return chain.proceed(request)
    }

    /**
     * Update the in-memory cached token. Call this after login
     * or when the token is refreshed.
     */
    fun updateToken(token: String?) {
        tokenProvider.updateToken(token)
    }

    /**
     * Clear the cached token. Call this on logout.
     */
    fun clearToken() {
        tokenProvider.clearToken()
    }

    /**
     * Pre-load the token from DataStore into the TokenProvider.
     * Call this once at app startup (e.g., from SplashScreen).
     */
    suspend fun preloadToken() {
        try {
            val token = dataStore.data.first()[AUTH_TOKEN]
            if (!token.isNullOrEmpty()) {
                tokenProvider.updateToken(token)
            }
        } catch (_: Exception) {
            // Ignore -- token just won't be available until login
        }
    }
}
