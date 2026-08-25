package cm.onehealth.cohrm.di

import cm.onehealth.cohrm.BuildConfig
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.AuthInterceptor
import cm.onehealth.cohrm.data.remote.dussc.DusscApiService
import cm.onehealth.cohrm.data.remote.elearning.ELearningApiService
import cm.onehealth.cohrm.data.remote.ohwr.OhwrApiService
import com.squareup.moshi.Moshi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "https://onehealth.cm/api/"

    @Provides
    @Singleton
    fun provideMoshi(): Moshi = Moshi.Builder()
        .build()

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .addInterceptor(authInterceptor)

        if (BuildConfig.DEBUG) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            builder.addInterceptor(logging)
        }

        return builder.build()
    }

    // --- COHRM (existing) ---

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient, moshi: Moshi): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)

    // --- E-Learning ---

    @Provides
    @Singleton
    @Named("elearning")
    fun provideELearningRetrofit(client: OkHttpClient, moshi: Moshi): Retrofit =
        Retrofit.Builder()
            .baseUrl("${BASE_URL}elearning/")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    @Provides
    @Singleton
    fun provideELearningApiService(@Named("elearning") retrofit: Retrofit): ELearningApiService =
        retrofit.create(ELearningApiService::class.java)

    // --- DUSS-C ---

    @Provides
    @Singleton
    @Named("dussc")
    fun provideDusscRetrofit(client: OkHttpClient, moshi: Moshi): Retrofit =
        Retrofit.Builder()
            .baseUrl("${BASE_URL}dussc/")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    @Provides
    @Singleton
    fun provideDusscApiService(@Named("dussc") retrofit: Retrofit): DusscApiService =
        retrofit.create(DusscApiService::class.java)

    // --- OHWR ---

    @Provides
    @Singleton
    @Named("ohwr")
    fun provideOhwrRetrofit(client: OkHttpClient, moshi: Moshi): Retrofit =
        Retrofit.Builder()
            .baseUrl("${BASE_URL}mapping/")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    @Provides
    @Singleton
    fun provideOhwrApiService(@Named("ohwr") retrofit: Retrofit): OhwrApiService =
        retrofit.create(OhwrApiService::class.java)

    // --- Posts (base API) ---

    @Provides
    @Singleton
    @Named("base")
    fun provideBaseRetrofit(client: OkHttpClient, moshi: Moshi): Retrofit =
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    @Provides
    @Singleton
    fun providePostsApiService(@Named("base") retrofit: Retrofit): cm.onehealth.cohrm.data.remote.PostsApiService =
        retrofit.create(cm.onehealth.cohrm.data.remote.PostsApiService::class.java)
}
