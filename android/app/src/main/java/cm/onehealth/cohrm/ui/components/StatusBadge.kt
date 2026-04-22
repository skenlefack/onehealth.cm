package cm.onehealth.cohrm.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Warning

@Composable
fun StatusBadge(
    status: SyncStatus,
    modifier: Modifier = Modifier,
) {
    val (backgroundColor, textRes) = when (status) {
        SyncStatus.DRAFT -> Muted to R.string.sync_draft
        SyncStatus.PENDING -> Warning to R.string.sync_pending
        SyncStatus.SYNCING -> Info to R.string.sync_syncing
        SyncStatus.SYNCED -> Accent to R.string.sync_synced
        SyncStatus.ERROR -> Danger to R.string.sync_error
        SyncStatus.CONFLICT -> Warning to R.string.sync_error
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(backgroundColor.copy(alpha = 0.15f))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text = stringResource(textRes),
            color = backgroundColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
        )
    }
}
