package cm.onehealth.cohrm.data.remote

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * OkHttp interceptor that adds the JWT auth token to API requests.
 *
 * Uses a dedicated SharedPreferences for synchronous token access.
 * No DataStore, no coroutines, no runBlocking — fully synchronous and thread-safe.
 */
@Singleton
class AuthInterceptor @Inject constructor(
    @ApplicationContext context: Context,
) : Interceptor {

    companion object {
        private const val TAG = "AuthInterceptor"
        private const val PREFS_NAME = "cohrm_auth"
        private const val KEY_TOKEN = "jwt_token"
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    // In-memory cache for performance
    @Volatile
    private var cachedToken: String? = prefs.getString(KEY_TOKEN, null)

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // Only skip auth for the login endpoint
        val path = original.url.encodedPath
        if (path.endsWith("mobile/login")) {
            return chain.proceed(original)
        }

        val token = cachedToken ?: prefs.getString(KEY_TOKEN, null)

        if (token.isNullOrEmpty()) {
            Log.w(TAG, "No token for: ${original.method} $path")
            return chain.proceed(original)
        }

        val request = original.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()

        val response = chain.proceed(request)

        // If server says token expired, clear it so next requests don't reuse it
        if (response.code == 401) {
            Log.w(TAG, "Server returned 401 for $path — clearing cached token")
            clearToken()
        }

        return response
    }

    /**
     * Save and cache the token. Call after successful login.
     */
    fun updateToken(token: String?) {
        cachedToken = token
        prefs.edit().putString(KEY_TOKEN, token).apply()
        Log.d(TAG, "Token saved: ${if (token != null) "${token.take(20)}..." else "null"}")
    }

    /**
     * Clear the token. Call on logout.
     */
    fun clearToken() {
        cachedToken = null
        prefs.edit().remove(KEY_TOKEN).apply()
        Log.d(TAG, "Token cleared")
    }

    /**
     * Check if a token is available.
     */
    fun hasToken(): Boolean = !cachedToken.isNullOrEmpty() || !prefs.getString(KEY_TOKEN, null).isNullOrEmpty()
}
