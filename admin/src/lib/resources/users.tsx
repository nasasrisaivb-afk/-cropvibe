import { Ban, KeyRound, MailCheck, PauseCircle, PlayCircle, ShieldCheck, UserCheck, Users, UserX } from 'lucide-react'
import type { AdminRole, AdminUser, User, UserRole } from '@/lib/types'
import { USER_ROLE_LABELS, ALL_USER_ROLES, ADMIN_ROLE_LABELS } from '@/lib/types'
import { perms } from '@/lib/data/seeds'
import type { ResourceConfig, StatusDef } from './types'
import { count, location, pct, s, stateFilter, SUSPEND_REASONS } from './helpers'

const ACCOUNT_STATUS: Record<User['accountStatus'], StatusDef> = {
  active: s('Active', 'success'),
  suspended: s('Suspended', 'warning'),
  banned: s('Banned', 'error'),
  inactive: s('Inactive', 'default'),
}

const KYC_STATUS: Record<User['kyc'], StatusDef> = {
  approved: s('Verified', 'success'),
  pending: s('Pending', 'pending'),
  rejected: s('Rejected', 'error'),
  none: s('Not started', 'default'),
}

const name = (u: User) => `${u.firstName} ${u.lastName}`
const monthStart = () => {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function usersResource(segment?: { role: UserRole; plural: string }): ResourceConfig<User> {
  const label = segment ? segment.plural : 'Users'
  return {
    collection: 'users',
    module: 'users',
    entity: segment ? USER_ROLE_LABELS[segment.role] : 'User',
    entityPlural: label,
    exportName: segment ? segment.plural.toLowerCase().replace(/\s+/g, '-') : 'users',
    scope: segment ? (u) => u.roles.includes(segment.role) : undefined,
    title: name,
    subtitle: (u) => `${u.email} · ${location(u.location.district, u.location.state)}`,
    detailHref: (u) => `/users/${u.id}`,
    searchText: (u) => `${name(u)} ${u.email} ${u.phone} ${u.location.district}`,
    searchPlaceholder: 'Search name, phone, email or district…',
    status: { value: (u) => u.accountStatus, map: ACCOUNT_STATUS },
    columns: [
      { key: 'name', header: 'User', kind: 'person', value: name, sub: (u) => u.email },
      { key: 'phone', header: 'Phone', kind: 'mono', value: (u) => u.phone, hideBelow: 'lg' },
      ...(segment
        ? []
        : [
            {
              key: 'roles',
              header: 'Roles',
              kind: 'tags' as const,
              value: (u: User) => u.roles.map((r) => USER_ROLE_LABELS[r]),
            },
          ]),
      { key: 'location', header: 'Location', value: (u) => location(u.location.district, u.location.state), hideBelow: 'md' },
      { key: 'kyc', header: 'KYC', kind: 'status', value: (u) => u.kyc, statusMap: KYC_STATUS },
      { key: 'status', header: 'Account', kind: 'status', value: (u) => u.accountStatus },
      { key: 'joined', header: 'Joined', kind: 'date', value: (u) => u.joinedAt, hideBelow: 'xl' },
      { key: 'active', header: 'Last active', kind: 'relative', value: (u) => u.lastActiveAt, hideBelow: 'lg' },
    ],
    filters: [
      ...(segment
        ? []
        : [
            {
              key: 'role',
              label: 'Role',
              options: ALL_USER_ROLES.map((r) => ({ value: r, label: USER_ROLE_LABELS[r] })),
              match: (u: User, v: string) => u.roles.includes(v as UserRole),
            },
          ]),
      {
        key: 'kyc',
        label: 'KYC',
        options: Object.entries(KYC_STATUS).map(([value, d]) => ({ value, label: d.label })),
        match: (u, v) => u.kyc === v,
      },
      stateFilter((u) => u.location.state),
    ],
    kpis: (rows) => {
      const active = count(rows, (u) => u.accountStatus === 'active')
      const verified = count(rows, (u) => u.kyc === 'approved')
      const newThisMonth = count(rows, (u) => new Date(u.joinedAt) >= monthStart())
      return [
        { label: `Total ${label.toLowerCase()}`, value: rows.length, icon: Users, highlight: true, hint: `${newThisMonth} joined this month`, hintTone: 'accent' },
        { label: 'Active accounts', value: active, hint: `${pct(active, rows.length)}% of total`, icon: UserCheck },
        { label: 'KYC verified', value: `${pct(verified, rows.length)}%`, hint: `${count(rows, (u) => u.kyc === 'pending')} awaiting review`, hintTone: 'warning', icon: ShieldCheck },
        { label: 'Suspended or banned', value: count(rows, (u) => u.accountStatus === 'suspended' || u.accountStatus === 'banned'), icon: UserX, hint: 'Review weekly', hintTone: 'default' },
      ]
    },
    detail: [],
    actions: [
      {
        id: 'suspend',
        label: 'Suspend',
        icon: PauseCircle,
        tone: 'danger',
        bulk: true,
        when: (u) => u.accountStatus === 'active' || u.accountStatus === 'inactive',
        confirm: {
          title: (u) => `Suspend ${name(u)}?`,
          description: 'They are signed out, their listings are hidden and payouts are held.',
          destructive: true,
          reasonRequired: true,
          reasonOptions: SUSPEND_REASONS,
          choice: {
            label: 'Duration',
            options: [
              { value: 'indefinite', label: 'Indefinite' },
              { value: 'until', label: 'Until date' },
            ],
          },
          date: { label: 'Suspended until', showWhenChoice: 'until' },
          confirmLabel: 'Suspend account',
        },
        run: (u, input) => ({
          patch: { accountStatus: 'suspended' },
          audit: input.date ? `Suspended user until ${new Date(input.date).toLocaleDateString('en-IN')}` : 'Suspended user',
          toast: `${name(u)} suspended`,
          severity: 'warning',
        }),
      },
      {
        id: 'reactivate',
        label: 'Reactivate',
        icon: PlayCircle,
        tone: 'primary',
        bulk: true,
        when: (u) => u.accountStatus === 'suspended' || u.accountStatus === 'inactive',
        confirm: { title: (u) => `Reactivate ${name(u)}?`, description: 'They can sign in and transact again.' },
        run: (u) => ({ patch: { accountStatus: 'active' }, audit: 'Reactivated user', toast: `${name(u)} reactivated` }),
      },
      {
        id: 'ban',
        label: 'Ban permanently',
        icon: Ban,
        tone: 'danger',
        when: (u) => u.accountStatus !== 'banned',
        confirm: {
          title: (u) => `Permanently ban ${name(u)}?`,
          description: 'Bans block the phone number, PAN and device from creating new accounts.',
          destructive: true,
          reasonRequired: true,
          reasonOptions: ['Confirmed fraud', 'Illegal or prohibited goods', 'Abuse or harassment', 'Identity theft'],
          confirmLabel: 'Ban user',
        },
        run: () => ({ patch: { accountStatus: 'banned' }, audit: 'Banned user', severity: 'critical' }),
      },
      {
        id: 'request-kyc',
        label: 'Request KYC',
        icon: MailCheck,
        bulk: true,
        when: (u) => u.kyc === 'none' || u.kyc === 'rejected',
        confirm: {
          title: 'Ask for KYC documents?',
          description: 'Sends an SMS and in-app prompt to upload Aadhaar / PAN.',
          confirmLabel: 'Send request',
        },
        run: () => ({ patch: { kyc: 'pending' }, audit: 'Requested KYC documents' }),
      },
    ],
  }
}

export const allUsersResource = usersResource()
export const buyersResource = usersResource({ role: 'buyer', plural: 'Buyers' })
export const sellersUsersResource = usersResource({ role: 'seller', plural: 'Sellers' })
export const rentalOwnersResource = usersResource({ role: 'rental_provider', plural: 'Rental owners' })
export const driversUsersResource = usersResource({ role: 'driver', plural: 'Drivers' })
export const laborUsersResource = usersResource({ role: 'labor_provider', plural: 'Labor providers' })
export const warehouseOwnersResource = usersResource({ role: 'warehouse_owner', plural: 'Warehouse owners' })
export const expertsUsersResource = usersResource({ role: 'expert', plural: 'Experts' })

const ADMIN_STATUS: Record<AdminUser['status'], StatusDef> = {
  active: s('Active', 'success'),
  inactive: s('Deactivated', 'default'),
}

export const adminsResource: ResourceConfig<AdminUser> = {
  collection: 'admins',
  module: 'roles',
  entity: 'Admin',
  entityPlural: 'Admins',
  title: (a) => a.name,
  subtitle: (a) => `${a.email} · ${ADMIN_ROLE_LABELS[a.role]}`,
  searchText: (a) => `${a.name} ${a.email} ${ADMIN_ROLE_LABELS[a.role]}`,
  status: { value: (a) => a.status, map: ADMIN_STATUS },
  columns: [
    { key: 'name', header: 'Admin', kind: 'person', value: (a) => a.name, sub: (a) => a.email },
    { key: 'role', header: 'Role', value: (a) => ADMIN_ROLE_LABELS[a.role] },
    { key: 'mfa', header: '2FA', kind: 'boolean', value: (a) => Boolean(a.mfa) },
    { key: 'status', header: 'Status', kind: 'status', value: (a) => a.status },
    { key: 'lastLogin', header: 'Last login', kind: 'relative', value: (a) => a.lastLogin },
    { key: 'created', header: 'Added', kind: 'date', value: (a) => a.createdAt, hideBelow: 'lg' },
  ],
  kpis: (rows) => [
    { label: 'Console admins', value: rows.length, icon: Users },
    { label: 'Active', value: count(rows, (a) => a.status === 'active'), icon: UserCheck },
    { label: '2FA enabled', value: `${pct(count(rows, (a) => Boolean(a.mfa)), rows.length)}%`, hint: '100% required by policy', hintTone: 'warning', icon: KeyRound },
    { label: 'Signed in today', value: count(rows, (a) => !!a.lastLogin && Date.now() - new Date(a.lastLogin).getTime() < 86400000), icon: ShieldCheck },
  ],
  detail: [
    {
      title: 'Account',
      fields: [
        { label: 'Email', value: (a) => a.email },
        { label: 'Role', value: (a) => ADMIN_ROLE_LABELS[a.role] },
        { label: 'Two-factor auth', kind: 'boolean', value: (a) => Boolean(a.mfa) },
        { label: 'Last login', kind: 'datetime', value: (a) => a.lastLogin },
        { label: 'Added', kind: 'date', value: (a) => a.createdAt },
      ],
    },
  ],
  related: () => [{ label: 'Role management', href: '/roles-permissions' }, { label: 'Audit log', href: '/audit-log' }],
  actions: [
    {
      id: 'reset-2fa',
      label: 'Reset 2FA',
      icon: KeyRound,
      confirm: { title: (a) => `Reset 2FA for ${a.name}?`, description: 'They must enrol a new authenticator on next login.', confirmLabel: 'Reset 2FA' },
      run: () => ({ patch: { mfa: false }, audit: 'Reset two-factor authentication', severity: 'warning' }),
    },
    {
      id: 'change-role',
      label: 'Change role',
      icon: ShieldCheck,
      when: (a) => a.status === 'active',
      confirm: {
        title: (a) => `Change role for ${a.name}`,
        description: 'Permissions update on their next page load.',
        choice: {
          label: 'New role',
          options: (['ops_admin', 'support_agent', 'finance_admin', 'auditor'] as AdminRole[]).map((r) => ({
            value: r,
            label: ADMIN_ROLE_LABELS[r],
          })),
        },
        reasonLabel: 'Reason',
        reasonRequired: true,
        confirmLabel: 'Change role',
      },
      run: (a, input) => {
        const role = (input.choice ?? a.role) as AdminRole
        return {
          patch: { role, permissions: perms(role), updatedAt: new Date().toISOString() },
          audit: `Changed role ${ADMIN_ROLE_LABELS[a.role]} → ${ADMIN_ROLE_LABELS[role]}`,
          severity: 'critical',
        }
      },
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: UserX,
      tone: 'danger',
      when: (a) => a.status === 'active' && a.role !== 'super_admin',
      permission: 'delete',
      confirm: {
        title: (a) => `Deactivate ${a.name}?`,
        description: 'Their sessions end immediately. Records they created are kept.',
        destructive: true,
        reasonRequired: true,
        reasonOptions: ['Left the company', 'Role change', 'Security concern'],
        confirmLabel: 'Deactivate',
      },
      run: () => ({ patch: { status: 'inactive' }, audit: 'Deactivated admin', severity: 'critical' }),
    },
    {
      id: 'reactivate',
      label: 'Reactivate',
      icon: PlayCircle,
      tone: 'primary',
      when: (a) => a.status === 'inactive',
      confirm: { title: (a) => `Reactivate ${a.name}?` },
      run: () => ({ patch: { status: 'active' }, audit: 'Reactivated admin' }),
    },
  ],
  create: {
    label: 'Invite admin',
    description: 'They receive an email invite and must set up 2FA on first login.',
    idPrefix: 'admin-',
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, placeholder: 'e.g. Kavita Rao' },
      { name: 'email', label: 'Work email', type: 'text', required: true, placeholder: 'name@cropvibe.com' },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: (['ops_admin', 'support_agent', 'finance_admin', 'auditor', 'super_admin'] as AdminRole[]).map((r) => ({
          value: r,
          label: ADMIN_ROLE_LABELS[r],
        })),
      },
    ],
    build: (v, id) => {
      const role = v.role as AdminRole
      const now = new Date().toISOString()
      return {
        id,
        name: v.name!,
        email: v.email!,
        role,
        permissions: perms(role),
        status: 'active',
        mfa: false,
        createdAt: now,
        updatedAt: now,
      }
    },
  },
}
