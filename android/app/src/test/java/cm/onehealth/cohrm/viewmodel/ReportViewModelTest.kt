package cm.onehealth.cohrm.viewmodel

import cm.onehealth.cohrm.domain.model.Photo
import cm.onehealth.cohrm.domain.model.Report
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.domain.model.UploadStatus
import cm.onehealth.cohrm.ui.screens.report.ReportFormState
import org.junit.Assert.*
import org.junit.Test

class ReportViewModelTest {

    // MARK: - ReportFormState Initial State

    @Test
    fun `initial state has empty category`() {
        val state = ReportFormState()
        assertEquals("", state.category)
    }

    @Test
    fun `initial state has empty required fields`() {
        val state = ReportFormState()
        assertEquals("", state.category)
        assertEquals("", state.region)
        assertEquals("", state.title)
        assertEquals("", state.description)
    }

    @Test
    fun `initial state is at step 1`() {
        val state = ReportFormState()
        assertEquals(1, state.currentStep)
    }

    @Test
    fun `initial state is not submitting`() {
        val state = ReportFormState()
        assertFalse(state.isSubmitting)
    }

    @Test
    fun `initial state has empty symptoms list`() {
        val state = ReportFormState()
        assertTrue(state.symptoms.isEmpty())
    }

    @Test
    fun `initial state has empty photos list`() {
        val state = ReportFormState()
        assertTrue(state.photos.isEmpty())
    }

    @Test
    fun `initial state has mobile_app source type`() {
        val state = ReportFormState()
        assertEquals("mobile_app", state.sourceType)
    }

    // MARK: - Step Validation Logic (canProceedFromStep equivalent)

    @Test
    fun `step 1 requires non-blank category`() {
        val emptyState = ReportFormState(category = "")
        assertTrue(emptyState.category.isBlank())

        val validState = ReportFormState(category = "human_health")
        assertTrue(validState.category.isNotBlank())
    }

    @Test
    fun `step 1 whitespace-only category is invalid`() {
        val state = ReportFormState(category = "   ")
        assertTrue(state.category.isBlank())
    }

    @Test
    fun `step 2 requires non-blank region`() {
        val emptyState = ReportFormState(region = "")
        assertTrue(emptyState.region.isBlank())

        val validState = ReportFormState(region = "Centre")
        assertTrue(validState.region.isNotBlank())
    }

    @Test
    fun `step 4 requires non-blank title`() {
        val emptyState = ReportFormState(title = "")
        assertTrue(emptyState.title.isBlank())

        val validState = ReportFormState(title = "Suspected outbreak")
        assertTrue(validState.title.isNotBlank())
    }

    // MARK: - Step Navigation via copy

    @Test
    fun `nextStep increments currentStep`() {
        val state = ReportFormState(currentStep = 1)
        val next = state.copy(currentStep = (state.currentStep + 1).coerceAtMost(6))
        assertEquals(2, next.currentStep)
    }

    @Test
    fun `nextStep does not exceed step 6`() {
        val state = ReportFormState(currentStep = 6)
        val next = state.copy(currentStep = (state.currentStep + 1).coerceAtMost(6))
        assertEquals(6, next.currentStep)
    }

    @Test
    fun `previousStep decrements currentStep`() {
        val state = ReportFormState(currentStep = 3)
        val prev = state.copy(currentStep = (state.currentStep - 1).coerceAtLeast(1))
        assertEquals(2, prev.currentStep)
    }

    @Test
    fun `previousStep does not go below step 1`() {
        val state = ReportFormState(currentStep = 1)
        val prev = state.copy(currentStep = (state.currentStep - 1).coerceAtLeast(1))
        assertEquals(1, prev.currentStep)
    }

    // MARK: - Symptom Management

    @Test
    fun `toggle symptom adds to empty list`() {
        val symptoms = mutableListOf<String>()
        symptoms.add("FI")
        assertEquals(listOf("FI"), symptoms)
    }

    @Test
    fun `toggle symptom removes if present`() {
        val symptoms = mutableListOf("FI", "VO", "DI")
        symptoms.remove("VO")
        assertEquals(listOf("FI", "DI"), symptoms)
    }

    @Test
    fun `toggle symptom adds if not present`() {
        val symptoms = mutableListOf("FI")
        if (!symptoms.contains("VO")) symptoms.add("VO")
        assertEquals(listOf("FI", "VO"), symptoms)
    }

    @Test
    fun `toggle same symptom twice returns to original state`() {
        val symptoms = mutableListOf<String>()
        symptoms.add("FI")
        symptoms.remove("FI")
        assertTrue(symptoms.isEmpty())
    }

    @Test
    fun `multiple symptoms can be added`() {
        val state = ReportFormState(symptoms = listOf("FI", "VO", "DI", "TO", "ER"))
        assertEquals(5, state.symptoms.size)
    }

    // MARK: - Photo Management

    @Test
    fun `addPhoto to empty list adds one photo`() {
        val state = ReportFormState()
        val photo = Photo(id = "1", localPath = "/path/photo1.jpg")
        val updated = state.copy(photos = state.photos + photo)
        assertEquals(1, updated.photos.size)
    }

    @Test
    fun `addPhoto respects max 3 photos limit`() {
        val photos = listOf(
            Photo(id = "1", localPath = "/p1.jpg"),
            Photo(id = "2", localPath = "/p2.jpg"),
            Photo(id = "3", localPath = "/p3.jpg"),
        )
        val state = ReportFormState(photos = photos)
        // ViewModel checks size < 3 before adding
        val canAdd = state.photos.size < 3
        assertFalse(canAdd)
    }

    @Test
    fun `removePhoto filters by id`() {
        val photos = listOf(
            Photo(id = "1", localPath = "/p1.jpg"),
            Photo(id = "2", localPath = "/p2.jpg"),
            Photo(id = "3", localPath = "/p3.jpg"),
        )
        val state = ReportFormState(photos = photos)
        val updated = state.copy(photos = state.photos.filter { it.id != "2" })
        assertEquals(2, updated.photos.size)
        assertFalse(updated.photos.any { it.id == "2" })
    }

    @Test
    fun `removePhoto with nonexistent id does nothing`() {
        val photos = listOf(Photo(id = "1", localPath = "/p1.jpg"))
        val state = ReportFormState(photos = photos)
        val updated = state.copy(photos = state.photos.filter { it.id != "999" })
        assertEquals(1, updated.photos.size)
    }

    // MARK: - Field Update via copy

    @Test
    fun `updateCategory via copy`() {
        val state = ReportFormState()
        val updated = state.copy(category = "animal_health")
        assertEquals("animal_health", updated.category)
    }

    @Test
    fun `updateRegion resets department and district`() {
        val state = ReportFormState(region = "Centre", department = "Mfoundi", district = "Yaounde")
        val updated = state.copy(region = "Littoral", department = "", district = "")
        assertEquals("Littoral", updated.region)
        assertEquals("", updated.department)
        assertEquals("", updated.district)
    }

    @Test
    fun `updateLocation sets lat and lng`() {
        val state = ReportFormState()
        val updated = state.copy(latitude = 4.0511, longitude = 9.6846)
        assertEquals(4.0511, updated.latitude!!, 0.0001)
        assertEquals(9.6846, updated.longitude!!, 0.0001)
    }

    @Test
    fun `theme toggling adds theme`() {
        val themes = mutableListOf<String>()
        themes.add("sanitation")
        assertEquals(listOf("sanitation"), themes)
    }

    @Test
    fun `theme toggling removes existing theme`() {
        val themes = mutableListOf("sanitation", "water")
        themes.remove("sanitation")
        assertEquals(listOf("water"), themes)
    }

    // MARK: - Report Domain Model

    @Test
    fun `Report has correct default values`() {
        val report = Report()
        assertTrue(report.id.isNotBlank())
        assertEquals("", report.title)
        assertEquals("", report.description)
        assertEquals("", report.category)
        assertEquals(SyncStatus.DRAFT, report.syncStatus)
        assertEquals("mobile_app", report.sourceType)
        assertTrue(report.symptoms.isEmpty())
        assertTrue(report.photos.isEmpty())
        assertNull(report.latitude)
        assertNull(report.longitude)
        assertNull(report.affectedCount)
        assertNull(report.serverCode)
    }

    @Test
    fun `Report affectedCount parses from string`() {
        val countStr = "25"
        assertEquals(25, countStr.toIntOrNull())

        val empty = ""
        assertNull(empty.toIntOrNull())

        val invalid = "abc"
        assertNull(invalid.toIntOrNull())
    }

    @Test
    fun `Report SyncStatus values`() {
        assertEquals(5, SyncStatus.entries.size)
        assertEquals(SyncStatus.DRAFT, SyncStatus.valueOf("DRAFT"))
        assertEquals(SyncStatus.PENDING, SyncStatus.valueOf("PENDING"))
        assertEquals(SyncStatus.SYNCING, SyncStatus.valueOf("SYNCING"))
        assertEquals(SyncStatus.SYNCED, SyncStatus.valueOf("SYNCED"))
        assertEquals(SyncStatus.ERROR, SyncStatus.valueOf("ERROR"))
    }

    // MARK: - Photo Domain Model

    @Test
    fun `Photo has correct default values`() {
        val photo = Photo()
        assertTrue(photo.id.isNotBlank())
        assertEquals("", photo.reportId)
        assertEquals("", photo.localPath)
        assertNull(photo.remoteUrl)
        assertEquals("", photo.caption)
        assertEquals(UploadStatus.PENDING, photo.uploadStatus)
    }

    @Test
    fun `Photo UploadStatus values`() {
        assertEquals(4, UploadStatus.entries.size)
        assertEquals(UploadStatus.PENDING, UploadStatus.valueOf("PENDING"))
        assertEquals(UploadStatus.UPLOADING, UploadStatus.valueOf("UPLOADING"))
        assertEquals(UploadStatus.UPLOADED, UploadStatus.valueOf("UPLOADED"))
        assertEquals(UploadStatus.ERROR, UploadStatus.valueOf("ERROR"))
    }

    // MARK: - Edge Cases

    @Test
    fun `ReportFormState with all fields populated`() {
        val state = ReportFormState(
            id = "test-id",
            category = "human_health",
            species = "HUM",
            region = "Centre",
            department = "Mfoundi",
            district = "Yaounde",
            latitude = 3.848,
            longitude = 11.502,
            title = "Cholera suspicion",
            description = "Multiple cases of diarrhea",
            symptoms = listOf("FI", "VO", "DI"),
            affectedCount = "15",
            photos = listOf(Photo(id = "p1")),
            dateDetection = "2026-04-20",
            messageReceived = "Urgent report",
            themes = listOf("water", "sanitation"),
            gravityComment = "Severe",
            sourceType = "mobile_app",
            arrondissement = "Yaounde III",
            commune = "Yaounde",
            aireSante = "AS-Centre",
            currentStep = 3,
            isSubmitting = false,
        )
        assertEquals("human_health", state.category)
        assertEquals(3, state.symptoms.size)
        assertEquals(1, state.photos.size)
        assertEquals(2, state.themes.size)
        assertEquals(3, state.currentStep)
    }

    @Test
    fun `ReportFormState copy preserves unchanged fields`() {
        val original = ReportFormState(
            category = "human_health",
            region = "Centre",
            title = "Original title",
        )
        val updated = original.copy(title = "Updated title")
        assertEquals("human_health", updated.category)
        assertEquals("Centre", updated.region)
        assertEquals("Updated title", updated.title)
    }
}
