package cm.onehealth.cohrm.viewmodel

import cm.onehealth.cohrm.data.remote.dto.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class DashboardViewModelTest {

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
    fun `dashboard stats parse correctly`() {
        val stats = DashboardStats(
            total = 150, pending = 30, investigating = 25,
            confirmed = 20, falseAlarm = 10, closed = 65,
            highPriority = 12, critical = 5,
            todayCount = 8, weekCount = 35, monthCount = 120
        )
        assertEquals(150, stats.total)
        assertEquals(30, stats.pending)
        assertEquals(25, stats.investigating)
        assertEquals(20, stats.confirmed)
        assertEquals(10, stats.falseAlarm)
        assertEquals(65, stats.closed)
        assertEquals(12, stats.highPriority)
        assertEquals(5, stats.critical)
        assertEquals(8, stats.todayCount)
        assertEquals(35, stats.weekCount)
        assertEquals(120, stats.monthCount)
    }

    @Test
    fun `chart items with valid data`() {
        val item = ChartItem(name = "Centre", value = 42, key = "centre", color = "#3498DB")
        assertEquals("Centre", item.name)
        assertEquals(42, item.value)
        assertEquals("centre", item.key)
        assertEquals("#3498DB", item.color)
    }

    @Test
    fun `chart items with null color`() {
        val item = ChartItem(name = "Nord", value = 15, key = "nord", color = null)
        assertNull(item.color)
        assertEquals(15, item.value)
    }

    @Test
    fun `trend items parse correctly`() {
        val trend = TrendItem(date = "2026-04-20", count = 15)
        assertEquals("2026-04-20", trend.date)
        assertEquals(15, trend.count)
    }

    @Test
    fun `trend items with zero count`() {
        val trend = TrendItem(date = "2026-04-15", count = 0)
        assertEquals(0, trend.count)
    }

    @Test
    fun `recent rumor summary`() {
        val rumor = RecentRumor(
            id = 1, code = "RUM-001", title = "Suspected cholera",
            category = "human_health", status = "investigating",
            priority = "high", riskLevel = "high",
            source = "community", region = "Centre",
            reporterName = "Jean Dupont", createdAt = "2026-04-20T10:00:00Z"
        )
        assertEquals(1, rumor.id)
        assertEquals("RUM-001", rumor.code)
        assertEquals("human_health", rumor.category)
        assertEquals("high", rumor.priority)
    }

    @Test
    fun `dashboard stats zero values`() {
        val stats = DashboardStats(
            total = 0, pending = 0, investigating = 0,
            confirmed = 0, falseAlarm = 0, closed = 0,
            highPriority = 0, critical = 0,
            todayCount = 0, weekCount = 0, monthCount = 0
        )
        assertEquals(0, stats.total)
        assertEquals(0, stats.todayCount)
    }
}
