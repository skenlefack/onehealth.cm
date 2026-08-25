package cm.onehealth.cohrm.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ModuleCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    primaryColor: Color,
    secondaryColor: Color,
    stat1Label: String = "",
    stat1Value: String = "",
    stat2Label: String = "",
    stat2Value: String = "",
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        colors = CardDefaults.cardColors(containerColor = primaryColor),
    ) {
        Box {
            Canvas(modifier = Modifier.matchParentSize()) {
                drawCircle(color = Color.White.copy(alpha = 0.07f), radius = size.width * 0.22f, center = Offset(size.width * 0.93f, size.height * 0.3f))
            }

            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier.size(44.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(title, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(subtitle, color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                if (stat1Label.isNotEmpty()) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(stat1Value, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
                        Text(stat1Label, color = Color.White.copy(alpha = 0.7f), fontSize = 9.sp)
                    }
                }
                if (stat2Label.isNotEmpty()) {
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(stat2Value, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
                        Text(stat2Label, color = Color.White.copy(alpha = 0.7f), fontSize = 9.sp)
                    }
                }
                Spacer(modifier = Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = Color.White.copy(alpha = 0.6f), modifier = Modifier.size(18.dp))
            }
        }
    }
}
