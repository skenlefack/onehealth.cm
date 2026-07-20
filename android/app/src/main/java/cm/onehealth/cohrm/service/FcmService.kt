package cm.onehealth.cohrm.service

import android.app.PendingIntent
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import cm.onehealth.cohrm.CohrmApp
import cm.onehealth.cohrm.MainActivity
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.DeviceRegistrationRequest
import cm.onehealth.cohrm.di.dataStore
import cm.onehealth.cohrm.util.DeviceHelper
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class FcmService : FirebaseMessagingService() {

    @Inject lateinit var apiService: ApiService
    @Inject lateinit var deviceHelper: DeviceHelper

    companion object {
        private const val TAG = "FcmService"
        val FCM_TOKEN_KEY = stringPreferencesKey("fcm_token")
        private var notificationId = 1000
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "FCM token refreshed")

        CoroutineScope(Dispatchers.IO).launch {
            // Save token to DataStore
            try {
                applicationContext.dataStore.edit { prefs ->
                    prefs[FCM_TOKEN_KEY] = token
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to save FCM token to DataStore", e)
            }

            // Register token with backend
            try {
                apiService.registerDevice(
                    DeviceRegistrationRequest(
                        fcmToken = token,
                        deviceId = deviceHelper.getDeviceId(),
                    )
                )
                Log.d(TAG, "FCM token registered with backend")
            } catch (e: Exception) {
                // Best-effort: if user is not logged in, the auth interceptor
                // won't have a token and this will fail with 401. That's fine --
                // the token will be registered again after the next login.
                Log.w(TAG, "Failed to register FCM token with backend (user may not be logged in)", e)
            }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        val title = message.notification?.title
            ?: message.data["title"]
            ?: getString(R.string.app_name)
        val body = message.notification?.body
            ?: message.data["body"]
            ?: return
        val type = message.data["type"] ?: "general"
        val rumorId = message.data["rumor_id"]

        showNotification(title, body, type, rumorId)
    }

    private fun showNotification(title: String, body: String, type: String, rumorId: String? = null) {
        try {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                putExtra("notification_type", type)
                if (rumorId != null) {
                    putExtra("rumor_id", rumorId)
                }
            }

            val pendingIntent = PendingIntent.getActivity(
                this,
                notificationId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

            // Choose notification style based on type
            val (icon, channelId) = when (type) {
                "new_rumor", "escalation", "validation", "risk_assessment" ->
                    R.drawable.ic_launcher_foreground to CohrmApp.PUSH_CHANNEL_ID
                "scan_completed" ->
                    R.drawable.ic_launcher_foreground to CohrmApp.SCAN_CHANNEL_ID
                else ->
                    R.drawable.ic_launcher_foreground to CohrmApp.PUSH_CHANNEL_ID
            }

            val notification = NotificationCompat.Builder(this, channelId)
                .setSmallIcon(icon)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .build()

            NotificationManagerCompat.from(this).notify(notificationId++, notification)
        } catch (_: SecurityException) {
            // POST_NOTIFICATIONS permission not granted
        }
    }
}
