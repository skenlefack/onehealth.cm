package cm.onehealth.cohrm.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import cm.onehealth.cohrm.data.repository.CohrmRepositoryImpl
import cm.onehealth.cohrm.data.repository.ReportRepositoryImpl
import cm.onehealth.cohrm.data.repository.ScanRepositoryImpl
import cm.onehealth.cohrm.data.repository.SyncRepositoryImpl
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import cm.onehealth.cohrm.domain.repository.ReportRepository
import cm.onehealth.cohrm.domain.repository.ScanRepository
import cm.onehealth.cohrm.domain.repository.SyncRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "cohrm_settings")

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindReportRepository(impl: ReportRepositoryImpl): ReportRepository

    @Binds
    @Singleton
    abstract fun bindSyncRepository(impl: SyncRepositoryImpl): SyncRepository

    @Binds
    @Singleton
    abstract fun bindCohrmRepository(impl: CohrmRepositoryImpl): CohrmRepository

    @Binds
    @Singleton
    abstract fun bindScanRepository(impl: ScanRepositoryImpl): ScanRepository

    companion object {
        @Provides
        @Singleton
        fun provideDataStore(@ApplicationContext context: Context): DataStore<Preferences> =
            context.dataStore
    }
}
