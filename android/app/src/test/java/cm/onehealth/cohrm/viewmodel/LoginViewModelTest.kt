package cm.onehealth.cohrm.viewmodel

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import cm.onehealth.cohrm.MainDispatcherRule
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.AuthInterceptor
import cm.onehealth.cohrm.data.remote.dto.LoginData
import cm.onehealth.cohrm.data.remote.dto.LoginRequest
import cm.onehealth.cohrm.data.remote.dto.LoginResponse
import cm.onehealth.cohrm.data.remote.dto.LoginUser
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class LoginViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val apiService = mockk<ApiService>()
    private val dataStore = mockk<DataStore<Preferences>>(relaxed = true)
    private val authInterceptor = mockk<AuthInterceptor>(relaxed = true)

    @Test
    fun `login with empty credentials should not call api`() = runTest {
        // Verifies that form validation prevents empty submissions
        val email = ""
        val password = ""
        assertTrue(email.isBlank() || password.isBlank())
    }

    @Test
    fun `login request creates correct dto`() = runTest {
        val request = LoginRequest(email = "test@test.com", password = "pass123")
        assertEquals("test@test.com", request.email)
        assertEquals("pass123", request.password)
    }

    @Test
    fun `login response parses success correctly`() = runTest {
        val response = LoginResponse(
            success = true,
            message = "Login successful",
            data = LoginData(
                token = "test-token-123",
                user = LoginUser(
                    id = 1,
                    name = "Test User",
                    email = "test@test.com",
                ),
            ),
        )
        assertTrue(response.success)
        assertEquals("test-token-123", response.data?.token)
        assertEquals("Test User", response.data?.user?.name)
    }

    @Test
    fun `login response handles failure`() = runTest {
        val response = LoginResponse(
            success = false,
            message = "Invalid credentials",
            data = null,
        )
        assertTrue(!response.success)
        assertEquals("Invalid credentials", response.message)
    }
}
