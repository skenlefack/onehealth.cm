package cm.onehealth.cohrm.data

import cm.onehealth.cohrm.data.remote.dto.*
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class DtoSerializationTest {

    private lateinit var moshi: Moshi

    @Before
    fun setup() {
        moshi = Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()
    }

    @Test
    fun `deserialize login response`() {
        val json = """
        {
            "success": true,
            "token": "eyJhbGciOiJIUzI1NiJ9.test",
            "user": {
                "id": 1,
                "username": "admin",
                "email": "admin@onehealth.cm",
                "first_name": "Admin",
                "last_name": "User",
                "role": "admin"
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(LoginResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertNotNull(response.token)
        assertEquals("admin", response.user?.username)
    }

    @Test
    fun `deserialize dashboard stats`() {
        val json = """
        {
            "total": 100,
            "pending": 20,
            "investigating": 15,
            "confirmed": 10,
            "false_alarm": 5,
            "closed": 50,
            "high_priority": 8,
            "critical": 3,
            "today_count": 5,
            "week_count": 25,
            "month_count": 80
        }
        """.trimIndent()

        val adapter = moshi.adapter(DashboardStats::class.java)
        val stats = adapter.fromJson(json)

        assertNotNull(stats)
        assertEquals(100, stats!!.total)
        assertEquals(20, stats.pending)
        assertEquals(5, stats.falseAlarm)
        assertEquals(8, stats.highPriority)
        assertEquals(5, stats.todayCount)
    }

    @Test
    fun `deserialize notification item`() {
        val json = """
        {
            "id": 42,
            "notification_type": "escalation",
            "status": "sent",
            "subject": "Rumeur escaladee au niveau 3",
            "recipient_email": "validator@onehealth.cm",
            "rumor_code": "RUM-2026-0042",
            "rumor_title": "Cas suspects de cholera",
            "channel": "email",
            "created_at": "2026-04-20T14:30:00Z"
        }
        """.trimIndent()

        val adapter = moshi.adapter(NotificationItem::class.java)
        val item = adapter.fromJson(json)

        assertNotNull(item)
        assertEquals(42, item!!.id)
        assertEquals("escalation", item.notificationType)
        assertEquals("RUM-2026-0042", item.rumorCode)
    }

    @Test
    fun `deserialize report response`() {
        val json = """
        {
            "success": true,
            "message": "Signalement recu",
            "data": {
                "rumor_id": 55,
                "code": "RUM-2026-0055"
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(ReportResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(55, response.data?.rumorId)
        assertEquals("RUM-2026-0055", response.data?.code)
    }

    @Test
    fun `deserialize chart items`() {
        val json = """
        {
            "name": "Centre",
            "value": 35,
            "key": "centre",
            "color": "#3498DB"
        }
        """.trimIndent()

        val adapter = moshi.adapter(ChartItem::class.java)
        val item = adapter.fromJson(json)

        assertNotNull(item)
        assertEquals("Centre", item!!.name)
        assertEquals(35, item.value)
    }

    @Test
    fun `deserialize sync response`() {
        val json = """
        {
            "success": true,
            "data": {
                "sms_codes": [
                    {"id": 1, "code": "SH", "label_fr": "Sante Humaine", "label_en": "Human Health", "category": "category"}
                ],
                "regions": [
                    {"code": "CE", "name": "Centre", "departments": ["Mfoundi", "Lekie"]}
                ]
            }
        }
        """.trimIndent()

        val adapter = moshi.adapter(SyncResponse::class.java)
        val response = adapter.fromJson(json)

        assertNotNull(response)
        assertTrue(response!!.success)
        assertEquals(1, response.data?.smsCodes?.size)
        assertEquals("SH", response.data?.smsCodes?.first()?.code)
    }

    @Test
    fun `serialize report request`() {
        val request = ReportRequest(
            title = "Test Report",
            description = "Test description",
            region = "Centre",
            category = "human_health"
        )

        val adapter = moshi.adapter(ReportRequest::class.java)
        val json = adapter.toJson(request)

        assertNotNull(json)
        assertTrue(json.contains("Test Report"))
        assertTrue(json.contains("Centre"))
    }
}
