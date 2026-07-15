package cm.onehealth.cohrm.ui.screens.report

import android.widget.Toast
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.ui.components.StepIndicator
import cm.onehealth.cohrm.ui.screens.report.steps.Step1CategoryScreen
import cm.onehealth.cohrm.ui.screens.report.steps.Step2LocationScreen
import cm.onehealth.cohrm.ui.screens.report.steps.Step3SourceScreen
import cm.onehealth.cohrm.ui.screens.report.steps.Step3DetailsScreen
import cm.onehealth.cohrm.ui.screens.report.steps.Step4PhotoScreen
import cm.onehealth.cohrm.ui.screens.report.steps.Step5ReviewScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportWizardScreen(
    reportId: String?,
    onFinished: () -> Unit,
    viewModel: ReportViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is ReportEvent.Saved -> {
                    Toast.makeText(context, context.getString(R.string.report_saved), Toast.LENGTH_SHORT).show()
                    onFinished()
                }
                is ReportEvent.Submitted -> {
                    Toast.makeText(context, context.getString(R.string.report_submitted), Toast.LENGTH_SHORT).show()
                    onFinished()
                }
                is ReportEvent.Error -> {
                    Toast.makeText(context, event.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = {
                Text(stringResource(R.string.report_step, state.currentStep, 6))
            },
            navigationIcon = {
                IconButton(onClick = {
                    if (state.currentStep > 1) viewModel.previousStep() else onFinished()
                }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                }
            },
            actions = {
                TextButton(onClick = { viewModel.saveDraft() }) {
                    Text(stringResource(R.string.report_save_draft))
                }
            },
        )

        StepIndicator(
            currentStep = state.currentStep,
            totalSteps = 6,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Step content - constrained to fill between header and buttons
        Box(modifier = Modifier.weight(1f)) {
            when (state.currentStep) {
                1 -> Step1CategoryScreen(state = state, viewModel = viewModel)
                2 -> Step2LocationScreen(state = state, viewModel = viewModel)
                3 -> Step3SourceScreen(viewModel = viewModel)
                4 -> Step3DetailsScreen(state = state, viewModel = viewModel)
                5 -> Step4PhotoScreen(state = state, viewModel = viewModel)
                6 -> Step5ReviewScreen(state = state, viewModel = viewModel)
            }
        }

        // Navigation buttons
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
        ) {
            if (state.currentStep > 1) {
                OutlinedButton(
                    onClick = { viewModel.previousStep() },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(stringResource(R.string.report_previous))
                }
                Spacer(modifier = Modifier.width(12.dp))
            }

            if (state.currentStep < 6) {
                Button(
                    onClick = { viewModel.nextStep() },
                    enabled = viewModel.canProceedFromStep(state.currentStep),
                    modifier = Modifier.weight(1f),
                ) {
                    Text(stringResource(R.string.report_next))
                }
            } else {
                Button(
                    onClick = { viewModel.submit() },
                    enabled = !state.isSubmitting,
                    modifier = Modifier.weight(1f),
                ) {
                    Text(
                        if (state.isSubmitting) stringResource(R.string.loading)
                        else stringResource(R.string.report_submit)
                    )
                }
            }
        }
    }
}
