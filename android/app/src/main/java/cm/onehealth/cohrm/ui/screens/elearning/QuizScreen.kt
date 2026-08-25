package cm.onehealth.cohrm.ui.screens.elearning

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.remote.elearning.ELQuestionResultDto
import cm.onehealth.cohrm.data.remote.elearning.ELQuizOptionDto
import cm.onehealth.cohrm.data.remote.elearning.ELQuizQuestionDto
import cm.onehealth.cohrm.ui.theme.*

@Composable
fun QuizScreen(
    onBack: () -> Unit,
    viewModel: QuizViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.quiz?.titleFr ?: state.quiz?.titleEn ?: stringResource(R.string.el_quiz)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ELearningPrimary, titleContentColor = Color.White, navigationIconContentColor = Color.White),
            )
        },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (state.phase) {
                "loading" -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = ELearningPrimary) }
                "taking" -> QuizTakingContent(state, viewModel)
                "submitting" -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) { CircularProgressIndicator(color = ELearningPrimary); Spacer(modifier = Modifier.height(16.dp)); Text(stringResource(R.string.dussc_submitting)) }
                }
                "results" -> QuizResultsContent(state, viewModel, onBack)
                "error" -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) { Text(state.error ?: "Error", color = Danger); Spacer(modifier = Modifier.height(16.dp)); Button(onClick = onBack) { Text(stringResource(R.string.close)) } }
                }
            }
        }
    }
}

@Composable
private fun QuizTakingContent(state: ELQuizState, viewModel: QuizViewModel) {
    val question = state.questions.getOrNull(state.currentIndex) ?: return
    val selectedAnswer = state.answers[question.id]

    Column(modifier = Modifier.fillMaxSize()) {
        // Progress
        Column(modifier = Modifier.fillMaxWidth().background(ELearningPrimary.copy(alpha = 0.05f)).padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("${state.currentIndex + 1} / ${state.questions.size}", fontWeight = FontWeight.Bold)
                Text("${question.points ?: 1} pts", fontSize = 13.sp, color = ELearningPrimary)
            }
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { (state.currentIndex + 1).toFloat() / state.questions.size.coerceAtLeast(1) },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                color = ELearningPrimary,
            )
        }

        Column(modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Question text
            Text(question.localizedText, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, lineHeight = 24.sp)

            // Answer area based on type
            when (question.questionType) {
                "mcq" -> McqOptions(question.options ?: emptyList(), selectedAnswer?.toIntOrNull(), onSelect = { viewModel.setAnswer(question.id, it.toString()) })
                "multiple_select" -> {
                    val selectedIds = selectedAnswer?.split(",")?.mapNotNull { it.trim().toIntOrNull() } ?: emptyList()
                    MultiSelectOptions(question.options ?: emptyList(), selectedIds, onToggle = { optId ->
                        val current = selectedIds.toMutableList()
                        if (optId in current) current.remove(optId) else current.add(optId)
                        viewModel.setAnswer(question.id, current.joinToString(","))
                    })
                }
                "true_false" -> TrueFalseOptions(selectedAnswer?.toBooleanStrictOrNull(), onSelect = { viewModel.setAnswer(question.id, it.toString()) })
                "short_answer", "fill_blank" -> {
                    var text by remember(question.id) { mutableStateOf(selectedAnswer ?: "") }
                    OutlinedTextField(
                        value = text, onValueChange = { text = it; viewModel.setAnswer(question.id, it) },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text(stringResource(R.string.el_type_answer)) },
                        shape = RoundedCornerShape(12.dp),
                        minLines = if (question.questionType == "short_answer") 3 else 1,
                    )
                }
                "matching" -> MatchingQuestion(question, selectedAnswer, onAnswer = { viewModel.setAnswer(question.id, it) })
                "essay" -> {
                    var text by remember(question.id) { mutableStateOf(selectedAnswer ?: "") }
                    OutlinedTextField(
                        value = text, onValueChange = { text = it; viewModel.setAnswer(question.id, it) },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text(stringResource(R.string.el_essay_placeholder)) },
                        shape = RoundedCornerShape(12.dp),
                        minLines = 5,
                        maxLines = 10,
                    )
                }
                else -> McqOptions(question.options ?: emptyList(), selectedAnswer?.toIntOrNull(), onSelect = { viewModel.setAnswer(question.id, it.toString()) })
            }

            // Hint
            if (!question.hintFr.isNullOrBlank() || !question.hintEn.isNullOrBlank()) {
                var showHint by remember { mutableStateOf(false) }
                TextButton(onClick = { showHint = !showHint }) { Icon(Icons.Default.Lightbulb, contentDescription = null, modifier = Modifier.size(18.dp)); Spacer(modifier = Modifier.width(4.dp)); Text(if (showHint) "Masquer" else "Indice") }
                if (showHint) {
                    Surface(shape = RoundedCornerShape(8.dp), color = Warning.copy(alpha = 0.1f)) {
                        Text(question.hintFr ?: question.hintEn ?: "", modifier = Modifier.padding(12.dp), fontSize = 13.sp, color = Warning)
                    }
                }
            }
        }

        // Navigation buttons
        Surface(tonalElevation = 3.dp) {
            Row(modifier = Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                OutlinedButton(onClick = { viewModel.prevQuestion() }, enabled = state.currentIndex > 0) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(18.dp)); Spacer(modifier = Modifier.width(4.dp)); Text(stringResource(R.string.report_previous))
                }
                if (state.currentIndex >= state.questions.size - 1) {
                    Button(onClick = { viewModel.submit() }, colors = ButtonDefaults.buttonColors(containerColor = ELearningPrimary)) {
                        Text(stringResource(R.string.report_submit), fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(onClick = { viewModel.nextQuestion() }, colors = ButtonDefaults.buttonColors(containerColor = ELearningPrimary)) {
                        Text(stringResource(R.string.report_next)); Spacer(modifier = Modifier.width(4.dp)); Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun McqOptions(options: List<ELQuizOptionDto>, selected: Int?, onSelect: (Int) -> Unit) {
    options.forEachIndexed { idx, option ->
        val isSelected = selected == option.id
        Surface(
            modifier = Modifier.fillMaxWidth().clickable { onSelect(option.id) }.border(2.dp, if (isSelected) ELearningPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) ELearningPrimary.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface,
        ) {
            Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(modifier = Modifier.size(32.dp).clip(CircleShape).background(if (isSelected) ELearningPrimary else Muted.copy(alpha = 0.2f)), contentAlignment = Alignment.Center) {
                    Text("${'A' + idx}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = if (isSelected) Color.White else Muted)
                }
                Text(option.localizedText, fontSize = 15.sp, modifier = Modifier.weight(1f))
                if (isSelected) Icon(Icons.Default.CheckCircle, contentDescription = null, tint = ELearningPrimary, modifier = Modifier.size(24.dp))
            }
        }
    }
}

@Composable
private fun MultiSelectOptions(options: List<ELQuizOptionDto>, selected: List<Int>, onToggle: (Int) -> Unit) {
    Text(stringResource(R.string.el_multiple_answers), fontSize = 12.sp, color = Muted)
    options.forEach { option ->
        val isSelected = option.id in selected
        Row(modifier = Modifier.fillMaxWidth().clickable { onToggle(option.id) }.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = isSelected, onCheckedChange = { onToggle(option.id) }, colors = CheckboxDefaults.colors(checkedColor = ELearningPrimary))
            Text(option.localizedText, fontSize = 15.sp)
        }
    }
}

@Composable
private fun TrueFalseOptions(selected: Boolean?, onSelect: (Boolean) -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        listOf(true to stringResource(R.string.el_true), false to stringResource(R.string.el_false)).forEach { (value, label) ->
            val isSelected = selected == value
            Button(
                onClick = { onSelect(value) },
                modifier = Modifier.weight(1f).height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = if (isSelected) (if (value) Success else Danger) else MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(12.dp),
            ) {
                Icon(if (value) Icons.Default.Check else Icons.Default.Close, contentDescription = null, tint = if (isSelected) Color.White else Muted)
                Spacer(modifier = Modifier.width(8.dp))
                Text(label, color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun QuizResultsContent(state: ELQuizState, viewModel: QuizViewModel, onBack: () -> Unit) {
    val result = state.result ?: return
    val attemptResults by viewModel.attemptResults.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Box(
            modifier = Modifier.fillMaxWidth().background(if (result.passed == true) Success.copy(alpha = 0.1f) else Danger.copy(alpha = 0.1f)).padding(32.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    if (result.passed == true) Icons.Default.EmojiEvents else Icons.Default.Replay,
                    contentDescription = null,
                    tint = if (result.passed == true) Success else Danger,
                    modifier = Modifier.size(64.dp),
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "${result.scorePercent?.toInt() ?: 0}%",
                    fontSize = 48.sp, fontWeight = FontWeight.Bold,
                    color = if (result.passed == true) Success else Danger,
                )
                Text(
                    if (result.passed == true) stringResource(R.string.el_quiz_passed) else stringResource(R.string.el_quiz_failed),
                    fontWeight = FontWeight.Bold, fontSize = 18.sp,
                    color = if (result.passed == true) Success else Danger,
                )
            }
        }

        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                ResultStat(stringResource(R.string.dussc_correct), "${result.correctCount ?: 0}")
                ResultStat(stringResource(R.string.el_total_q), "${result.totalQuestions ?: 0}")
                ResultStat(stringResource(R.string.el_time), "${(result.timeSpentSeconds ?: 0) / 60}min")
            }

            // Detailed review
            attemptResults?.results?.let { questionResults ->
                if (questionResults.isNotEmpty()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    Text(stringResource(R.string.el_review_answers), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    questionResults.forEachIndexed { idx, qr ->
                        QuestionResultCard(idx + 1, qr)
                    }
                }
            }

            Button(
                onClick = onBack,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ELearningPrimary),
                shape = RoundedCornerShape(12.dp),
            ) {
                Text(stringResource(R.string.el_back_to_course), fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun QuestionResultCard(number: Int, qr: ELQuestionResultDto) {
    val isCorrect = qr.isCorrect == true
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = if (isCorrect) Success.copy(alpha = 0.05f) else Danger.copy(alpha = 0.05f)),
        border = BorderStroke(1.dp, if (isCorrect) Success.copy(alpha = 0.3f) else Danger.copy(alpha = 0.3f)),
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    if (isCorrect) Icons.Default.CheckCircle else Icons.Default.Cancel,
                    contentDescription = null,
                    tint = if (isCorrect) Success else Danger,
                    modifier = Modifier.size(20.dp),
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Q$number", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Spacer(modifier = Modifier.weight(1f))
                Text("${qr.pointsEarned?.toInt() ?: 0}/${qr.pointsPossible?.toInt() ?: 0} pts", fontSize = 12.sp, color = Muted)
            }
            Text(qr.questionText ?: "", fontSize = 14.sp, lineHeight = 20.sp)
            if (!qr.userAnswer.isNullOrBlank()) {
                Text("${stringResource(R.string.el_your_answer)}: ${qr.userAnswer}", fontSize = 13.sp, color = if (isCorrect) Success else Danger)
            }
            if (!isCorrect && !qr.correctAnswer.isNullOrBlank()) {
                Text("${stringResource(R.string.el_correct_answer)}: ${qr.correctAnswer}", fontSize = 13.sp, color = Success)
            }
            if (!qr.explanation.isNullOrBlank()) {
                Surface(shape = RoundedCornerShape(6.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
                    Text(qr.explanation, modifier = Modifier.padding(8.dp), fontSize = 12.sp, color = Muted)
                }
            }
        }
    }
}

@Composable
private fun MatchingQuestion(question: ELQuizQuestionDto, answer: String?, onAnswer: (String) -> Unit) {
    val options = question.options ?: emptyList()
    val leftItems = options.filterIndexed { i, _ -> i % 2 == 0 }
    val rightItems = remember(question.id) { options.filterIndexed { i, _ -> i % 2 == 1 }.shuffled() }

    var selectedLeft by remember { mutableIntStateOf(-1) }
    val matches = remember(question.id) { mutableStateMapOf<Int, Int>() }

    LaunchedEffect(answer) {
        if (matches.isEmpty() && !answer.isNullOrBlank()) {
            answer.split(",").forEach { pair ->
                val parts = pair.split(":")
                if (parts.size == 2) {
                    matches[parts[0].toIntOrNull() ?: return@forEach] = parts[1].toIntOrNull() ?: return@forEach
                }
            }
        }
    }

    Text(stringResource(R.string.el_match_instruction), fontSize = 12.sp, color = Muted)
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        // Left column
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            leftItems.forEach { opt ->
                val isSelected = selectedLeft == opt.id
                val isMatched = opt.id in matches
                Surface(
                    modifier = Modifier.fillMaxWidth().clickable { selectedLeft = opt.id },
                    shape = RoundedCornerShape(8.dp),
                    color = when {
                        isSelected -> ELearningPrimary.copy(alpha = 0.15f)
                        isMatched -> Success.copy(alpha = 0.1f)
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    },
                    border = if (isSelected) BorderStroke(2.dp, ELearningPrimary) else null,
                ) { Text(opt.localizedText, modifier = Modifier.padding(10.dp), fontSize = 13.sp) }
            }
        }
        // Right column
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            rightItems.forEach { opt ->
                val matchedTo = matches.entries.find { it.value == opt.id }?.key
                Surface(
                    modifier = Modifier.fillMaxWidth().clickable {
                        if (selectedLeft >= 0) {
                            matches[selectedLeft] = opt.id
                            selectedLeft = -1
                            onAnswer(matches.entries.joinToString(",") { "${it.key}:${it.value}" })
                        }
                    },
                    shape = RoundedCornerShape(8.dp),
                    color = if (matchedTo != null) Success.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant,
                ) { Text(opt.localizedText, modifier = Modifier.padding(10.dp), fontSize = 13.sp) }
            }
        }
    }
}

@Composable
private fun ResultStat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text(label, fontSize = 12.sp, color = Muted)
    }
}
