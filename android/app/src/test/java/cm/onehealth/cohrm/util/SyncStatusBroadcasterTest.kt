package cm.onehealth.cohrm.util

import cm.onehealth.cohrm.MainDispatcherRule
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class SyncStatusBroadcasterTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val broadcaster = SyncStatusBroadcaster()

    @Test
    fun `initial state is Idle`() = runTest {
        assertTrue(broadcaster.syncStatus.value is SyncEvent.Idle)
    }

    @Test
    fun `emitSyncing updates state`() = runTest {
        broadcaster.emitSyncing(2, 5)
        val state = broadcaster.syncStatus.value
        assertTrue(state is SyncEvent.Syncing)
        assertEquals(2, (state as SyncEvent.Syncing).current)
        assertEquals(5, state.total)
    }

    @Test
    fun `emitCompleted updates state`() = runTest {
        broadcaster.emitCompleted(synced = 4, failed = 1)
        val state = broadcaster.syncStatus.value
        assertTrue(state is SyncEvent.Completed)
        assertEquals(4, (state as SyncEvent.Completed).synced)
        assertEquals(1, state.failed)
    }

    @Test
    fun `emitFailed updates state`() = runTest {
        broadcaster.emitFailed("Network error")
        val state = broadcaster.syncStatus.value
        assertTrue(state is SyncEvent.Failed)
        assertEquals("Network error", (state as SyncEvent.Failed).error)
    }

    @Test
    fun `reset returns to Idle`() = runTest {
        broadcaster.emitSyncing(1, 3)
        broadcaster.reset()
        assertTrue(broadcaster.syncStatus.value is SyncEvent.Idle)
    }

    @Test
    fun `state transitions work correctly`() = runTest {
        // Idle -> Syncing -> Completed -> Idle
        assertTrue(broadcaster.syncStatus.value is SyncEvent.Idle)

        broadcaster.emitSyncing(0, 3)
        assertTrue(broadcaster.syncStatus.value is SyncEvent.Syncing)

        broadcaster.emitSyncing(1, 3)
        assertEquals(1, (broadcaster.syncStatus.value as SyncEvent.Syncing).current)

        broadcaster.emitSyncing(2, 3)
        assertEquals(2, (broadcaster.syncStatus.value as SyncEvent.Syncing).current)

        broadcaster.emitCompleted(3, 0)
        assertTrue(broadcaster.syncStatus.value is SyncEvent.Completed)

        broadcaster.reset()
        assertTrue(broadcaster.syncStatus.value is SyncEvent.Idle)
    }
}
