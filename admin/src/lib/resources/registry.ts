import type { BaseRecord, ResourceConfig } from './types'
import {
  allUsersResource,
  buyersResource,
  sellersUsersResource,
  rentalOwnersResource,
  driversUsersResource,
  laborUsersResource,
  warehouseOwnersResource,
  expertsUsersResource,
  adminsResource,
} from './users'
import { productsResource, categoriesResource, listingApprovalsResource, ordersResource, sellersResource } from './marketplace'
import {
  machineryResource,
  machineryRentalResource,
  laborResource,
  driversResource,
  logisticsResource,
  warehousesResource,
  expertsResource,
  soilTestsResource,
} from './services'
import { bookingsResource, appointmentsResource, deliveriesResource, agreementsResource } from './operations'
import {
  revenueResource,
  paymentsResource,
  refundsResource,
  settlementsResource,
  payoutsResource,
  invoicesResource,
  financialDisputesResource,
} from './finance'
import { listingsResource, transactionsResource, subscriptionsResource, disputesResource, contentResource } from './core'
import { moderationResource, supportResource, alertsResource, reportsResource, integrationsResource } from './platform'

/** Resource key → config. Server pages pass the key; the client screen resolves the config. */
export const RESOURCES = {
  users: allUsersResource,
  buyers: buyersResource,
  sellerUsers: sellersUsersResource,
  rentalOwners: rentalOwnersResource,
  driverUsers: driversUsersResource,
  laborUsers: laborUsersResource,
  warehouseOwners: warehouseOwnersResource,
  expertUsers: expertsUsersResource,
  admins: adminsResource,
  products: productsResource,
  categories: categoriesResource,
  listingApprovals: listingApprovalsResource,
  orders: ordersResource,
  sellers: sellersResource,
  machinery: machineryResource,
  machineryRental: machineryRentalResource,
  labor: laborResource,
  drivers: driversResource,
  logistics: logisticsResource,
  warehouses: warehousesResource,
  experts: expertsResource,
  soilTests: soilTestsResource,
  bookings: bookingsResource,
  appointments: appointmentsResource,
  deliveries: deliveriesResource,
  agreements: agreementsResource,
  revenue: revenueResource,
  payments: paymentsResource,
  refunds: refundsResource,
  settlements: settlementsResource,
  payouts: payoutsResource,
  invoices: invoicesResource,
  financialDisputes: financialDisputesResource,
  moderation: moderationResource,
  support: supportResource,
  alerts: alertsResource,
  reports: reportsResource,
  integrations: integrationsResource,
  listings: listingsResource,
  transactions: transactionsResource,
  subscriptions: subscriptionsResource,
  disputes: disputesResource,
  content: contentResource,
}

export type ResourceKey = keyof typeof RESOURCES

export function getResource(key: ResourceKey): ResourceConfig<BaseRecord> {
  return RESOURCES[key] as unknown as ResourceConfig<BaseRecord>
}
