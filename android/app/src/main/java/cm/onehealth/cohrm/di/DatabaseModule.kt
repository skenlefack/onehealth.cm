package cm.onehealth.cohrm.di

import android.content.Context
import androidx.room.Room
import cm.onehealth.cohrm.data.local.CohrmDatabase
import cm.onehealth.cohrm.data.local.dao.PhotoDao
import cm.onehealth.cohrm.data.local.dao.ReferenceDataDao
import cm.onehealth.cohrm.data.local.dao.ReportDao
import cm.onehealth.cohrm.data.local.dao.RumorDao
import cm.onehealth.cohrm.data.local.dao.ScanDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): CohrmDatabase =
        Room.databaseBuilder(
            context,
            CohrmDatabase::class.java,
            CohrmDatabase.DATABASE_NAME,
        )
            .addMigrations(
                CohrmDatabase.MIGRATION_1_2,
                CohrmDatabase.MIGRATION_2_3,
                CohrmDatabase.MIGRATION_3_4,
            )
            .fallbackToDestructiveMigration()
            .build()

    @Provides
    fun provideReportDao(db: CohrmDatabase): ReportDao = db.reportDao()

    @Provides
    fun providePhotoDao(db: CohrmDatabase): PhotoDao = db.photoDao()

    @Provides
    fun provideReferenceDataDao(db: CohrmDatabase): ReferenceDataDao = db.referenceDataDao()

    @Provides
    fun provideScanDao(db: CohrmDatabase): ScanDao = db.scanDao()

    @Provides
    fun provideRumorDao(db: CohrmDatabase): RumorDao = db.rumorDao()
}
