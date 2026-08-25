package cm.onehealth.cohrm.ui.screens.dussc

import android.content.Intent
import androidx.compose.animation.*
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun DusscQuizScreen(
    onBack: () -> Unit,
    viewModel: DusscQuizViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            if (state.phase != QuizPhase.RESULTS) {
                TopAppBar(
                    title = { Text(stringResource(R.string.dussc_quiz_title)) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = DusscPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
                )
            }
        },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (state.phase) {
                QuizPhase.LOADING -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = DusscPrimary)
                    }
                }
                QuizPhase.QUIZ -> QuizContent(state = state, viewModel = viewModel)
                QuizPhase.SUBMITTING -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = DusscPrimary)
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(stringResource(R.string.dussc_submitting))
                        }
                    }
                }
                QuizPhase.DEMOGRAPHICS -> DemographicsContent(state = state, viewModel = viewModel)
                QuizPhase.RESULTS -> ResultsContent(state = state, onBack = onBack, onRetry = { viewModel.retry() })
                QuizPhase.ERROR -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(state.error ?: "Erreur", color = Danger)
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(onClick = onBack) { Text(stringResource(R.string.close)) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun QuizContent(state: DusscQuizState, viewModel: DusscQuizViewModel) {
    val question = state.currentQuestion ?: return
    val blocColor = when (question.bloc) {
        "pre_test" -> BlocPreTest
        "tronc_commun" -> BlocTroncCommun
        "profil" -> BlocProfil
        "post_test" -> BlocPostTest
        else -> DusscLight
    }
    val blocLabel = when (question.bloc) {
        "pre_test" -> stringResource(R.string.dussc_bloc_pretest)
        "tronc_commun" -> stringResource(R.string.dussc_bloc_common)
        "profil" -> stringResource(R.string.dussc_bloc_profile)
        "post_test" -> stringResource(R.string.dussc_bloc_posttest)
        else -> ""
    }

    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
    ) {
        // Progress header
        Column(
            modifier = Modifier.fillMaxWidth().background(blocColor.copy(alpha = 0.1f)).padding(16.dp),
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Surface(shape = RoundedCornerShape(12.dp), color = blocColor) {
                    Text(blocLabel, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp))
                }
                Text("${state.currentIndex + 1} / ${state.totalQuestions}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { (state.currentIndex + 1).toFloat() / state.totalQuestions.coerceAtLeast(1) },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                color = blocColor,
                trackColor = blocColor.copy(alpha = 0.2f),
            )
        }

        // Question
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                text = question.enonce ?: "",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                lineHeight = 24.sp,
            )

            // Options
            question.options?.forEach { option ->
                val isSelected = state.selectedAnswer == option.letter
                val showFeedback = state.feedback != null
                val isCorrect = state.feedback?.correctAnswer == option.letter
                val borderColor = when {
                    showFeedback && isCorrect -> Success
                    showFeedback && isSelected && !isCorrect -> Danger
                    isSelected -> DusscPrimary
                    else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                }
                val bgColor = when {
                    showFeedback && isCorrect -> Success.copy(alpha = 0.08f)
                    showFeedback && isSelected && !isCorrect -> Danger.copy(alpha = 0.08f)
                    isSelected -> DusscPrimary.copy(alpha = 0.08f)
                    else -> MaterialTheme.colorScheme.surface
                }

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(enabled = !showFeedback) { viewModel.selectAnswer(option.letter) }
                        .border(2.dp, borderColor, RoundedCornerShape(12.dp)),
                    shape = RoundedCornerShape(12.dp),
                    color = bgColor,
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Box(
                            modifier = Modifier.size(32.dp).clip(CircleShape).background(borderColor.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(option.letter, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = borderColor)
                        }
                        Text(option.text, fontSize = 15.sp, modifier = Modifier.weight(1f))
                        if (showFeedback && isCorrect) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Success, modifier = Modifier.size(24.dp))
                        } else if (showFeedback && isSelected && !isCorrect) {
                            Icon(Icons.Default.Cancel, contentDescription = null, tint = Danger, modifier = Modifier.size(24.dp))
                        }
                    }
                }
            }

            // Submit / Next button
            if (state.feedback == null) {
                Button(
                    onClick = { viewModel.submitAnswer() },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    enabled = state.selectedAnswer != null,
                    colors = ButtonDefaults.buttonColors(containerColor = DusscPrimary),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text(stringResource(R.string.dussc_validate_answer), fontWeight = FontWeight.Bold)
                }
            }

            // Feedback
            state.feedback?.let { feedback ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = if (feedback.isCorrect == true) Success.copy(alpha = 0.08f) else Danger.copy(alpha = 0.08f)),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(
                                if (feedback.isCorrect == true) Icons.Default.CheckCircle else Icons.Default.Cancel,
                                contentDescription = null,
                                tint = if (feedback.isCorrect == true) Success else Danger,
                            )
                            Text(
                                if (feedback.isCorrect == true) stringResource(R.string.dussc_correct) else stringResource(R.string.dussc_incorrect),
                                fontWeight = FontWeight.Bold,
                                color = if (feedback.isCorrect == true) Success else Danger,
                            )
                        }
                        if (!feedback.explication.isNullOrBlank()) {
                            Text(feedback.explication, fontSize = 14.sp, lineHeight = 20.sp)
                        }
                        if (!feedback.ideeFausse.isNullOrBlank()) {
                            Text(
                                "${stringResource(R.string.dussc_misconception)} : \u00AB ${feedback.ideeFausse} \u00BB",
                                fontSize = 13.sp,
                                fontStyle = FontStyle.Italic,
                                color = Danger.copy(alpha = 0.8f),
                            )
                        }
                        if (!feedback.action.isNullOrBlank()) {
                            Surface(shape = RoundedCornerShape(8.dp), color = Info.copy(alpha = 0.1f)) {
                                Row(modifier = Modifier.padding(10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Icon(Icons.Default.Lightbulb, contentDescription = null, tint = Info, modifier = Modifier.size(18.dp))
                                    Text(feedback.action, fontSize = 13.sp, color = Info)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { viewModel.nextQuestion() },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = DusscPrimary),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text(
                        if (state.currentIndex >= state.totalQuestions - 1) stringResource(R.string.dussc_finish) else stringResource(R.string.dussc_next_question),
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DemographicsContent(state: DusscQuizState, viewModel: DusscQuizViewModel) {
    val regions = listOf("Adamaoua", "Centre", "Est", "Extr\u00EAme-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest")
    val ageRanges = listOf("<18", "18-25", "26-35", "36-45", "46-55", "56-65", ">65")

    var regionExpanded by remember { mutableStateOf(false) }
    var ageExpanded by remember { mutableStateOf(false) }
    var sexeExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.dussc_demographics_title), fontSize = 20.sp, fontWeight = FontWeight.Bold)

        // Region dropdown
        ExposedDropdownMenuBox(expanded = regionExpanded, onExpandedChange = { regionExpanded = it }) {
            OutlinedTextField(
                value = state.region,
                onValueChange = {},
                readOnly = true,
                label = { Text(stringResource(R.string.dussc_region)) },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = regionExpanded) },
                modifier = Modifier.fillMaxWidth().menuAnchor(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = DusscPrimary, focusedLabelColor = DusscPrimary),
            )
            ExposedDropdownMenu(expanded = regionExpanded, onDismissRequest = { regionExpanded = false }) {
                regions.forEach { region ->
                    DropdownMenuItem(
                        text = { Text(region) },
                        onClick = { viewModel.updateRegion(region); regionExpanded = false },
                    )
                }
            }
        }

        // Milieu toggle buttons
        Text(stringResource(R.string.dussc_milieu), fontSize = 14.sp, fontWeight = FontWeight.Medium)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            listOf(stringResource(R.string.dussc_urban) to "Urbain", stringResource(R.string.dussc_rural) to "Rural").forEach { (label, value) ->
                val isSelected = state.milieu == value
                Surface(
                    modifier = Modifier.weight(1f).clickable { viewModel.updateMilieu(value) },
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) DusscPrimary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = if (isSelected) null else ButtonDefaults.outlinedButtonBorder,
                ) {
                    Text(
                        text = label,
                        modifier = Modifier.padding(vertical = 12.dp).fillMaxWidth(),
                        textAlign = TextAlign.Center,
                        fontWeight = FontWeight.Medium,
                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                    )
                }
            }
        }

        // Age range dropdown
        ExposedDropdownMenuBox(expanded = ageExpanded, onExpandedChange = { ageExpanded = it }) {
            OutlinedTextField(
                value = state.trancheAge,
                onValueChange = {},
                readOnly = true,
                label = { Text(stringResource(R.string.dussc_age_range)) },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = ageExpanded) },
                modifier = Modifier.fillMaxWidth().menuAnchor(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = DusscPrimary, focusedLabelColor = DusscPrimary),
            )
            ExposedDropdownMenu(expanded = ageExpanded, onDismissRequest = { ageExpanded = false }) {
                ageRanges.forEach { age ->
                    DropdownMenuItem(
                        text = { Text(age) },
                        onClick = { viewModel.updateTrancheAge(age); ageExpanded = false },
                    )
                }
            }
        }

        // Sexe dropdown
        ExposedDropdownMenuBox(expanded = sexeExpanded, onExpandedChange = { sexeExpanded = it }) {
            OutlinedTextField(
                value = state.sexe,
                onValueChange = {},
                readOnly = true,
                label = { Text(stringResource(R.string.dussc_sex)) },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = sexeExpanded) },
                modifier = Modifier.fillMaxWidth().menuAnchor(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = DusscPrimary, focusedLabelColor = DusscPrimary),
            )
            ExposedDropdownMenu(expanded = sexeExpanded, onDismissRequest = { sexeExpanded = false }) {
                listOf(stringResource(R.string.dussc_male) to "Masculin", stringResource(R.string.dussc_female) to "F\u00E9minin", stringResource(R.string.dussc_other) to "Autre").forEach { (label, value) ->
                    DropdownMenuItem(
                        text = { Text(label) },
                        onClick = { viewModel.updateSexe(value); sexeExpanded = false },
                    )
                }
            }
        }

        // Submit button
        Button(
            onClick = { viewModel.submitDemographics() },
            modifier = Modifier.fillMaxWidth().height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = DusscPrimary),
            shape = RoundedCornerShape(12.dp),
        ) {
            Text(stringResource(R.string.dussc_demographics_submit), fontWeight = FontWeight.Bold)
        }

        // Skip button
        TextButton(
            onClick = { viewModel.submitDemographics() },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(stringResource(R.string.dussc_demographics_skip), color = DusscPrimary)
        }
    }
}

@Composable
private fun ResultsContent(state: DusscQuizState, onBack: () -> Unit, onRetry: () -> Unit) {
    val scores = state.scores ?: return
    val context = LocalContext.current

    val animatedProgress by animateFloatAsState(
        targetValue = (scores.pctTotal ?: 0) / 100f,
        animationSpec = tween(durationMillis = 1500, easing = FastOutSlowInEasing),
        label = "score_anim",
    )

    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
    ) {
        // Score header
        Box(
            modifier = Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(DusscPrimary, DusscLight))).padding(32.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(stringResource(R.string.dussc_results_title), color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))

                // Animated score circle
                Box(modifier = Modifier.size(140.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        progress = { animatedProgress },
                        modifier = Modifier.size(140.dp),
                        color = Color.White,
                        trackColor = Color.White.copy(alpha = 0.2f),
                        strokeWidth = 10.dp,
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("${(animatedProgress * 100).toInt()}%", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                        Text(stringResource(R.string.dussc_score), color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "${scores.totalCorrect ?: 0} / ${scores.totalQuestions ?: 0} ${stringResource(R.string.dussc_correct_answers)}",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 15.sp,
                )
            }
        }

        // Pre/Post comparison
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(stringResource(R.string.dussc_comparison), fontWeight = FontWeight.Bold, fontSize = 18.sp)

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                // Pre-test card
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = BlocPreTest.copy(alpha = 0.1f))) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(stringResource(R.string.dussc_pretest), fontWeight = FontWeight.Medium, color = BlocPreTest, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("${scores.pctPre ?: 0}%", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = BlocPreTest)
                        Text("${scores.scorePre ?: 0} pts", fontSize = 13.sp, color = BlocPreTest.copy(alpha = 0.7f))
                    }
                }
                // Post-test card
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = BlocPostTest.copy(alpha = 0.1f))) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(stringResource(R.string.dussc_posttest), fontWeight = FontWeight.Medium, color = BlocPostTest, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("${scores.pctPost ?: 0}%", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = BlocPostTest)
                        Text("${scores.scorePost ?: 0} pts", fontSize = 13.sp, color = BlocPostTest.copy(alpha = 0.7f))
                    }
                }
            }

            // Gain card
            val gain = scores.gain ?: 0
            val gainColor = if (gain > 0) Success else if (gain < 0) Danger else Muted
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = gainColor.copy(alpha = 0.1f)),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        if (gain > 0) Icons.Default.TrendingUp else if (gain < 0) Icons.Default.TrendingDown else Icons.Default.TrendingFlat,
                        contentDescription = null,
                        tint = gainColor,
                        modifier = Modifier.size(28.dp),
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(stringResource(R.string.dussc_gain), fontSize = 13.sp, color = gainColor)
                        Text(
                            "${if (gain > 0) "+" else ""}$gain ${stringResource(R.string.dussc_points)}",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = gainColor,
                        )
                    }
                }
            }

            // Performance message
            val pct = scores.pctTotal ?: 0
            val messageRes = when {
                pct >= 80 -> R.string.dussc_result_excellent
                pct >= 50 -> R.string.dussc_result_good
                else -> R.string.dussc_result_retry
            }
            Card(modifier = Modifier.fillMaxWidth()) {
                Text(
                    stringResource(messageRes),
                    modifier = Modifier.padding(16.dp),
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                )
            }

            // Wrong answers review (Lecons)
            val wrongAnswers = state.resultDetail?.responses?.filter { it.isCorrect == 0 } ?: emptyList()
            if (wrongAnswers.isNotEmpty()) {
                var showAllLessons by remember { mutableStateOf(false) }
                Text(stringResource(R.string.dussc_lessons_title), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("${wrongAnswers.size} ${stringResource(R.string.dussc_wrong_answers)}", fontSize = 13.sp, color = Muted)

                val displayed = if (showAllLessons) wrongAnswers else wrongAnswers.take(5)
                displayed.forEach { response ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Danger.copy(alpha = 0.05f)),
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            Text(
                                response.enonceeFr ?: response.enonceeEn ?: "",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(
                                    "Votre r\u00E9ponse: ${response.answerGiven}",
                                    fontSize = 12.sp,
                                    color = Danger,
                                )
                                Text(
                                    "Bonne r\u00E9ponse: ${response.reponseCorrecte}",
                                    fontSize = 12.sp,
                                    color = Success,
                                )
                            }
                            if (!response.explicationFr.isNullOrBlank()) {
                                Text(
                                    response.explicationFr,
                                    fontSize = 12.sp,
                                    color = Muted,
                                    lineHeight = 16.sp,
                                )
                            }
                        }
                    }
                }
                if (wrongAnswers.size > 5 && !showAllLessons) {
                    TextButton(onClick = { showAllLessons = true }) {
                        Text("${stringResource(R.string.dussc_see_all)} (${wrongAnswers.size})")
                    }
                }
            }

            // Action buttons
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(
                    onClick = onRetry,
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.dussc_retry))
                }
                Button(
                    onClick = onBack,
                    modifier = Modifier.weight(1f).height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = DusscPrimary),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text(stringResource(R.string.dussc_back_home))
                }
            }

            // Share button
            OutlinedButton(
                onClick = {
                    val shareText = "DUSS-C Quiz\nScore: ${scores.pctTotal}%\nPr\u00E9-test: ${scores.pctPre}%\nPost-test: ${scores.pctPost}%\nGain: ${if ((scores.gain ?: 0) > 0) "+" else ""}${scores.gain} points"
                    val intent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, shareText)
                    }
                    context.startActivity(Intent.createChooser(intent, "Partager"))
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
            ) {
                Icon(Icons.Default.Share, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.dussc_share_results))
            }
        }
    }
}
