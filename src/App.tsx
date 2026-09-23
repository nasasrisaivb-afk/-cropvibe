import { Navigate, Route, Routes } from 'react-router-dom'
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen'
import { KYCStatusScreen } from './components/auth/KYCStatusScreen'
import { LoginScreen } from './components/auth/LoginScreen'
import { OtpScreen } from './components/auth/OtpScreen'
import { RegisterScreen } from './components/auth/RegisterScreen'
import { DiscoverPage } from './components/buyer/DiscoverPage'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { CourseCatalogPage } from './components/educators/CourseCatalogPage'
import { CreateWorkflowPage } from './components/listings/CreateWorkflowPage'
import { ListingsPage } from './components/listings/ListingsPage'
import { MandiPricesPage } from './components/intel/MandiPricesPage'
import { SchemesPage } from './components/intel/SchemesPage'
import { WeatherPage } from './components/intel/WeatherPage'
import { AnalyticsPage } from './components/modules/AnalyticsPage'
import { CalendarPage } from './components/modules/CalendarPage'
import { MessagesPage } from './components/modules/MessagesPage'
import { NotificationsPage } from './components/modules/NotificationsPage'
import { ProfilePage } from './components/modules/ProfilePage'
import { ReviewsPage } from './components/modules/ReviewsPage'
import { SettingsPage } from './components/modules/SettingsPage'
import { WalletPage } from './components/modules/WalletPage'
import { OrdersPage } from './components/orders/OrdersPage'
import { AgreementsPage } from './components/rentals/AgreementsPage'
import { DamageReportsPage } from './components/rentals/DamageReportsPage'
import { DisputesPage } from './components/rentals/DisputesPage'
import { FinancePage } from './components/rentals/FinancePage'
import { HelpDeskPage } from './components/rentals/HelpDeskPage'
import { OverdueRentalsPage } from './components/rentals/OverdueRentalsPage'
import { PayoutsPage } from './components/rentals/PayoutsPage'
import { RentalInventoryPage } from './components/rentals/RentalInventoryPage'
import { SchedulingPage } from './components/rentals/SchedulingPage'
import { ServiceCatalogPage } from './components/services/ServiceCatalogPage'
import { ServiceDetailsPage } from './components/services/ServiceDetailsPage'
import { InsightsPage } from './components/workspace/InsightsPage'
import {
  AppointmentsPage,
  AssessmentsPage,
  CoursesPage,
  LearnersPage,
  MaintenancePage,
  OperatorsPage,
  PortfolioPage,
  QnaPage,
  QuotesPage,
  ReportsPage,
  RfqsPage,
  ServicesPage,
  SessionsPage,
  SuppliersPage,
} from './components/workspace/RolePages'

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/login" />} path="/" />
      <Route element={<LoginScreen />} path="/login" />
      <Route element={<RegisterScreen />} path="/register" />
      <Route element={<OtpScreen />} path="/otp" />
      <Route element={<ForgotPasswordScreen />} path="/forgot-password" />
      <Route element={<KYCStatusScreen />} path="/kyc-status" />
      <Route element={<DashboardLayout />} path="/dashboard/*">
        <Route element={<ListingsPage />} path="listings" />
        <Route element={<ListingsPage />} path="equipment" />
        <Route element={<RentalInventoryPage category="machinery" />} path="machinery" />
        <Route element={<RentalInventoryPage category="labours" />} path="labours" />
        <Route element={<RentalInventoryPage category="drivers" />} path="drivers" />
        <Route element={<RentalInventoryPage category="land" />} path="land" />
        <Route element={<RentalInventoryPage category="warehouses" />} path="warehouses" />
        <Route element={<CreateWorkflowPage />} path="create" />
        <Route element={<OrdersPage />} path="orders" />
        <Route element={<Navigate replace to="/dashboard/scheduling" />} path="bookings" />
        <Route element={<SchedulingPage />} path="scheduling" />
        <Route element={<ServiceCatalogPage category="consultancy" />} path="consultancy" />
        <Route element={<ServiceDetailsPage category="consultancy" />} path="consultancy/:serviceId" />
        <Route element={<ServiceCatalogPage category="testing" />} path="testing" />
        <Route element={<ServiceDetailsPage category="testing" />} path="testing/:serviceId" />
        <Route element={<ServiceCatalogPage category="repair" />} path="repair" />
        <Route element={<ServiceDetailsPage category="repair" />} path="repair/:serviceId" />
        <Route element={<ServiceCatalogPage category="aerial" />} path="aerial" />
        <Route element={<ServiceDetailsPage category="aerial" />} path="aerial/:serviceId" />
        <Route element={<ServiceCatalogPage category="irrigation" />} path="irrigation" />
        <Route element={<ServiceDetailsPage category="irrigation" />} path="irrigation/:serviceId" />
        <Route element={<CourseCatalogPage category="selfpaced" />} path="selfpaced" />
        <Route element={<CourseCatalogPage category="live" />} path="live" />
        <Route element={<CourseCatalogPage category="certifications" />} path="certifications" />
        <Route element={<CalendarPage />} path="calendar" />
        <Route element={<AgreementsPage />} path="agreements" />
        <Route element={<DamageReportsPage />} path="damage" />
        <Route element={<OverdueRentalsPage />} path="overdue" />
        <Route element={<FinancePage />} path="finance" />
        <Route element={<PayoutsPage />} path="payouts" />
        <Route element={<DisputesPage />} path="disputes" />
        <Route element={<HelpDeskPage />} path="help" />
        <Route element={<WalletPage />} path="wallet" />
        <Route element={<MessagesPage />} path="messages" />
        <Route element={<NotificationsPage />} path="notifications" />
        <Route element={<ReviewsPage />} path="reviews" />
        <Route element={<AnalyticsPage />} path="analytics" />
        <Route element={<ProfilePage />} path="profile" />
        <Route element={<SettingsPage />} path="settings" />
        <Route element={<DiscoverPage />} path="discover" />
        <Route element={<QuotesPage />} path="quotes" />
        <Route element={<RfqsPage />} path="rfqs" />
        <Route element={<SuppliersPage />} path="suppliers" />
        <Route element={<InsightsPage />} path="insights" />
        <Route element={<OperatorsPage />} path="operators" />
        <Route element={<MaintenancePage />} path="maintenance" />
        <Route element={<ServicesPage />} path="services" />
        <Route element={<AppointmentsPage />} path="appointments" />
        <Route element={<ReportsPage />} path="reports" />
        <Route element={<PortfolioPage />} path="portfolio" />
        <Route element={<CoursesPage />} path="courses" />
        <Route element={<LearnersPage />} path="learners" />
        <Route element={<SessionsPage />} path="sessions" />
        <Route element={<AssessmentsPage />} path="assessments" />
        <Route element={<QnaPage />} path="qna" />
        <Route element={<MandiPricesPage />} path="mandi" />
        <Route element={<WeatherPage />} path="weather" />
        <Route element={<SchemesPage />} path="schemes" />
      </Route>
      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  )
}

export default App
