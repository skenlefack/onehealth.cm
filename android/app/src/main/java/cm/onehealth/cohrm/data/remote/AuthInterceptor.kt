package cm.onehealth.cohrm.data.remote

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) : Interceptor {

    companion object {
        private val AUTH_TOKEN = stringPreferencesKey("auth_token")
    }

    @Volatile
    private var cachedToken: String? = null

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // Don't add token to login requests
        if (original.url.encodedPath.contains("mobile/login")) {
            return chain.proceed(original)
        }

        val token = cachedToken

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
        cachedToken = token
    }

    /**
     * Clear the cached token. Call this on logout.
     */
    fun clearToken() {
        cachedToken = null
    }

    /**
     * Pre-load the token from DataStore into the in-memory cache.
     * Call this once at app startup (e.g., from SplashScreen or Application.onCreate).
     */
    suspend fun preloadToken() {
        cachedToken = try {
            dataStore.data.first()[AUTH_TOKEN]
        } catch (e: Exception) {
            null
        }
    }
}
