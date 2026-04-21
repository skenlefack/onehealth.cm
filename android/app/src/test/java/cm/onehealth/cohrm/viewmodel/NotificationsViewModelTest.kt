package cm.onehealth.cohrm.viewmodel

import cm.onehealth.cohrm.data.remote.dto.NotificationItem
import cm.onehealth.cohrm.data.remote.dto.PaginationData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class NotificationsViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `notification item parses correctly`() {
        val item = NotificationItem(
            id = 1,
            notificationType = "new_rumor",
            status = "sent",
            subject = "Nouvelle rumeur assignee",
            recipientEmail = "user@onehealth.cm",
            rumorCode = "RUM-001",
            rumorTitle = "Suspected cholera",
            channel = "email",
            createdAt = "2026-04-20T10:00:00Z"
        )
        assertEquals(1, item.id)
        assertEquals("new_rumor", item.notificationType)
        assertEquals("sent", item.status)
        assertEquals("RUM-001", item.rumorCode)
    }

    @Test
    fun `notification with null fields`() {
        val item = NotificationItem(
            id = 2,
            notificationType = null,
            status = null,
            subject = null,
            recipientEmail = null,
            rumorCode = null,
            rumorTitle = null,
            channel = null,
            createdAt = null
        )
        assertEquals(2, item.id)
        assertNull(item.notificationType)
        assertNull(item.subject)
    }

    @Test
    fun `pagination data`() {
        val pagination = PaginationData(
            page = 1, limit = 20, total = 55, pages = 3
        )
        assertEquals(1, pagination.page)
        assertEquals(20, pagination.limit)
        assertEquals(55, pagination.total)
        assertEquals(3, pagination.pages)
    }

    @Test
    fun `notification types coverage`() {
        val types = listOf("new_rumor", "escalation", "validation", "rejection", "risk_assessment", "reminder", "system")
        types.forEach { type ->
            val item = NotificationItem(
                id = 1, notificationType = type, status = "sent",
                subject = null, recipientEmail = null, rumorCode = null,
                rumorTitle = null, channel = "email", createdAt = null
            )
            assertEquals(type, item.notificationType)
        }
    }
}
