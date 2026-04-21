package cm.onehealth.cohrm.data.dto

import cm.onehealth.cohrm.data.remote.dto.*
import com.squareup.moshi.Moshi
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class DtoSerializationTest {

    private lateinit var moshi: Moshi

    @Before
    fun setup() {
        moshi = Moshi.Builder().build()
    }

    // MARK: - DashboardResponse

    @Test
    fun `DashboardResponse deserializes from full JSON`() {
        val json = """
        {
            "success": true,
            "data": {
                "stats": {
                    "total": 150,
                    "pending": 30,
                    "investigating": 20,
                    "confirmed": 15,
                    "false_alarm": 10,
                    "closed": 75,
                    "high_priority": 12,
                    "critical": 4,
                    "today_count": 7,
                    "week_count": 35,
                    "month_count": 120
                },
                "by_region": [{"label": "Centre", "value": 45, "key": "CE", "color": "#3498DB"}],
                "by_category": [],
                "by_status": [],
                "by_source": [],
                "by_priority": [],
                "by_risk": [],
                "trends": [{"date": "2026-04-20", "count": 15}],
                "recent_rumors": [
                    {
                        "id": 1, "code": "OH-001", "title": "Test rumor",
                        "category": "human_health", "status": "pending",
                        "priority": "medium", "risk": "low", "source": "mobile",
                        "region": "Centre", "department": "Mfoundi",
                        "created_at": "2026-04-20T10:00:00Z"
                    }
                ]
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(DashboardResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertNotNull(response.data)
        assertEquals(150, response.data!!.stats!!.total)
        assertEquals(30, response.data!!.stats!!.pending)
        assertEquals(12, response.data!!.stats!!.highPriority)
        assertEquals(7, response.data!!.stats!!.todayCount)
        assertEquals(1, response.data!!.byRegion.size)
        assertEquals("Centre", response.data!!.byRegion[0].label)
        assertEquals(1, response.data!!.trends.size)
        assertEquals(1, response.data!!.recentRumors.size)
        assertEquals("OH-001", response.data!!.recentRumors[0].code)
    }

    @Test
    fun `DashboardResponse deserializes from minimal JSON`() {
        val json = """{"success": false}"""
        val adapter = moshi.adapter(DashboardResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertFalse(response!!.success)
        assertNull(response.data)
    }

    // MARK: - DashboardStats

    @Test
    fun `DashboardStats serializes and deserializes`() {
        val adapter = moshi.adapter(DashboardStats::class.java)
        val stats = DashboardStats(total = 100, pending = 20, highPriority = 8)
        val json = adapter.toJson(stats)

        assertNotNull(json)
        assertTrue(json.contains("\"total\":100"))
        assertTrue(json.contains("\"high_priority\":8"))

        val deserialized = adapter.fromJson(json)
        assertNotNull(deserialized)
        assertEquals(100, deserialized!!.total)
        assertEquals(20, deserialized.pending)
        assertEquals(8, deserialized.highPriority)
    }

    // MARK: - ChartItem

    @Test
    fun `ChartItem serializes and deserializes`() {
        val adapter = moshi.adapter(ChartItem::class.java)
        val item = ChartItem(label = "Centre", value = 45, key = "CE", color = "#3498DB")
        val json = adapter.toJson(item)
        val deserialized = adapter.fromJson(json)

        assertNotNull(deserialized)
        assertEquals("Centre", deserialized!!.label)
        assertEquals(45, deserialized.value)
        assertEquals("CE", deserialized.key)
        assertEquals("#3498DB", deserialized.color)
    }

    @Test
    fun `ChartItem with null color`() {
        val json = """{"label": "Test", "value": 10, "key": "T"}"""
        val adapter = moshi.adapter(ChartItem::class.java)
        val item = adapter.fromJson(json)

        assertNotNull(item)
        assertNull(item!!.color)
    }

    // MARK: - RumorDetail

    @Test
    fun `RumorDetail deserializes from full JSON`() {
        val json = """
        {
            "id": 7,
            "code": "OH-2026-0007",
            "title": "Flooding in Wouri",
            "description": "Severe flooding",
            "category": "disaster",
            "species": null,
            "status": "confirmed",
            "priority": "high",
            "risk_level": "very_high",
            "source": "field",
            "region": "Littoral",
            "department": "Wouri",
            "district": "Bonaberi",
            "latitude": 4.0511,
            "longitude": 9.6846,
            "symptoms": "flooding,displacement",
            "affected_count": 200,
            "reporter_name": "Amina Njoya",
            "reporter_phone": "+237691234567",
            "reporter_email": null,
            "device_id": "dev-123",
            "assigned_to": 5,
            "assigned_name": "Dr. Nkeng",
            "created_at": "2026-04-10T08:00:00Z",
            "updated_at": "2026-04-12T16:45:00Z",
            "closed_at": null,
            "photos": [{"id": 10, "url": "/photo.jpg", "thumbnail_url": "/thumb.jpg", "caption": "Flooded area"}],
            "validations": [
                {"id": 1, "actor_id": 3, "actor_name": "Dr. Nkeng", "actor_level": 3, "actor_level_label": "Evaluateur", "decision": "approved", "notes": "Confirmed", "created_at": "2026-04-11T09:30:00Z"}
            ],
            "feedback": [
                {"id": 1, "user_name": "Admin", "message": "Team dispatched", "type": "comment", "created_at": "2026-04-10T10:00:00Z"}
            ],
            "created_by_name": "System"
        }
        """.trimIndent()

        val adapter = moshi.adapter(RumorDetail::class.java)
        val detail = adapter.fromJson(json)

        assertNotNull(detail)
        assertEquals(7, detail!!.id)
        assertEquals("OH-2026-0007", detail.code)
        assertEquals("Flooding in Wouri", detail.title)
        assertEquals("disaster", detail.category)
        assertNull(detail.species)
        assertEquals("confirmed", detail.status)
        assertEquals("very_high", detail.riskLevel)
        assertEquals(4.0511, detail.latitude!!, 0.0001)
        assertEquals(9.6846, detail.longitude!!, 0.0001)
        assertEquals(200, detail.affectedCount)
        assertEquals("Amina Njoya", detail.reporterName)
        assertEquals(1, detail.photos.size)
        assertEquals("Flooded area", detail.photos[0].caption)
        assertEquals(1, detail.validations.size)
        assertEquals("Dr. Nkeng", detail.validations[0].actorName)
        assertEquals(3, detail.validations[0].actorLevel)
        assertEquals(1, detail.feedback.size)
        assertEquals("Team dispatched", detail.feedback[0].message)
    }

    @Test
    fun `RumorDetail deserializes from minimal JSON`() {
        val json = """{"id": 1, "code": "", "title": "", "description": "", "status": "pending", "priority": "medium", "risk_level": "unknown", "source": "mobile", "region": "", "department": "", "created_at": ""}"""
        val adapter = moshi.adapter(RumorDetail::class.java)
        val detail = adapter.fromJson(json)

        assertNotNull(detail)
        assertEquals(1, detail!!.id)
        assertNull(detail.species)
        assertNull(detail.latitude)
        assertNull(detail.affectedCount)
        assertTrue(detail.photos.isEmpty())
        assertTrue(detail.validations.isEmpty())
        assertTrue(detail.feedback.isEmpty())
    }

    // MARK: - RumorsListResponse

    @Test
    fun `RumorsListResponse deserializes correctly`() {
        val json = """
        {
            "success": true,
            "data": {
                "rumors": [
                    {"id": 1, "code": "OH-001", "title": "Test", "description": "", "status": "pending", "priority": "medium", "risk_level": "low", "source": "mobile", "region": "Centre", "department": "Mfoundi", "created_at": "2026-04-20"}
                ],
                "total": 50,
                "page": 1,
                "per_page": 20,
                "total_pages": 3
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(RumorsListResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(1, response.data!!.rumors.size)
        assertEquals(50, response.data!!.total)
        assertEquals(1, response.data!!.page)
        assertEquals(3, response.data!!.totalPages)
    }

    // MARK: - ScanDto

    @Test
    fun `ScanRunResponse deserializes correctly`() {
        val json = """{"success": true, "message": "Scan started", "data": {"scan_id": 42}}"""
        val adapter = moshi.adapter(ScanRunResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals("Scan started", response.message)
        assertEquals(42, response.data!!.scanId)
    }

    @Test
    fun `ScanHistoryResponse deserializes correctly`() {
        val json = """
        {
            "success": true,
            "data": [
                {"id": 1, "source": "social_media", "status": "completed", "keywords": ["cholera"], "items_scanned": 100, "rumors_found": 5, "rumors_created": 2, "duration": 30, "created_at": "2026-04-19T12:00:00Z", "completed_at": "2026-04-19T12:00:30Z"}
            ],
            "pagination": {"total": 10, "page": 1, "limit": 20, "total_pages": 1}
        }
        """.trimIndent()

        val adapter = moshi.adapter(ScanHistoryResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(1, response.data.size)
        assertEquals("social_media", response.data[0].source)
        assertEquals("completed", response.data[0].status)
        assertEquals(100, response.data[0].itemsScanned)
        assertEquals(5, response.data[0].rumorsFound)
        assertEquals(2, response.data[0].rumorsCreated)
        assertNotNull(response.pagination)
        assertEquals(10, response.pagination!!.total)
    }

    @Test
    fun `ScanDetailResponse deserializes with results`() {
        val json = """
        {
            "success": true,
            "data": {
                "id": 5,
                "source": "web",
                "status": "completed",
                "keywords": ["ebola", "cameroon"],
                "items_scanned": 50,
                "rumors_found": 3,
                "rumors_created": 1,
                "results": [
                    {"id": 1, "title": "Ebola alert", "content": "Reports of...", "url": "https://example.com", "source": "news", "relevance_score": 0.85, "status": "new", "matched_keywords": ["ebola"]}
                ]
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(ScanDetailResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(5, response.data!!.id)
        assertEquals(1, response.data!!.results.size)
        assertEquals("Ebola alert", response.data!!.results[0].title)
        assertEquals(0.85, response.data!!.results[0].relevanceScore!!, 0.01)
    }

    @Test
    fun `ScanRunRequest serializes correctly`() {
        val adapter = moshi.adapter(ScanRunRequest::class.java)
        val request = ScanRunRequest(source = "web", keywords = listOf("cholera", "outbreak"))
        val json = adapter.toJson(request)

        assertTrue(json.contains("\"source\":\"web\""))
        assertTrue(json.contains("cholera"))
        assertTrue(json.contains("outbreak"))
    }

    // MARK: - LoginDto

    @Test
    fun `LoginResponse deserializes success`() {
        val json = """
        {
            "success": true,
            "data": {
                "user": {"id": 1, "name": "Admin", "email": "admin@onehealth.cm", "username": "admin", "role": "admin"},
                "actor": {"id": 1, "level": 5, "level_label": "Superviseur", "type": "supervisor", "region": "Centre", "department": "Mfoundi", "organization": "OneHealth", "phone": "691234567"},
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(LoginResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals("Admin", response.data!!.user!!.name)
        assertEquals("admin@onehealth.cm", response.data!!.user!!.email)
        assertEquals(5, response.data!!.actor!!.level)
        assertEquals("Superviseur", response.data!!.actor!!.levelLabel)
        assertNotNull(response.data!!.token)
    }

    @Test
    fun `LoginResponse deserializes failure`() {
        val json = """{"success": false, "message": "Invalid credentials"}"""
        val adapter = moshi.adapter(LoginResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertFalse(response!!.success)
        assertEquals("Invalid credentials", response.message)
        assertNull(response.data)
    }

    @Test
    fun `LoginRequest serializes correctly`() {
        val adapter = moshi.adapter(LoginRequest::class.java)
        val request = LoginRequest(email = "user@test.com", password = "secret123")
        val json = adapter.toJson(request)

        assertTrue(json.contains("\"email\":\"user@test.com\""))
        assertTrue(json.contains("\"password\":\"secret123\""))
    }

    // MARK: - SyncResponse

    @Test
    fun `SyncResponse deserializes correctly`() {
        val json = """
        {
            "success": true,
            "data": {
                "sms_codes": [
                    {"code": "FI", "label_fr": "Fievre", "label_en": "Fever", "category": "symptom"},
                    {"code": "VO", "label_fr": "Vomissement", "label_en": "Vomiting", "category": "symptom"}
                ],
                "regions": [
                    {"code": "CE", "name": "Centre"},
                    {"code": "LT", "name": "Littoral"}
                ],
                "sync_timestamp": "2026-04-20T00:00:00Z"
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(SyncResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(2, response.data!!.smsCodes.size)
        assertEquals("FI", response.data!!.smsCodes[0].code)
        assertEquals("Fievre", response.data!!.smsCodes[0].labelFr)
        assertEquals("Fever", response.data!!.smsCodes[0].labelEn)
        assertEquals(2, response.data!!.regions.size)
        assertEquals("CE", response.data!!.regions[0].code)
        assertEquals("Centre", response.data!!.regions[0].name)
    }

    // MARK: - ReportRequest

    @Test
    fun `ReportRequest serializes all fields`() {
        val adapter = moshi.adapter(ReportRequest::class.java)
        val request = ReportRequest(
            title = "Suspected outbreak",
            description = "Multiple cases",
            source = "mobile",
            region = "Centre",
            location = "Yaounde",
            latitude = 3.848,
            longitude = 11.502,
            species = "HUM",
            symptoms = "FI,VO",
            affectedCount = 15,
            reporterName = "Jean",
            reporterPhone = "691234567",
            deviceId = "dev-123",
            category = "human_health",
        )
        val json = adapter.toJson(request)

        assertTrue(json.contains("\"title\":\"Suspected outbreak\""))
        assertTrue(json.contains("\"region\":\"Centre\""))
        assertTrue(json.contains("\"affected_count\":15"))
        assertTrue(json.contains("\"reporter_name\":\"Jean\""))
    }

    @Test
    fun `ReportResponse deserializes success`() {
        val json = """{"success": true, "message": "Report created", "data": {"id": 99, "code": "OH-2026-0099"}}"""
        val adapter = moshi.adapter(ReportResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(99, response.data!!.id)
        assertEquals("OH-2026-0099", response.data!!.code)
    }

    // MARK: - Validation/Feedback Request

    @Test
    fun `ValidationRequest serializes correctly`() {
        val adapter = moshi.adapter(ValidationRequest::class.java)
        val request = ValidationRequest(
            decision = "approved",
            notes = "Confirmed by field visit",
            riskAssessment = "high",
            priorityChange = "critical",
        )
        val json = adapter.toJson(request)

        assertTrue(json.contains("\"decision\":\"approved\""))
        assertTrue(json.contains("\"risk_assessment\":\"high\""))
        assertTrue(json.contains("\"priority_change\":\"critical\""))
    }

    @Test
    fun `FeedbackRequest serializes correctly`() {
        val adapter = moshi.adapter(FeedbackRequest::class.java)
        val request = FeedbackRequest(message = "Team dispatched", type = "action")
        val json = adapter.toJson(request)

        assertTrue(json.contains("\"message\":\"Team dispatched\""))
        assertTrue(json.contains("\"type\":\"action\""))
    }

    // MARK: - SmsRequest

    @Test
    fun `SmsRequest serializes correctly`() {
        val adapter = moshi.adapter(SmsRequest::class.java)
        val request = SmsRequest(from = "+237691234567", text = "OH#HUM#HUM#FI,VO#CEN#Suspected cholera")
        val json = adapter.toJson(request)

        assertTrue(json.contains("+237691234567"))
        assertTrue(json.contains("OH#HUM"))
    }

    // MARK: - ActorsResponse

    @Test
    fun `ActorsResponse deserializes correctly`() {
        val json = """
        {
            "success": true,
            "data": [
                {
                    "id": 1, "user_id": 10, "name": "Dr. Tabi", "email": "tabi@oh.cm",
                    "level": 3, "level_label": "Evaluateur", "type": "evaluator",
                    "region": "Centre", "department": "Mfoundi", "organization": "MinSante",
                    "phone": "691234567", "active": true
                }
            ]
        }
        """.trimIndent()

        val adapter = moshi.adapter(ActorsResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(1, response.data.size)
        assertEquals("Dr. Tabi", response.data[0].name)
        assertEquals(3, response.data[0].level)
        assertTrue(response.data[0].active)
    }

    // MARK: - Edge Cases

    @Test
    fun `DashboardStats with all zeros`() {
        val json = """{"total": 0, "pending": 0, "investigating": 0, "confirmed": 0, "false_alarm": 0, "closed": 0, "high_priority": 0, "critical": 0, "today_count": 0, "week_count": 0, "month_count": 0}"""
        val adapter = moshi.adapter(DashboardStats::class.java)
        val stats = adapter.fromJson(json)

        assertNotNull(stats)
        assertEquals(0, stats!!.total)
        assertEquals(0, stats.pending)
    }

    @Test
    fun `RumorDetail with empty arrays`() {
        val json = """{"id": 1, "code": "OH-001", "title": "", "description": "", "status": "pending", "priority": "medium", "risk_level": "unknown", "source": "mobile", "region": "", "department": "", "created_at": "", "photos": [], "validations": [], "feedback": []}"""
        val adapter = moshi.adapter(RumorDetail::class.java)
        val detail = adapter.fromJson(json)

        assertNotNull(detail)
        assertTrue(detail!!.photos.isEmpty())
        assertTrue(detail.validations.isEmpty())
        assertTrue(detail.feedback.isEmpty())
    }

    @Test
    fun `RumorUpdateRequest serializes with null fields`() {
        val adapter = moshi.adapter(RumorUpdateRequest::class.java)
        val request = RumorUpdateRequest(status = "confirmed")
        val json = adapter.toJson(request)

        assertTrue(json.contains("\"status\":\"confirmed\""))
    }
}
