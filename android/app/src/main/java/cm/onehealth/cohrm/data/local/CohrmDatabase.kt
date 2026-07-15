package cm.onehealth.cohrm.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import cm.onehealth.cohrm.data.local.dao.PhotoDao
import cm.onehealth.cohrm.data.local.dao.ReferenceDataDao
import cm.onehealth.cohrm.data.local.dao.ReportDao
import cm.onehealth.cohrm.data.local.dao.ScanDao
import cm.onehealth.cohrm.data.local.entity.PhotoEntity
import cm.onehealth.cohrm.data.local.entity.ReferenceDataEntity
import cm.onehealth.cohrm.data.local.entity.ReportEntity
import cm.onehealth.cohrm.data.local.entity.ScanEntity
import cm.onehealth.cohrm.data.local.entity.ScanResultEntity

@Database(
    entities = [
        ReportEntity::class,
        PhotoEntity::class,
        ReferenceDataEntity::class,
        ScanEntity::class,
        ScanResultEntity::class,
    ],
    version = 3,
    exportSchema = false,
)
abstract class CohrmDatabase : RoomDatabase() {
    abstract fun reportDao(): ReportDao
    abstract fun photoDao(): PhotoDao
    abstract fun referenceDataDao(): ReferenceDataDao
    abstract fun scanDao(): ScanDao

    companion object {
        const val DATABASE_NAME = "cohrm_database"

        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL("ALTER TABLE reports ADD COLUMN dateDetection TEXT NOT NULL DEFAULT ''")
                database.execSQL("ALTER TABLE reports ADD COLUMN messageReceived TEXT NOT NULL DEFAULT ''")
                database.execSQL("ALTER TABLE reports ADD COLUMN themes TEXT NOT NULL DEFAULT ''")
                database.execSQL("ALTER TABLE reports ADD COLUMN gravityComment TEXT NOT NULL DEFAULT ''")
                database.execSQL("ALTER TABLE reports ADD COLUMN sourceType TEXT NOT NULL DEFAULT 'mobile_app'")
                database.execSQL("ALTER TABLE reports ADD COLUMN arrondissement TEXT NOT NULL DEFAULT ''")
                database.execSQL("ALTER TABLE reports ADD COLUMN commune TEXT NOT NULL DEFAULT ''")
                database.execSQL("ALTER TABLE reports ADD COLUMN aireSante TEXT NOT NULL DEFAULT ''")
            }
        }

        val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL("""
                    CREATE TABLE IF NOT EXISTS scans (
                        id INTEGER NOT NULL PRIMARY KEY,
                        source TEXT NOT NULL DEFAULT '',
                        status TEXT NOT NULL DEFAULT '',
                        keywords TEXT NOT NULL DEFAULT '',
                        itemsScanned INTEGER NOT NULL DEFAULT 0,
                        rumorsFound INTEGER NOT NULL DEFAULT 0,
                        duration INTEGER NOT NULL DEFAULT 0,
                        createdAt TEXT NOT NULL DEFAULT '',
                        completedAt TEXT NOT NULL DEFAULT ''
                    )
                """.trimIndent())
                database.execSQL("""
                    CREATE TABLE IF NOT EXISTS scan_results (
                        id INTEGER NOT NULL PRIMARY KEY,
                        scanId INTEGER NOT NULL DEFAULT 0,
                        title TEXT NOT NULL DEFAULT '',
                        content TEXT NOT NULL DEFAULT '',
                        url TEXT NOT NULL DEFAULT '',
                        source TEXT NOT NULL DEFAULT '',
                        author TEXT NOT NULL DEFAULT '',
                        relevanceScore REAL NOT NULL DEFAULT 0.0,
                        status TEXT NOT NULL DEFAULT 'new',
                        matchedKeywords TEXT NOT NULL DEFAULT ''
                    )
                """.trimIndent())
            }
        }
    }
}
