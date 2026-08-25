package cm.onehealth.cohrm.ui.screens.cohrm

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ActorInfo
import cm.onehealth.cohrm.ui.theme.Accent
import cm.onehealth.cohrm.ui.theme.Danger
import cm.onehealth.cohrm.ui.theme.Info
import cm.onehealth.cohrm.ui.theme.Muted
import cm.onehealth.cohrm.ui.theme.Primary
import cm.onehealth.cohrm.ui.theme.Success
import cm.onehealth.cohrm.ui.theme.Warning
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// --- ViewModel ---

data class ActorsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val actors: List<ActorInfo> = emptyList(),
    val searchQuery: String = "",
    val filterLevel: Int? = null,
)

@HiltViewModel
class ActorsViewModel @Inject constructor(
    private val apiService: ApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(ActorsUiState())
    val state: StateFlow<ActorsUiState> = _state.asStateFlow()

    init {
        loadActors()
    }

    fun loadActors() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val response = apiService.getActors(level = _state.value.filterLevel)
                _state.update {
                    it.copy(isLoading = false, actors = response.data)
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(isLoading = false, error = e.localizedMessage)
                }
            }
        }
    }

    fun setSearch(query: String) {
        _state.update { it.copy(searchQuery = query) }
    }

    fun setLevelFilter(level: Int?) {
        _state.update { it.copy(filterLevel = level) }
        loadActors()
    }

    fun filteredActors(): List<ActorInfo> {
        val s = _state.value
        return s.actors.filter { actor ->
            val matchSearch = s.searchQuery.isBlank() ||
                actor.name.contains(s.searchQuery, ignoreCase = true) ||
                actor.organization.contains(s.searchQuery, ignoreCase = true) ||
                actor.region.contains(s.searchQuery, ignoreCase = true)
            matchSearch
        }
    }
}

// --- Screen ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActorsScreen(
    onBack: () -> Unit = {},
    viewModel: ActorsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showSearch by remember { mutableStateOf(false) }
    var selectedActor by remember { mutableStateOf<ActorInfo?>(null) }

    val filteredActors = remember(state.actors, state.searchQuery) {
        viewModel.filteredActors()
    }

    selectedActor?.let { actor ->
        ActorDetailDialog(actor = actor, onDismiss = { selectedActor = null })
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("${stringResource(R.string.actors_title)} (${filteredActors.size})") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                },
                actions = {
                    IconButton(onClick = { showSearch = !showSearch }) {
                        Icon(Icons.Default.Search, contentDescription = null)
                    }
                },
            )
        },
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // Search
            if (showSearch) {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { viewModel.setSearch(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    placeholder = { Text(stringResource(R.string.rumors_search)) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                )
            }

            // Level filter chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = state.filterLevel == null,
                    onClick = { viewModel.setLevelFilter(null) },
                    label = { Text(stringResource(R.string.status_all)) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Primary.copy(alpha = 0.15f),
                    ),
                )
                (1..5).forEach { level ->
                    FilterChip(
                        selected = state.filterLevel == level,
                        onClick = { viewModel.setLevelFilter(level) },
                        label = { Text(stringResource(R.string.actors_level, level)) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = levelColor(level).copy(alpha = 0.15f),
                        ),
                    )
                }
            }

            // Content
            if (state.isLoading && state.actors.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (filteredActors.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = stringResource(R.string.actors_no_results),
                        style = MaterialTheme.typography.titleMedium,
                        color = Muted,
                    )
                }
            } else {
                PullToRefreshBox(
                    isRefreshing = state.isLoading,
                    onRefresh = { viewModel.loadActors() },
                ) {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(filteredActors, key = { it.id }) { actor ->
                            ActorCard(
                                actor = actor,
                                onClick = { selectedActor = actor },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ActorCard(actor: ActorInfo, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(levelColor(actor.level).copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = actor.name.take(2).uppercase(),
                    fontWeight = FontWeight.Bold,
                    color = levelColor(actor.level),
                    fontSize = 16.sp,
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = actor.name,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                    )
                    LevelBadge(actor.level, actor.levelLabel)
                }
                Spacer(modifier = Modifier.height(2.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (actor.region.isNotBlank()) {
                        Text(
                            text = actor.region,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    if (actor.type.isNotBlank()) {
                        Text(
                            text = actor.type,
                            style = MaterialTheme.typography.labelSmall,
                            color = Info,
                        )
                    }
                }
                if (actor.organization.isNotBlank()) {
                    Text(
                        text = actor.organization,
                        style = MaterialTheme.typography.labelSmall,
                        color = Muted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
    }
}

@Composable
private fun LevelBadge(level: Int, label: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(levelColor(level).copy(alpha = 0.15f))
            .padding(horizontal = 8.dp, vertical = 3.dp),
    ) {
        Text(
            text = if (label.isNotBlank()) label else "N$level",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = levelColor(level),
        )
    }
}

@Composable
private fun ActorDetailDialog(actor: ActorInfo, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Person, contentDescription = null, tint = Primary, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(actor.name)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                LevelBadge(actor.level, actor.levelLabel)
                Spacer(modifier = Modifier.height(4.dp))
                DetailRow("Type", actor.type)
                DetailRow("Region", actor.region)
                DetailRow("Departement", actor.department)
                actor.district?.let { DetailRow("District", it) }
                DetailRow("Organisation", actor.organization)
                if (actor.email.isNotBlank()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(16.dp), tint = Info)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(actor.email, style = MaterialTheme.typography.bodySmall, color = Info)
                    }
                }
                if (actor.phone.isNotBlank()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp), tint = Success)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(actor.phone, style = MaterialTheme.typography.bodySmall, color = Success)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.close)) }
        },
    )
}

@Composable
private fun DetailRow(label: String, value: String) {
    if (value.isBlank()) return
    Row {
        Text(
            text = "$label: ",
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.SemiBold,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

private fun levelColor(level: Int): Color = when (level) {
    1 -> Success
    2 -> Info
    3 -> Accent
    4 -> Warning
    5 -> Danger
    else -> Muted
}
