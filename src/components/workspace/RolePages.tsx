import { WorkspaceListPage } from './WorkspaceListPage'
import {
  BUYER_RFQS,
  BUYER_SUPPLIERS,
  EDU_ASSESS,
  EDU_COURSES,
  EDU_LEARNERS,
  EDU_QNA,
  EDU_SESSIONS,
  RENTAL_BOOKINGS,
  RENTAL_EQUIPMENT,
  RENTAL_MAINT,
  RENTAL_OPERATORS,
  SELLER_QUOTES,
  SERVICE_APPTS,
  SERVICE_LIST,
  SERVICE_PORTFOLIO,
  SERVICE_REPORTS,
} from '../../config/workspaceLists'

export function QuotesPage() {
  return <WorkspaceListPage config={SELLER_QUOTES} />
}
export function RfqsPage() {
  return <WorkspaceListPage config={BUYER_RFQS} />
}
export function SuppliersPage() {
  return <WorkspaceListPage config={BUYER_SUPPLIERS} />
}
export function EquipmentPage() {
  return <WorkspaceListPage config={RENTAL_EQUIPMENT} />
}
export function BookingsPage() {
  return <WorkspaceListPage config={RENTAL_BOOKINGS} />
}
export function OperatorsPage() {
  return <WorkspaceListPage config={RENTAL_OPERATORS} />
}
export function MaintenancePage() {
  return <WorkspaceListPage config={RENTAL_MAINT} />
}
export function ServicesPage() {
  return <WorkspaceListPage config={SERVICE_LIST} />
}
export function AppointmentsPage() {
  return <WorkspaceListPage config={SERVICE_APPTS} />
}
export function ReportsPage() {
  return <WorkspaceListPage config={SERVICE_REPORTS} />
}
export function PortfolioPage() {
  return <WorkspaceListPage config={SERVICE_PORTFOLIO} />
}
export function CoursesPage() {
  return <WorkspaceListPage config={EDU_COURSES} />
}
export function LearnersPage() {
  return <WorkspaceListPage config={EDU_LEARNERS} />
}
export function SessionsPage() {
  return <WorkspaceListPage config={EDU_SESSIONS} />
}
export function AssessmentsPage() {
  return <WorkspaceListPage config={EDU_ASSESS} />
}
export function QnaPage() {
  return <WorkspaceListPage config={EDU_QNA} />
}
