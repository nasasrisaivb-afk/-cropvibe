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
import { MessagesPage } from './components/modules/MessagesPage'
import { NotificationsPage } from './components/modules/NotificationsPage'
import { ProfilePage } from './components/modules/ProfilePage'
import { ReviewsPage } from './components/modules/ReviewsPage'
import { SettingsPage } from './components/modules/SettingsPage'
import { WalletPage } from './components/modules/WalletPage'
import { OrdersPage } from './components/orders/OrdersPage'

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
        <Route element={<CreateWorkflowPage />} path="create" />
        <Route element={<OrdersPage />} path="orders" />
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
