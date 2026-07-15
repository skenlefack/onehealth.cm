package cm.onehealth.cohrm.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import cm.onehealth.cohrm.BuildConfig

object SmsHelper {

    /**
     * Formats an SMS message following the OneHealth protocol.
     * Format: OH#CAT#ESP#SYM1,SYM2#REGION#DESC
     */
    fun generateSms(
        category: String,
        species: String,
        symptoms: List<String>,
        region: String,
        description: String,
    ): String {
        val cat = category.take(3).uppercase()
        val esp = species.uppercase()
        val sym = symptoms.joinToString(",")
        val reg = region.take(3).uppercase()
        val desc = description.take(100)

        return "OH#$cat#$esp#$sym#$reg#$desc"
    }

    /**
     * Opens the native SMS app with a pre-filled message.
     */
    fun sendSms(context: Context, message: String) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("smsto:${BuildConfig.SMS_RECIPIENT}")
            putExtra("sms_body", message)
        }
        if (intent.resolveActivity(context.packageManager) != null) {
            context.startActivity(intent)
        }
    }
}
