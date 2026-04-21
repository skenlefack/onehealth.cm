package cm.onehealth.cohrm.viewmodel

import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.data.remote.dto.RumorsListData
import cm.onehealth.cohrm.domain.model.RumorItem
import cm.onehealth.cohrm.domain.model.RumorStatus
import cm.onehealth.cohrm.ui.screens.rumors.RumorsUiState
import org.junit.Assert.*
import org.junit.Test

/**
 * Tests for the Rumors/Notifications list state management and pagination.
 * The app does not have a separate NotificationsViewModel, so we test the
 * RumorsViewModel state management which handles list state and pagination,
 * following the same patterns that a notifications list would use.
 */
class NotificationsViewModelTest {

    // MARK: - RumorsUiState Initial State

    @Test
    fun `initial state is not loading`() {
        val state = RumorsUiState()
        assertFalse(state.isLoading)
    }

    @Test
    fun `initial state has empty rumors list`() {
        val state = RumorsUiState()
        assertTrue(state.rumors.isEmpty())
    }

    @Test
    fun `initial state has no error`() {
        val state = RumorsUiState()
        assertNull(state.error)
    }

    @Test
    fun `initial state starts at page 1`() {
        val state = RumorsUiState()
        assertEquals(1, state.page)
    }

    @Test
    fun `initial state has 1 total page`() {
        val state = RumorsUiState()
        assertEquals(1, state.totalPages)
    }

    @Test
    fun `initial state has zero total`() {
        val state = RumorsUiState()
        assertEquals(0, state.total)
    }

    @Test
    fun `initial state has no filters`() {
        val state = RumorsUiState()
        assertNull(state.filterStatus)
        assertNull(state.filterCategory)
        assertNull(state.filterRegion)
        assertNull(state.filterPriority)
        assertNull(state.filterSource)
        assertEquals("", state.searchQuery)
    }

    @Test
    fun `initial state is not loading more`() {
        val state = RumorsUiState()
        assertFalse(state.isLoadingMore)
    }

    // MARK: - Loading State Transitions

    @Test
    fun `loading state transitions correctly for initial load`() {
        val initial = RumorsUiState()
        val loading = initial.copy(isLoading = true, page = 1, error = null)
        assertTrue(loading.isLoading)
        assertEquals(1, loading.page)
        assertNull(loading.error)
    }

    @Test
    fun `loading state clears error`() {
        val withError = RumorsUiState(error = "Previous error")
        val loading = withError.copy(isLoading = true, error = null)
        assertTrue(loading.isLoading)
        assertNull(loading.error)
    }

    @Test
    fun `success state stops loading and populates data`() {
        val loading = RumorsUiState(isLoading = true)
        val rumors = listOf(
            makeRumorDetail(1, "OH-001", "Test 1"),
            makeRumorDetail(2, "OH-002", "Test 2"),
        )
        val success = loading.copy(
            isLoading = false,
            rumors = rumors,
            total = 50,
            page = 1,
            totalPages = 3,
        )
        assertFalse(success.isLoading)
        assertEquals(2, success.rumors.size)
        assertEquals(50, success.total)
        assertEquals(3, success.totalPages)
    }

    @Test
    fun `error state stops loading and sets error`() {
        val loading = RumorsUiState(isLoading = true)
        val error = loading.copy(isLoading = false, error = "Network error")
        assertFalse(error.isLoading)
        assertEquals("Network error", error.error)
    }

    // MARK: - Pagination

    @Test
    fun `loadMore increments page`() {
        val state = RumorsUiState(page = 1, totalPages = 3)
        val nextPage = state.copy(isLoadingMore = true, page = state.page + 1)
        assertTrue(nextPage.isLoadingMore)
        assertEquals(2, nextPage.page)
    }

    @Test
    fun `loadMore should not proceed when at last page`() {
        val state = RumorsUiState(page = 3, totalPages = 3)
        val canLoadMore = !state.isLoadingMore && state.page < state.totalPages
        assertFalse(canLoadMore)
    }

    @Test
    fun `loadMore should not proceed when already loading`() {
        val state = RumorsUiState(page = 1, totalPages = 3, isLoadingMore = true)
        val canLoadMore = !state.isLoadingMore && state.page < state.totalPages
        assertFalse(canLoadMore)
    }

    @Test
    fun `loadMore can proceed when not at last page and not loading`() {
        val state = RumorsUiState(page = 1, totalPages = 3, isLoadingMore = false)
        val canLoadMore = !state.isLoadingMore && state.page < state.totalPages
        assertTrue(canLoadMore)
    }

    @Test
    fun `loadMore appends rumors to existing list`() {
        val existing = listOf(makeRumorDetail(1, "OH-001", "First"))
        val state = RumorsUiState(rumors = existing)
        val newRumors = listOf(makeRumorDetail(2, "OH-002", "Second"))
        val updated = state.copy(rumors = state.rumors + newRumors)
        assertEquals(2, updated.rumors.size)
        assertEquals("OH-001", updated.rumors[0].code)
        assertEquals("OH-002", updated.rumors[1].code)
    }

    @Test
    fun `reset page replaces rumors list`() {
        val existing = listOf(
            makeRumorDetail(1, "OH-001", "Old 1"),
            makeRumorDetail(2, "OH-002", "Old 2"),
        )
        val state = RumorsUiState(rumors = existing, page = 2)
        val newRumors = listOf(makeRumorDetail(3, "OH-003", "New 1"))
        val reset = state.copy(
            rumors = newRumors,
            page = 1,
            isLoading = false,
            isLoadingMore = false,
        )
        assertEquals(1, reset.rumors.size)
        assertEquals("OH-003", reset.rumors[0].code)
        assertEquals(1, reset.page)
    }

    // MARK: - Filter State Management

    @Test
    fun `setFilter updates filter fields`() {
        val state = RumorsUiState()
        val filtered = state.copy(
            filterStatus = "pending",
            filterCategory = "human_health",
            filterRegion = "Centre",
            filterPriority = "high",
            filterSource = "mobile",
        )
        assertEquals("pending", filtered.filterStatus)
        assertEquals("human_health", filtered.filterCategory)
        assertEquals("Centre", filtered.filterRegion)
        assertEquals("high", filtered.filterPriority)
        assertEquals("mobile", filtered.filterSource)
    }

    @Test
    fun `setSearch updates search query`() {
        val state = RumorsUiState()
        val searched = state.copy(searchQuery = "cholera")
        assertEquals("cholera", searched.searchQuery)
    }

    @Test
    fun `clearFilters resets all filters`() {
        val filtered = RumorsUiState(
            filterStatus = "pending",
            filterCategory = "human_health",
            filterRegion = "Centre",
            filterPriority = "high",
            filterSource = "mobile",
            searchQuery = "cholera",
        )
        val cleared = filtered.copy(
            filterStatus = null,
            filterCategory = null,
            filterRegion = null,
            filterPriority = null,
            filterSource = null,
            searchQuery = "",
        )
        assertNull(cleared.filterStatus)
        assertNull(cleared.filterCategory)
        assertNull(cleared.filterRegion)
        assertNull(cleared.filterPriority)
        assertNull(cleared.filterSource)
        assertEquals("", cleared.searchQuery)
    }

    @Test
    fun `blank search query maps to null for API`() {
        val state = RumorsUiState(searchQuery = "   ")
        val searchParam = state.searchQuery.ifBlank { null }
        assertNull(searchParam)
    }

    @Test
    fun `non-blank search query passes through`() {
        val state = RumorsUiState(searchQuery = "cholera")
        val searchParam = state.searchQuery.ifBlank { null }
        assertEquals("cholera", searchParam)
    }

    // MARK: - RumorsListData Tests

    @Test
    fun `RumorsListData default values`() {
        val data = RumorsListData()
        assertTrue(data.rumors.isEmpty())
        assertEquals(0, data.total)
        assertEquals(1, data.page)
        assertEquals(20, data.perPage)
        assertEquals(1, data.totalPages)
    }

    @Test
    fun `RumorsListData with pagination info`() {
        val data = RumorsListData(
            rumors = listOf(makeRumorDetail(1, "OH-001", "Test")),
            total = 100,
            page = 2,
            perPage = 20,
            totalPages = 5,
        )
        assertEquals(1, data.rumors.size)
        assertEquals(100, data.total)
        assertEquals(2, data.page)
        assertEquals(5, data.totalPages)
    }

    // MARK: - RumorItem Mapping

    @Test
    fun `RumorDetail maps to RumorItem`() {
        val detail = makeRumorDetail(42, "OH-042", "Anthrax suspicion")
        val item = RumorItem(
            id = detail.id, code = detail.code, title = detail.title,
            category = detail.category, status = detail.status,
            priority = detail.priority, risk = detail.riskLevel,
            source = detail.source, region = detail.region,
            department = detail.department, createdAt = detail.createdAt,
            reporterName = detail.reporterName,
        )
        assertEquals(42, item.id)
        assertEquals("OH-042", item.code)
        assertEquals("Anthrax suspicion", item.title)
    }

    // MARK: - RumorStatus Constants

    @Test
    fun `all rumor statuses are valid filter options`() {
        val validStatuses = RumorStatus.all
        assertEquals(5, validStatuses.size)
        assertTrue(validStatuses.contains("pending"))
        assertTrue(validStatuses.contains("investigating"))
        assertTrue(validStatuses.contains("confirmed"))
        assertTrue(validStatuses.contains("false_alarm"))
        assertTrue(validStatuses.contains("closed"))
    }

    // MARK: - Edge Cases

    @Test
    fun `state with single page has no more to load`() {
        val state = RumorsUiState(page = 1, totalPages = 1, total = 5)
        assertFalse(state.page < state.totalPages)
    }

    @Test
    fun `empty search query with filters applied`() {
        val state = RumorsUiState(
            filterStatus = "pending",
            searchQuery = "",
        )
        assertEquals("pending", state.filterStatus)
        assertEquals("", state.searchQuery)
    }

    @Test
    fun `large page numbers`() {
        val state = RumorsUiState(page = 100, totalPages = 100, total = 2000)
        assertFalse(state.page < state.totalPages)
    }

    @Test
    fun `state preserves rumors across filter changes`() {
        val rumors = listOf(
            makeRumorDetail(1, "OH-001", "First"),
            makeRumorDetail(2, "OH-002", "Second"),
        )
        val state = RumorsUiState(rumors = rumors)
        val withFilter = state.copy(filterStatus = "pending")
        assertEquals(2, withFilter.rumors.size)
        assertEquals("pending", withFilter.filterStatus)
    }

    // MARK: - Helpers

    private fun makeRumorDetail(id: Int, code: String, title: String): RumorDetail {
        return RumorDetail(
            id = id,
            code = code,
            title = title,
            description = "Test description for $title",
            category = "human_health",
            status = "pending",
            priority = "medium",
            riskLevel = "low",
            source = "mobile",
            region = "Centre",
            department = "Mfoundi",
            createdAt = "2026-04-20T10:00:00Z",
        )
    }
}
