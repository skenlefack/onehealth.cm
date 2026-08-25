# Moshi - all DTOs
-keep class cm.onehealth.cohrm.data.remote.dto.** { *; }
-keepclassmembers class cm.onehealth.cohrm.data.remote.dto.** { *; }
-keep class cm.onehealth.cohrm.data.remote.PostDto { *; }
-keep class cm.onehealth.cohrm.data.remote.PostsResponse { *; }
-keep class cm.onehealth.cohrm.data.remote.PostDetailResponse { *; }
-keep class cm.onehealth.cohrm.data.remote.PostsApiService { *; }
-keep class cm.onehealth.cohrm.data.remote.elearning.** { *; }
-keepclassmembers class cm.onehealth.cohrm.data.remote.elearning.** { *; }
-keep class cm.onehealth.cohrm.data.remote.dussc.** { *; }
-keepclassmembers class cm.onehealth.cohrm.data.remote.dussc.** { *; }
-keep class cm.onehealth.cohrm.data.remote.ohwr.** { *; }
-keepclassmembers class cm.onehealth.cohrm.data.remote.ohwr.** { *; }

# Retrofit - preserve generic type information for API interfaces
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation
-if interface * { @retrofit2.http.* public *** *(...); }
-keep,allowoptimization,allowshrinking,allowobfuscation class <3>
-keep class cm.onehealth.cohrm.data.remote.ApiService { *; }
-keep class cm.onehealth.cohrm.data.remote.elearning.ELearningApiService { *; }
-keep class cm.onehealth.cohrm.data.remote.dussc.DusscApiService { *; }
-keep class cm.onehealth.cohrm.data.remote.ohwr.OhwrApiService { *; }

# Moshi adapters
-keep class com.squareup.moshi.** { *; }
-keep @com.squareup.moshi.JsonClass class * { *; }
-keepclassmembers @com.squareup.moshi.JsonClass class * { *; }

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
