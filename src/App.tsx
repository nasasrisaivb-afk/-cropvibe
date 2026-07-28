import { Navigate, Route, Routes } from 'react-router-dom'
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen'
import { KYCStatusScreen } from './components/auth/KYCStatusScreen'
import { LoginScreen } from './components/auth/LoginScreen'
import { OtpScreen } from './components/auth/OtpScreen'
import { RegisterScreen } from './components/auth/RegisterScreen'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { CreateWorkflowPage } from './components/listings/CreateWorkflowPage'
import { ListingsPage } from './components/listings/ListingsPage'
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
import { HelpDeskPage } from './components/rentals/HelpDeskPage'
import { OverdueRentalsPage } from './components/rentals/OverdueRentalsPage'
import { RentalInventoryPage } from './components/rentals/RentalInventoryPage'

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
        <Route element={<OrdersPage />} path="bookings" />
        <Route element={<CalendarPage />} path="calendar" />
        <Route element={<AgreementsPage />} path="agreements" />
        <Route element={<DamageReportsPage />} path="damage" />
        <Route element={<OverdueRentalsPage />} path="overdue" />
        <Route element={<HelpDeskPage />} path="help" />
        <Route element={<WalletPage />} path="wallet" />
        <Route element={<MessagesPage />} path="messages" />
        <Route element={<NotificationsPage />} path="notifications" />
        <Route element={<ReviewsPage />} path="reviews" />
        <Route element={<AnalyticsPage />} path="analytics" />
        <Route element={<ProfilePage />} path="profile" />
        <Route element={<SettingsPage />} path="settings" />
      </Route>
      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  )
}

export default App
