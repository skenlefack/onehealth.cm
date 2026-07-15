package cm.onehealth.cohrm.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.components.CohrmTopBar
import cm.onehealth.cohrm.ui.screens.dashboard.DashboardScreen
import cm.onehealth.cohrm.ui.screens.history.HistoryScreen
import cm.onehealth.cohrm.ui.screens.login.LoginScreen
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import cm.onehealth.cohrm.ui.screens.report.ReportWizardScreen
import cm.onehealth.cohrm.ui.screens.rumors.RumorDetailScreen
import cm.onehealth.cohrm.ui.screens.rumors.RumorsListScreen
import cm.onehealth.cohrm.ui.screens.scanner.ScanDetailScreen
import cm.onehealth.cohrm.ui.screens.scanner.ScannerScreen
import cm.onehealth.cohrm.data.remote.AuthInterceptor
import cm.onehealth.cohrm.ui.screens.notifications.NotificationPrefsScreen
import cm.onehealth.cohrm.ui.screens.notifications.NotificationsScreen
import cm.onehealth.cohrm.ui.screens.reports.ReportsScreen
import cm.onehealth.cohrm.ui.screens.notifications.NotificationsViewModel
import cm.onehealth.cohrm.ui.screens.profile.ProfileScreen
import cm.onehealth.cohrm.ui.screens.settings.SettingsScreen
import cm.onehealth.cohrm.ui.screens.publicreport.PublicReportScreen
import cm.onehealth.cohrm.ui.screens.sms.SmsReportScreen
import cm.onehealth.cohrm.ui.screens.splash.SplashScreen
import cm.onehealth.cohrm.ui.screens.validation.ValidationScreen
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.datastore.preferences.core.edit
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val DASHBOARD = "dashboard"
    const val RUMORS = "rumors"
    const val RUMOR_DETAIL = "rumor/{rumorId}"
    const val VALIDATION = "validation/{rumorId}"
    const val REPORT = "report?id={id}"
    const val HISTORY = "history"
    const val SMS = "sms"
    const val SETTINGS = "settings"

    const val SCANNER = "scanner"
    const val SCAN_DETAIL = "scan/{scanId}"
    const val PROFILE = "profile"
    const val NOTIFICATIONS = "notifications"
    const val NOTIFICATION_PREFS = "notification_prefs"
    const val REPORTS = "reports"
    const val PUBLIC_REPORT = "public_report"

    fun report(id: String? = null): String =
        if (id != null) "report?id=$id" else "report"

    fun rumorDetail(id: Int): String = "rumor/$id"
    fun validation(id: Int): String = "validation/$id"
    fun scanDetail(id: Int): String = "scan/$id"
}

data class BottomNavItem(
    val route: String,
    val labelRes: Int,
    val icon: ImageVector,
)

@EntryPoint
@InstallIn(SingletonComponent::class)
interface DataStoreEntryPoint {
    fun dataStore(): DataStore<Preferences>
    fun authInterceptor(): AuthInterceptor
}

private val baseNavItems = listOf(
    BottomNavItem(Routes.DASHBOARD, R.string.nav_dashboard, Icons.Default.Dashboard),
    BottomNavItem(Routes.RUMORS, R.string.nav_rumors, Icons.AutoMirrored.Filled.List),
    BottomNavItem(Routes.HISTORY, R.string.nav_history, Icons.Default.History),
    BottomNavItem(Routes.SETTINGS, R.string.nav_settings, Icons.Default.Settings),
)

private val scannerNavItem = BottomNavItem(Routes.SCANNER, R.string.nav_scanner, Icons.Default.Search)

@Composable
fun CohrmNavigation() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    val scope = rememberCoroutineScope()
    val notificationsViewModel: NotificationsViewModel = hiltViewModel()
    val notificationCount by notificationsViewModel.unreadCount.collectAsStateWithLifecycle()

    // Read user info and scanner access from DataStore - re-check when navigation changes
    val context = LocalContext.current
    var showScanner by remember { mutableStateOf(false) }
    var userName by remember { mutableStateOf("") }
    var userRole by remember { mutableStateOf("") }
    var userAvatar by remember { mutableStateOf<String?>(null) }
    val currentRoute = currentDestination?.route
    LaunchedEffect(currentRoute) {
        try {
            val entryPoint = EntryPointAccessors.fromApplication(
                context.applicationContext,
                DataStoreEntryPoint::class.java,
            )
            val prefs = entryPoint.dataStore().data.first()
            val role = prefs[LoginViewModel.USER_ROLE] ?: ""
            val level = prefs[LoginViewModel.ACTOR_LEVEL] ?: 0
            showScanner = role == "admin" || level >= 4
            userName = prefs[LoginViewModel.USER_NAME] ?: ""
            userRole = prefs[LoginViewModel.ACTOR_LEVEL_LABEL] ?: role
            userAvatar = prefs[LoginViewModel.USER_AVATAR]
        } catch (_: Exception) {}
    }

    val bottomNavItems = remember(showScanner) {
        if (showScanner) {
            listOf(
                baseNavItems[0],
                baseNavItems[1],
                scannerNavItem,
                baseNavItems[2],
                baseNavItems[3],
            )
        } else {
            baseNavItems
        }
    }

    val showBottomBar = currentDestination?.route in bottomNavItems.map { it.route }

    Scaffold(
        topBar = {
            if (showBottomBar) {
                CohrmTopBar(
                    userName = userName,
                    userRole = userRole,
                    userAvatar = userAvatar,
                    onProfileClick = { navController.navigate(Routes.PROFILE) },
                    onNotificationsClick = { navController.navigate(Routes.NOTIFICATIONS) },
                    notificationCount = notificationCount,
                    onLogout = {
                        // Clear token cache and DataStore, then navigate to login
                        val entryPoint = EntryPointAccessors.fromApplication(
                            context.applicationContext,
                            DataStoreEntryPoint::class.java,
                        )
                        entryPoint.authInterceptor().clearToken()
                        scope.launch {
                            try {
                                entryPoint.dataStore().edit { it.clear() }
                            } catch (_: Exception) {}
                        }
                        navController.navigate(Routes.LOGIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                )
            }
        },
        bottomBar = {
            if (showBottomBar) {
                CohrmBottomBar(navController = navController, items = bottomNavItems)
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Routes.SPLASH,
            modifier = Modifier.padding(paddingValues),
        ) {
            composable(Routes.SPLASH) {
                SplashScreen(
                    onNavigateToLogin = {
                        navController.navigate(Routes.LOGIN) {
                            popUpTo(Routes.SPLASH) { inclusive = true }
                        }
                    },
                    onNavigateToHome = {
                        navController.navigate(Routes.DASHBOARD) {
                            popUpTo(Routes.SPLASH) { inclusive = true }
                        }
                    },
                )
            }

            composable(Routes.LOGIN) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Routes.DASHBOARD) {
                            popUpTo(Routes.LOGIN) { inclusive = true }
                        }
                    },
                    onPublicReport = {
                        navController.navigate(Routes.PUBLIC_REPORT)
                    },
                )
            }

            composable(Routes.DASHBOARD) {
                DashboardScreen(
                    onNewReport = { navController.navigate(Routes.report()) },
                    onRumorClick = { id -> navController.navigate(Routes.rumorDetail(id)) },
                    onViewAllRumors = { navController.navigate(Routes.RUMORS) },
                    onViewReports = { navController.navigate(Routes.REPORTS) },
                )
            }

            composable(Routes.RUMORS) {
                RumorsListScreen(
                    onRumorClick = { id -> navController.navigate(Routes.rumorDetail(id)) },
                )
            }

            composable(
                route = Routes.RUMOR_DETAIL,
                arguments = listOf(navArgument("rumorId") { type = NavType.IntType }),
            ) {
                RumorDetailScreen(
                    onBack = { navController.popBackStack() },
                    onValidate = { id -> navController.navigate(Routes.validation(id)) },
                )
            }

            composable(
                route = Routes.VALIDATION,
                arguments = listOf(navArgument("rumorId") { type = NavType.IntType }),
            ) {
                ValidationScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(
                route = "report?id={id}",
                arguments = listOf(
                    navArgument("id") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    }
                )
            ) { backStackEntry ->
                val reportId = backStackEntry.arguments?.getString("id")
                ReportWizardScreen(
                    reportId = reportId,
                    onFinished = { navController.popBackStack() },
                )
            }

            composable(Routes.HISTORY) {
                HistoryScreen(
                    onEditReport = { id -> navController.navigate(Routes.report(id)) },
                )
            }

            composable(Routes.SMS) {
                SmsReportScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SETTINGS) {
                SettingsScreen(
                    onLogout = {
                        navController.navigate(Routes.LOGIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    onNotificationPrefs = {
                        navController.navigate(Routes.NOTIFICATION_PREFS)
                    },
                )
            }

            composable(Routes.SCANNER) {
                ScannerScreen(
                    onScanClick = { id -> navController.navigate(Routes.scanDetail(id)) },
                )
            }

            composable(
                route = Routes.SCAN_DETAIL,
                arguments = listOf(navArgument("scanId") { type = NavType.IntType }),
            ) {
                ScanDetailScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.PROFILE) {
                ProfileScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.NOTIFICATIONS) {
                NotificationsScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.REPORTS) {
                ReportsScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.NOTIFICATION_PREFS) {
                NotificationPrefsScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.PUBLIC_REPORT) {
                PublicReportScreen(onBack = { navController.popBackStack() })
            }
        }
    }
}

@Composable
private fun CohrmBottomBar(navController: NavHostController, items: List<BottomNavItem>) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    NavigationBar {
        items.forEach { item ->
            val selected = currentDestination?.hierarchy?.any { it.route == item.route } == true
            NavigationBarItem(
                selected = selected,
                onClick = {
                    navController.navigate(item.route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                icon = { Icon(item.icon, contentDescription = stringResource(item.labelRes)) },
                label = { Text(stringResource(item.labelRes)) },
            )
        }
    }
}
