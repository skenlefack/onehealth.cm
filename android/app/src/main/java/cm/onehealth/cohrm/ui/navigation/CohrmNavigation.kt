package cm.onehealth.cohrm.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cm.onehealth.cohrm.ui.theme.*
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
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
import cm.onehealth.cohrm.data.remote.AuthInterceptor
import cm.onehealth.cohrm.ui.components.CohrmTopBar
import cm.onehealth.cohrm.ui.screens.dashboard.DashboardScreen
import cm.onehealth.cohrm.ui.screens.dussc.DusscHomeScreen
import cm.onehealth.cohrm.ui.screens.dussc.DusscQuizScreen
import cm.onehealth.cohrm.ui.screens.elearning.*
import cm.onehealth.cohrm.ui.screens.history.HistoryScreen
import cm.onehealth.cohrm.ui.screens.login.LoginScreen
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import cm.onehealth.cohrm.ui.screens.notifications.NotificationPrefsScreen
import cm.onehealth.cohrm.ui.screens.notifications.NotificationsScreen
import cm.onehealth.cohrm.ui.screens.notifications.NotificationsViewModel
import cm.onehealth.cohrm.ui.screens.ohwr.*
import cm.onehealth.cohrm.ui.screens.platform.PlatformHomeScreen
import cm.onehealth.cohrm.ui.screens.platform.PostDetailScreen
import cm.onehealth.cohrm.ui.screens.profile.ProfileScreen
import cm.onehealth.cohrm.ui.screens.publicreport.PublicReportScreen
import cm.onehealth.cohrm.ui.screens.report.ReportWizardScreen
import cm.onehealth.cohrm.ui.screens.reports.ReportsScreen
import cm.onehealth.cohrm.ui.screens.cohrm.ActorsScreen
import cm.onehealth.cohrm.ui.screens.cohrm.RumorsMapScreen
import cm.onehealth.cohrm.ui.screens.cohrm.SmsManagerScreen
import cm.onehealth.cohrm.ui.screens.rumors.RumorDetailScreen
import cm.onehealth.cohrm.ui.screens.rumors.RumorsListScreen
import cm.onehealth.cohrm.ui.screens.scanner.ScanDetailScreen
import cm.onehealth.cohrm.ui.screens.scanner.ScannerScreen
import cm.onehealth.cohrm.ui.screens.settings.SettingsScreen
import cm.onehealth.cohrm.ui.screens.sms.SmsReportScreen
import cm.onehealth.cohrm.ui.screens.splash.SplashScreen
import cm.onehealth.cohrm.ui.screens.validation.ValidationScreen
import cm.onehealth.cohrm.util.NetworkMonitor
import androidx.hilt.navigation.compose.hiltViewModel
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val PLATFORM_HOME = "platform_home"

    // COHRM
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

    // E-Learning
    const val EL_HOME = "elearning/home"
    const val EL_COURSES = "elearning/courses"
    const val EL_COURSE_DETAIL = "elearning/courses/{slug}"
    const val EL_LESSON = "elearning/lessons/{lessonId}"
    const val EL_QUIZ = "elearning/quizzes/{quizId}"
    const val EL_MY_LEARNING = "elearning/my_learning"
    const val EL_CERTIFICATES = "elearning/certificates"
    const val EL_PATHS = "elearning/paths"
    const val EL_PATH_DETAIL = "elearning/paths/{slug}"

    // Rumors Map
    const val RUMORS_MAP = "rumors_map"

    // SMS Manager
    const val SMS_MANAGER = "sms_manager"

    // Actors
    const val ACTORS = "actors"

    // DUSS-C
    const val DUSSC_HOME = "dussc/home"
    const val DUSSC_QUIZ = "dussc/quiz/{profil}"

    // OHWR
    const val OHWR_HOME = "ohwr/home"
    const val OHWR_EXPERTS = "ohwr/experts"
    const val OHWR_EXPERT_DETAIL = "ohwr/experts/{expertId}"
    const val OHWR_ORGANIZATIONS = "ohwr/organizations"
    const val OHWR_MATERIALS = "ohwr/materials"
    const val OHWR_DOCUMENTS = "ohwr/documents"
    const val OHWR_MAP = "ohwr/map"
    const val OHWR_DOCUMENT_DETAIL = "ohwr/document/{documentId}"
    const val OHWR_SUBMIT = "ohwr/submit"
    const val OHWR_MY_SUBMISSIONS = "ohwr/my-submissions"

    // E-Learning extra
    const val EL_CERTIFICATE_VERIFY = "elearning/certificate/verify"

    // Posts
    const val POST_DETAIL = "post/{slug}"
    fun postDetail(slug: String): String = "post/$slug"

    fun report(id: String? = null): String =
        if (id != null) "report?id=$id" else "report"

    fun rumorDetail(id: Int): String = "rumor/$id"
    fun validation(id: Int): String = "validation/$id"
    fun scanDetail(id: Int): String = "scan/$id"
    fun elCourseDetail(slug: String): String = "elearning/courses/$slug"
    fun elLesson(id: Int): String = "elearning/lessons/$id"
    fun elQuiz(id: Int): String = "elearning/quizzes/$id"
    fun elPathDetail(slug: String): String = "elearning/paths/$slug"
    fun dusscQuiz(profil: String): String = "dussc/quiz/$profil"
    fun ohwrExpertDetail(id: Int): String = "ohwr/experts/$id"
    fun ohwrDocumentDetail(id: Int): String = "ohwr/document/$id"
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
    fun networkMonitor(): NetworkMonitor
}

// COHRM bottom nav
private val cohrmNavItems = listOf(
    BottomNavItem(Routes.DASHBOARD, R.string.nav_dashboard, Icons.Default.Dashboard),
    BottomNavItem(Routes.RUMORS, R.string.nav_rumors, Icons.AutoMirrored.Filled.List),
    BottomNavItem(Routes.HISTORY, R.string.nav_history, Icons.Default.History),
    BottomNavItem(Routes.SETTINGS, R.string.nav_settings, Icons.Default.Settings),
)
private val scannerNavItem = BottomNavItem(Routes.SCANNER, R.string.nav_scanner, Icons.Default.Search)

// E-Learning bottom nav
private val elNavItems = listOf(
    BottomNavItem(Routes.EL_HOME, R.string.el_nav_home, Icons.Default.Home),
    BottomNavItem(Routes.EL_COURSES, R.string.el_nav_courses, Icons.Default.MenuBook),
    BottomNavItem(Routes.EL_MY_LEARNING, R.string.el_nav_my_learning, Icons.Default.School),
    BottomNavItem(Routes.EL_CERTIFICATES, R.string.el_nav_certificates, Icons.Default.EmojiEvents),
)

// OHWR bottom nav
private val ohwrNavItems = listOf(
    BottomNavItem(Routes.OHWR_HOME, R.string.ohwr_nav_home, Icons.Default.Home),
    BottomNavItem(Routes.OHWR_EXPERTS, R.string.ohwr_nav_experts, Icons.Default.People),
    BottomNavItem(Routes.OHWR_MAP, R.string.ohwr_nav_map, Icons.Default.Map),
    BottomNavItem(Routes.OHWR_DOCUMENTS, R.string.ohwr_nav_documents, Icons.Default.Description),
)

private fun getModuleContext(route: String?): String? = when {
    route == null -> null
    route.startsWith("elearning/") -> "elearning"
    route.startsWith("dussc/") -> "dussc"
    route.startsWith("ohwr/") -> "ohwr"
    route.startsWith("post/") -> "post"
    route in listOf(Routes.DASHBOARD, Routes.RUMORS, Routes.HISTORY, Routes.SETTINGS, Routes.SCANNER) -> "cohrm"
    else -> null
}

@Composable
fun CohrmNavigation() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    val scope = rememberCoroutineScope()
    val notificationsViewModel: NotificationsViewModel = hiltViewModel()
    val notificationCount by notificationsViewModel.unreadCount.collectAsStateWithLifecycle()

    val context = LocalContext.current
    val networkEntryPoint = remember {
        EntryPointAccessors.fromApplication(context.applicationContext, DataStoreEntryPoint::class.java)
    }
    val isOnline by networkEntryPoint.networkMonitor().isOnline.collectAsStateWithLifecycle()

    var showScanner by remember { mutableStateOf(false) }
    var userName by remember { mutableStateOf("") }
    var userRole by remember { mutableStateOf("") }
    var userAvatar by remember { mutableStateOf<String?>(null) }
    val currentRoute = currentDestination?.route

    LaunchedEffect(currentRoute) {
        try {
            val entryPoint = EntryPointAccessors.fromApplication(context.applicationContext, DataStoreEntryPoint::class.java)
            val prefs = entryPoint.dataStore().data.first()
            val role = prefs[LoginViewModel.USER_ROLE] ?: ""
            val level = prefs[LoginViewModel.ACTOR_LEVEL] ?: 0
            showScanner = role == "admin" || level >= 4
            userName = prefs[LoginViewModel.USER_NAME] ?: ""
            userRole = prefs[LoginViewModel.ACTOR_LEVEL_LABEL] ?: role
            userAvatar = prefs[LoginViewModel.USER_AVATAR]
        } catch (_: Exception) {}
    }

    val moduleContext = getModuleContext(currentRoute)

    val bottomNavItems = remember(showScanner, moduleContext) {
        when (moduleContext) {
            "cohrm" -> if (showScanner) {
                listOf(cohrmNavItems[0], cohrmNavItems[1], scannerNavItem, cohrmNavItems[2], cohrmNavItems[3])
            } else cohrmNavItems
            "elearning" -> elNavItems
            "ohwr" -> ohwrNavItems
            else -> emptyList()
        }
    }

    val showBottomBar = bottomNavItems.isNotEmpty() && currentRoute in bottomNavItems.map { it.route }
    val hideTopBar = currentRoute in listOf(Routes.SPLASH, Routes.LOGIN, Routes.PLATFORM_HOME, null)
    val showTopBar = !hideTopBar

    fun performLogout() {
        val entryPoint = EntryPointAccessors.fromApplication(context.applicationContext, DataStoreEntryPoint::class.java)
        entryPoint.authInterceptor().clearToken()
        scope.launch { try { entryPoint.dataStore().edit { it.clear() } } catch (_: Exception) {} }
        navController.navigate(Routes.LOGIN) { popUpTo(0) { inclusive = true } }
    }

    // Module sub-bar info
    data class ModuleBarInfo(val title: String, val icon: ImageVector, val color: Color)

    val moduleBarInfo: ModuleBarInfo? = when (moduleContext) {
        "cohrm" -> ModuleBarInfo(stringResource(R.string.platform_cohrm_title), Icons.Default.Warning, Primary)
        "elearning" -> ModuleBarInfo(stringResource(R.string.platform_elearning_title), Icons.Default.School, ELearningPrimary)
        "dussc" -> ModuleBarInfo(stringResource(R.string.platform_dussc_title), Icons.Default.Quiz, DusscPrimary)
        "ohwr" -> ModuleBarInfo(stringResource(R.string.platform_ohwr_title), Icons.Default.Map, OhwrPrimary)
        "post" -> ModuleBarInfo(stringResource(R.string.platform_latest_posts), Icons.Default.Article, Color(0xFF1A7A5A))
        else -> null
    }

    Scaffold(
        topBar = {
            if (showTopBar) {
                Column {
                    CohrmTopBar(
                        userName = userName,
                        userRole = userRole,
                        userAvatar = userAvatar,
                        onProfileClick = { navController.navigate(Routes.PROFILE) },
                        onNotificationsClick = { navController.navigate(Routes.NOTIFICATIONS) },
                        notificationCount = notificationCount,
                        isOnline = isOnline,
                        onLogout = { performLogout() },
                    )
                    if (moduleBarInfo != null) {
                        ModuleSubBar(
                            title = moduleBarInfo.title,
                            icon = moduleBarInfo.icon,
                            color = moduleBarInfo.color,
                            onBack = { navController.navigate(Routes.PLATFORM_HOME) { popUpTo(Routes.PLATFORM_HOME) { inclusive = true } } },
                        )
                    }
                }
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
            // --- Auth ---
            composable(Routes.SPLASH) {
                SplashScreen(
                    onNavigateToLogin = { navController.navigate(Routes.LOGIN) { popUpTo(Routes.SPLASH) { inclusive = true } } },
                    onNavigateToHome = { navController.navigate(Routes.PLATFORM_HOME) { popUpTo(Routes.SPLASH) { inclusive = true } } },
                )
            }
            composable(Routes.LOGIN) {
                LoginScreen(
                    onLoginSuccess = { navController.navigate(Routes.PLATFORM_HOME) { popUpTo(Routes.LOGIN) { inclusive = true } } },
                    onPublicReport = { navController.navigate(Routes.PUBLIC_REPORT) },
                )
            }

            // --- Platform Home ---
            composable(Routes.PLATFORM_HOME) {
                PlatformHomeScreen(
                    onNavigateToCohrm = { navController.navigate(Routes.DASHBOARD) },
                    onNavigateToELearning = { navController.navigate(Routes.EL_HOME) },
                    onNavigateToDussc = { navController.navigate(Routes.DUSSC_HOME) },
                    onNavigateToOhwr = { navController.navigate(Routes.OHWR_HOME) },
                    onNavigateToNotifications = { navController.navigate(Routes.NOTIFICATIONS) },
                    onNavigateToProfile = { navController.navigate(Routes.PROFILE) },
                    onPostClick = { slug -> navController.navigate(Routes.postDetail(slug)) },
                )
            }
            composable(Routes.POST_DETAIL, arguments = listOf(navArgument("slug") { type = NavType.StringType })) {
                PostDetailScreen(onBack = { navController.popBackStack() })
            }

            // --- COHRM (existing) ---
            composable(Routes.DASHBOARD) {
                DashboardScreen(
                    onNewReport = { navController.navigate(Routes.report()) },
                    onRumorClick = { id -> navController.navigate(Routes.rumorDetail(id)) },
                    onViewAllRumors = { navController.navigate(Routes.RUMORS) },
                    onViewReports = { navController.navigate(Routes.REPORTS) },
                )
            }
            composable(Routes.RUMORS) {
                RumorsListScreen(onRumorClick = { id -> navController.navigate(Routes.rumorDetail(id)) })
            }
            composable(Routes.RUMOR_DETAIL, arguments = listOf(navArgument("rumorId") { type = NavType.IntType })) {
                RumorDetailScreen(onBack = { navController.popBackStack() }, onValidate = { id -> navController.navigate(Routes.validation(id)) })
            }
            composable(Routes.VALIDATION, arguments = listOf(navArgument("rumorId") { type = NavType.IntType })) {
                ValidationScreen(onBack = { navController.popBackStack() })
            }
            composable("report?id={id}", arguments = listOf(navArgument("id") { type = NavType.StringType; nullable = true; defaultValue = null })) { backStackEntry ->
                ReportWizardScreen(reportId = backStackEntry.arguments?.getString("id"), onFinished = { navController.popBackStack() })
            }
            composable(Routes.HISTORY) { HistoryScreen(onEditReport = { id -> navController.navigate(Routes.report(id)) }) }
            composable(Routes.SMS) { SmsReportScreen(onBack = { navController.popBackStack() }) }
            composable(Routes.SETTINGS) {
                SettingsScreen(
                    onLogout = { performLogout() },
                    onNotificationPrefs = { navController.navigate(Routes.NOTIFICATION_PREFS) },
                )
            }
            composable(Routes.SCANNER) { ScannerScreen(onScanClick = { id -> navController.navigate(Routes.scanDetail(id)) }) }
            composable(Routes.SCAN_DETAIL, arguments = listOf(navArgument("scanId") { type = NavType.IntType })) {
                ScanDetailScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.PROFILE) { ProfileScreen(onBack = { navController.popBackStack() }, onLogout = { performLogout() }) }
            composable(Routes.NOTIFICATIONS) { NotificationsScreen(onBack = { navController.popBackStack() }) }
            composable(Routes.REPORTS) { ReportsScreen(onBack = { navController.popBackStack() }) }
            composable(Routes.NOTIFICATION_PREFS) { NotificationPrefsScreen(onBack = { navController.popBackStack() }) }
            composable(Routes.PUBLIC_REPORT) { PublicReportScreen(onBack = { navController.popBackStack() }) }
            composable(Routes.RUMORS_MAP) {
                RumorsMapScreen(
                    onRumorClick = { id -> navController.navigate(Routes.rumorDetail(id)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.SMS_MANAGER) {
                SmsManagerScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.ACTORS) {
                ActorsScreen(onBack = { navController.popBackStack() })
            }

            // --- E-Learning ---
            composable(Routes.EL_HOME) {
                ELearningHomeScreen(
                    onCourseClick = { slug -> navController.navigate(Routes.elCourseDetail(slug)) },
                    onViewAllCourses = { navController.navigate(Routes.EL_COURSES) },
                    onViewMyLearning = { navController.navigate(Routes.EL_MY_LEARNING) },
                    onViewPaths = { navController.navigate(Routes.EL_PATHS) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.EL_COURSES) {
                CourseListScreen(
                    onCourseClick = { slug -> navController.navigate(Routes.elCourseDetail(slug)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.EL_COURSE_DETAIL, arguments = listOf(navArgument("slug") { type = NavType.StringType })) { backStackEntry ->
                CourseDetailScreen(
                    slug = backStackEntry.arguments?.getString("slug") ?: "",
                    onLessonClick = { id -> navController.navigate(Routes.elLesson(id)) },
                    onQuizClick = { id -> navController.navigate(Routes.elQuiz(id)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.EL_LESSON, arguments = listOf(navArgument("lessonId") { type = NavType.IntType })) {
                LessonScreen(
                    onQuizClick = { id -> navController.navigate(Routes.elQuiz(id)) },
                    onNextLesson = { id -> navController.navigate(Routes.elLesson(id)) { popUpTo(Routes.EL_HOME) } },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.EL_QUIZ, arguments = listOf(navArgument("quizId") { type = NavType.IntType })) {
                QuizScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.EL_MY_LEARNING) {
                MyLearningScreen(
                    onCourseClick = { slug -> navController.navigate(Routes.elCourseDetail(slug)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.EL_CERTIFICATES) {
                CertificatesScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.EL_PATHS) {
                PathsScreen(
                    onPathClick = { slug -> navController.navigate(Routes.elPathDetail(slug)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.EL_PATH_DETAIL, arguments = listOf(navArgument("slug") { type = NavType.StringType })) { backStackEntry ->
                PathDetailScreen(
                    slug = backStackEntry.arguments?.getString("slug") ?: "",
                    onCourseClick = { slug -> navController.navigate(Routes.elCourseDetail(slug)) },
                    onBack = { navController.popBackStack() },
                )
            }

            // --- DUSS-C ---
            composable(Routes.DUSSC_HOME) {
                DusscHomeScreen(
                    onStartQuiz = { profil -> navController.navigate(Routes.dusscQuiz(profil)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.DUSSC_QUIZ, arguments = listOf(navArgument("profil") { type = NavType.StringType })) {
                DusscQuizScreen(onBack = { navController.popBackStack() })
            }

            // --- OHWR ---
            composable(Routes.OHWR_HOME) {
                OhwrHomeScreen(
                    onExpertsClick = { navController.navigate(Routes.OHWR_EXPERTS) },
                    onOrganizationsClick = { navController.navigate(Routes.OHWR_ORGANIZATIONS) },
                    onMaterialsClick = { navController.navigate(Routes.OHWR_MATERIALS) },
                    onDocumentsClick = { navController.navigate(Routes.OHWR_DOCUMENTS) },
                    onMapClick = { navController.navigate(Routes.OHWR_MAP) },
                    onSubmitClick = { navController.navigate(Routes.OHWR_SUBMIT) },
                    onMySubmissionsClick = { navController.navigate(Routes.OHWR_MY_SUBMISSIONS) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.OHWR_EXPERTS) {
                OhwrExpertsScreen(
                    onExpertClick = { id -> navController.navigate(Routes.ohwrExpertDetail(id)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.OHWR_EXPERT_DETAIL, arguments = listOf(navArgument("expertId") { type = NavType.IntType })) {
                OhwrExpertDetailScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.OHWR_ORGANIZATIONS) {
                OhwrOrganizationsScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.OHWR_MATERIALS) {
                OhwrMaterialsScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.OHWR_DOCUMENTS) {
                OhwrDocumentsScreen(
                    onDocumentClick = { id -> navController.navigate(Routes.ohwrDocumentDetail(id)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.OHWR_DOCUMENT_DETAIL, arguments = listOf(navArgument("documentId") { type = NavType.IntType })) {
                OhwrDocumentDetailScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.OHWR_MAP) {
                OhwrMapScreen(
                    onNavigateToExpert = { id -> navController.navigate(Routes.ohwrExpertDetail(id)) },
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Routes.OHWR_SUBMIT) {
                OhwrSubmitScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.OHWR_MY_SUBMISSIONS) {
                OhwrMySubmissionsScreen(onBack = { navController.popBackStack() })
            }

            // --- E-Learning: Certificate Verify ---
            composable(Routes.EL_CERTIFICATE_VERIFY) {
                CertificateVerifyScreen(onBack = { navController.popBackStack() })
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
                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
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

@Composable
private fun ModuleSubBar(title: String, icon: ImageVector, color: Color, onBack: () -> Unit) {
    Surface(
        shadowElevation = 2.dp,
        color = color,
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().height(40.dp).padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(icon, contentDescription = null, tint = Color.White.copy(alpha = 0.9f), modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(title, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            Box(
                modifier = Modifier.size(28.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.2f)).clickable(onClick = onBack),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
            }
        }
    }
}
