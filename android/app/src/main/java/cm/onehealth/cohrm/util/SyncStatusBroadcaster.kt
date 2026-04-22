package cm.onehealth.cohrm.util

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

sealed class SyncEvent {
    object Idle : SyncEvent()
    data class Syncing(val current: Int, val total: Int) : SyncEvent()
    data class Completed(val synced: Int, val failed: Int) : SyncEvent()
    data class Failed(val error: String) : SyncEvent()
}

@Singleton
class SyncStatusBroadcaster @Inject constructor() {
    private val _syncStatus = MutableStateFlow<SyncEvent>(SyncEvent.Idle)
    val syncStatus: StateFlow<SyncEvent> = _syncStatus.asStateFlow()

    fun emitSyncing(current: Int, total: Int) {
        _syncStatus.value = SyncEvent.Syncing(current, total)
    }

    fun emitCompleted(synced: Int, failed: Int) {
        _syncStatus.value = SyncEvent.Completed(synced, failed)
    }

    fun emitFailed(error: String) {
        _syncStatus.value = SyncEvent.Failed(error)
    }

    fun reset() {
        _syncStatus.value = SyncEvent.Idle
    }
}
