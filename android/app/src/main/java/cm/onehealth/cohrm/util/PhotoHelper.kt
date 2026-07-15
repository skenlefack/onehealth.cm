package cm.onehealth.cohrm.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PhotoHelper @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    companion object {
        private const val MAX_DIMENSION = 1024
        private const val JPEG_QUALITY = 80
    }

    fun compressAndSave(uri: Uri): String? {
        return try {
            val inputStream = context.contentResolver.openInputStream(uri) ?: return null
            val original = BitmapFactory.decodeStream(inputStream)
            inputStream.close()

            val compressed = resizeBitmap(original)
            val file = createTempFile()

            FileOutputStream(file).use { out ->
                compressed.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, out)
            }

            if (compressed !== original) compressed.recycle()
            original.recycle()

            file.absolutePath
        } catch (_: Exception) {
            null
        }
    }

    fun createTempFile(): File {
        val dir = File(context.filesDir, "photos")
        if (!dir.exists()) dir.mkdirs()
        return File(dir, "${UUID.randomUUID()}.jpg")
    }

    fun deletePhoto(path: String) {
        try {
            File(path).delete()
        } catch (_: Exception) {
            // Ignore
        }
    }

    fun getFileSize(path: String): Long {
        return try {
            File(path).length()
        } catch (_: Exception) {
            0L
        }
    }

    private fun resizeBitmap(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height

        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) return bitmap

        val ratio = width.toFloat() / height.toFloat()
        val newWidth: Int
        val newHeight: Int

        if (width > height) {
            newWidth = MAX_DIMENSION
            newHeight = (MAX_DIMENSION / ratio).toInt()
        } else {
            newHeight = MAX_DIMENSION
            newWidth = (MAX_DIMENSION * ratio).toInt()
        }

        return Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
    }
}
