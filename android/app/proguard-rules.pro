# Moshi
-keep class cm.onehealth.cohrm.data.remote.dto.** { *; }
-keepclassmembers class cm.onehealth.cohrm.data.remote.dto.** { *; }

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
