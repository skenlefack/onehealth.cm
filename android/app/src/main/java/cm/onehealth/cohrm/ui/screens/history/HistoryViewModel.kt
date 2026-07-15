package cm.onehealth.cohrm.ui.screens.history

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.domain.model.Report
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.domain.repository.ReportRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val reportRepository: ReportRepository,
) : ViewModel() {

    private val _filter = MutableStateFlow<SyncStatus?>(null)
    val filter: StateFlow<SyncStatus?> = _filter.asStateFlow()

    val reports: StateFlow<List<Report>> = _filter.flatMapLatest { status ->
        if (status != null) {
            reportRepository.getReportsByStatus(status)
        } else {
            reportRepository.getAllReports()
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setFilter(status: SyncStatus?) {
        _filter.value = status
    }

    fun deleteReport(id: String) {
        viewModelScope.launch {
            reportRepository.deleteReport(id)
        }
    }
}
