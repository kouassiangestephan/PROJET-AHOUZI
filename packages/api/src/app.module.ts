import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { ReservationsModule } from './reservations/reservations.module';
import { CustomersModule } from './customers/customers.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { FinanceModule } from './finance/finance.module';
import { ExpensesModule } from './expenses/expenses.module';
import { HrModule } from './hr/hr.module';
import { InventoryModule } from './inventory/inventory.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { BarModule } from './bar/bar.module';
import { ShopModule } from './shop/shop.module';
import { ReportsModule } from './reports/reports.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 },
    ]),
    DatabaseModule,
    AuthModule,
    PropertiesModule,
    ReservationsModule,
    CustomersModule,
    HousekeepingModule,
    MaintenanceModule,
    FinanceModule,
    ExpensesModule,
    HrModule,
    InventoryModule,
    RestaurantModule,
    BarModule,
    ShopModule,
    ReportsModule,
    UploadModule,
    NotificationsModule,
  ],
})
export class AppModule {}
