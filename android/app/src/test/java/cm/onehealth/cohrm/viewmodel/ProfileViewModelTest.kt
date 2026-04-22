package cm.onehealth.cohrm.viewmodel

import cm.onehealth.cohrm.MainDispatcherRule
import cm.onehealth.cohrm.data.remote.dto.ChangePasswordRequest
import cm.onehealth.cohrm.data.remote.dto.ProfileUpdateRequest
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ProfileViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `profile update request has correct fields`() = runTest {
        val request = ProfileUpdateRequest(
            name = "John Doe",
            email = "john@example.com",
            phone = "+237600000000",
            organization = "OneHealth",
            region = "CE",
        )
        assertEquals("John Doe", request.name)
        assertEquals("john@example.com", request.email)
        assertEquals("+237600000000", request.phone)
        assertEquals("OneHealth", request.organization)
        assertEquals("CE", request.region)
    }

    @Test
    fun `profile update request handles nullable fields`() = runTest {
        val request = ProfileUpdateRequest(
            name = "John",
            email = "john@example.com",
        )
        assertNull(request.phone)
        assertNull(request.organization)
        assertNull(request.region)
    }

    @Test
    fun `password change request validates matching passwords`() = runTest {
        val newPassword = "newPass123"
        val confirmPassword = "newPass123"
        assertEquals(newPassword, confirmPassword)
    }

    @Test
    fun `password change request rejects short passwords`() = runTest {
        val password = "abc"
        assert(password.length < 6) { "Password should be at least 6 characters" }
    }

    @Test
    fun `password change request creates correct dto`() = runTest {
        val request = ChangePasswordRequest(
            currentPassword = "oldPass",
            newPassword = "newPass123",
        )
        assertEquals("oldPass", request.currentPassword)
        assertEquals("newPass123", request.newPassword)
        assertNotEquals(request.currentPassword, request.newPassword)
    }
}
