import { Module } from '@nestjs/common';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ServicePackagesModule } from './modules/service-packages/service-packages.module';
import { TimeSlotsModule } from './modules/time-slots/time-slots.module';
import { BlockedDatesModule } from './modules/blocked-dates/blocked-dates.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { VenuesModule } from './modules/venues/venues.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GirlsModule } from './modules/girls/girls.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { PostsModule } from './modules/posts/posts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CommunityPostsModule } from './modules/community-posts/community-posts.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { SearchModule } from './modules/search/search.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { UploadModule } from './modules/upload/upload.module';
import { CacheModule } from './modules/cache/cache.module';
import { TagsModule } from './modules/tags/tags.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AlbumsModule } from './modules/albums/albums.module';
import { AlbumCategoriesModule } from './modules/album-categories/album-categories.module';
import { ChatSexModule } from './modules/chat-sex/chat-sex.module';
import { MoviesModule } from './modules/movies/movies.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule,
    AuthModule,
    UsersModule,
    GirlsModule,
    DistrictsModule,
    PostsModule,
    ReviewsModule,
    CommunityPostsModule,
    MessagesModule,
    AdminModule,
    ReportsModule,
    FavoritesModule,
    SearchModule,
    BookingsModule,
    ServicePackagesModule,
    TimeSlotsModule,
    BlockedDatesModule,
    PaymentsModule,
    VenuesModule,
    NotificationsModule,
    CrawlerModule,
    UploadModule,
    TagsModule,
    CategoriesModule,
    AnalyticsModule,
    AlbumsModule,
    AlbumCategoriesModule,
    ChatSexModule,
    MoviesModule,
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000, // 1 minute
    //     limit: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
    //   },
    // ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
