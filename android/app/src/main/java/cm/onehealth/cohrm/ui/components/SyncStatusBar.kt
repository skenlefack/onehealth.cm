package cm.onehealth.cohrm.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class SyncState {
    SYNCED,
    PENDING,
    SYNCING,
    ERROR,
}

@Composable
fun SyncStatusBar(
    syncState: SyncState,
    pendingCount: Int = 0,
    onRetryClick: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    val isVisible = syncState != SyncState.SYNCED || pendingCount == 0

    AnimatedVisibility(
        visible = true,
        enter = expandVertically(),
        exit = shrinkVertically(),
        modifier = modifier,
    ) {
        val (bgColor, icon, message, clickable) = when (syncState) {
            SyncState.SYNCED -> SyncBarConfig(
                bgColor = Color(0xFF4CAF50),
                icon = Icons.Default.CheckCircle,
                message = "Toutes les donnees sont a jour",
                clickable = false,
            )
            SyncState.PENDING -> SyncBarConfig(
                bgColor = Color(0xFFF57C00),
                icon = Icons.Default.CloudUpload,
                message = if (pendingCount == 1) "1 rapport en attente de synchronisation"
                else "$pendingCount rapports en attente de synchronisation",
                clickable = true,
            )
            SyncState.SYNCING -> SyncBarConfig(
                bgColor = Color(0xFF2196F3),
                icon = Icons.Default.Sync,
                message = "Synchronisation en cours...",
                clickable = false,
            )
            SyncState.ERROR -> SyncBarConfig(
                bgColor = Color(0xFFF44336),
                icon = Icons.Default.CloudOff,
                message = "Echec de la synchronisation - appuyez pour reessayer",
                clickable = true,
            )
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(bgColor)
                .then(
                    if (clickable) Modifier.clickable { onRetryClick() }
                    else Modifier
                )
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (syncState == SyncState.SYNCING) {
                SyncingIcon()
            } else {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp),
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = message,
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun SyncingIcon() {
    val infiniteTransition = rememberInfiniteTransition(label = "sync_rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "sync_icon_rotation",
    )

    Icon(
        Icons.Default.Sync,
        contentDescription = null,
        tint = Color.White,
        modifier = Modifier
            .size(16.dp)
            .rotate(rotation),
    )
}

private data class SyncBarConfig(
    val bgColor: Color,
    val icon: ImageVector,
    val message: String,
    val clickable: Boolean,
)
