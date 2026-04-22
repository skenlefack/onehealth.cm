package cm.onehealth.cohrm.util

import okhttp3.MediaType
import okhttp3.RequestBody
import okio.BufferedSink
import okio.buffer
import okio.sink
import java.io.IOException

class ProgressRequestBody(
    private val delegate: RequestBody,
    private val onProgress: (fraction: Float) -> Unit,
) : RequestBody() {

    override fun contentType(): MediaType? = delegate.contentType()

    override fun contentLength(): Long = delegate.contentLength()

    @Throws(IOException::class)
    override fun writeTo(sink: BufferedSink) {
        val totalBytes = contentLength()
        if (totalBytes <= 0L) {
            delegate.writeTo(sink)
            return
        }

        val countingSink = CountingSink(sink, totalBytes, onProgress)
        val buffered = countingSink.sink().buffer()
        delegate.writeTo(buffered)
        buffered.flush()
    }

    private class CountingSink(
        private val delegate: BufferedSink,
        private val totalBytes: Long,
        private val onProgress: (Float) -> Unit,
    ) : okio.ForwardingSink(delegate) {
        private var bytesWritten = 0L

        override fun write(source: okio.Buffer, byteCount: Long) {
            super.write(source, byteCount)
            bytesWritten += byteCount
            onProgress(bytesWritten.toFloat() / totalBytes.toFloat())
        }
    }
}
