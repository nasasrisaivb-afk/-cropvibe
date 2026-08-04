'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getUserById, updateUserStatus, softDeleteUser, addUserNote } from '@/lib/api/users.api'
import { getListings } from '@/lib/api/listings.api'
import { getTransactions } from '@/lib/api/transactions.api'
import { getDisputes } from '@/lib/api/disputes.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/loading'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { USER_ROLE_LABELS } from '@/lib/types'
import { formatInr, formatPhone, relativeTime } from '@/lib/utils'

const tabs = ['Overview', 'Listings', 'Transactions', 'Disputes', 'Notes', 'Activity Log'] as const

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview')
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
  })
  const { data: userListings } = useQuery({
    queryKey: ['user-listings', userId],
    queryFn: () => getListings({ search: user?.firstName, limit: 20 }),
    enabled: !!user && tab === 'Listings',
  })
  const { data: userTx } = useQuery({
    queryKey: ['user-tx', userId],
    queryFn: () => getTransactions({ search: user?.firstName, limit: 20 }),
    enabled: !!user && tab === 'Transactions',
  })
  const { data: userDisputes } = useQuery({
    queryKey: ['user-disputes', userId],
    queryFn: () => getDisputes({ search: user?.firstName, limit: 20 }),
    enabled: !!user && tab === 'Disputes',
  })

  const statusMut = useMutation({
    mutationFn: (status: 'active' | 'suspended') => updateUserStatus(userId, status, reason),
    onSuccess: () => {
      toast.success('User status updated')
      void qc.invalidateQueries({ queryKey: ['users', userId] })
      setSuspendOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: () => softDeleteUser(userId, reason || 'Soft delete'),
    onSuccess: () => {
      toast.success('User soft-deleted')
      void qc.invalidateQueries({ queryKey: ['users', userId] })
      setDeleteOpen(false)
    },
  })

  const noteMut = useMutation({
    mutationFn: () => addUserNote(userId, note, 'Raj Kumar'),
    onSuccess: () => {
      toast.success('Note added')
      setNote('')
      void qc.invalidateQueries({ queryKey: ['users', userId] })
    },
  })

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!user) return <p className="text-text-secondary">User not found</p>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push('/users')}>
        ← Back
      </Button>
      <h1 className="text-3xl font-bold">
        {USER_ROLE_LABELS[user.roles[0]!]} Profile: {user.firstName} {user.lastName}
      </h1>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit lg:sticky lg:top-4">
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
              <p className="mt-3 font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-text-secondary">{USER_ROLE_LABELS[user.roles[0]!]}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant={user.kyc === 'approved' ? 'success' : 'pending'}>KYC {user.kyc}</Badge>
                <Badge variant={user.accountStatus === 'active' ? 'success' : 'error'}>
                  {user.accountStatus}
                </Badge>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-text-muted">Phone</dt>
                <dd className="font-mono">{formatPhone(user.phone)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Location</dt>
                <dd>
                  {user.location.district}, {user.location.state}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Joined</dt>
                <dd>{new Date(user.joinedAt).toLocaleDateString('en-IN')}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Last active</dt>
                <dd>{user.lastActiveAt ? relativeTime(user.lastActiveAt) : '—'}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                onClick={() => window.open(`/app/users/${user.id}`, '_blank')}
              >
                View in App
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.message(`You are impersonating ${user.firstName} (dev stub)`)}
              >
                Impersonate
              </Button>
              {user.accountStatus === 'active' ? (
                <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                  <DialogTrigger asChild>
                    <Button variant="danger">Suspend User</Button>
                  </DialogTrigger>
                  <DialogContent title="Suspend user" description="Provide a reason for suspension.">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mb-3 h-24 w-full rounded-lg border border-border-default bg-bg-surface p-2 text-sm"
                      placeholder="Reason"
                    />
                    <Button
                      variant="danger"
                      className="w-full"
                      loading={statusMut.isPending}
                      onClick={() => statusMut.mutate('suspended')}
                    >
                      Confirm suspend
                    </Button>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button loading={statusMut.isPending} onClick={() => statusMut.mutate('active')}>
                  Reactivate
                </Button>
              )}
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Delete (soft)</Button>
                </DialogTrigger>
                <DialogContent title="Soft delete user" description="Data is retained for compliance.">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mb-3 h-24 w-full rounded-lg border border-border-default bg-bg-surface p-2 text-sm"
                    placeholder="Reason"
                  />
                  <Button
                    variant="danger"
                    className="w-full"
                    loading={deleteMut.isPending}
                    onClick={() => deleteMut.mutate()}
                  >
                    Confirm delete
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  tab === t
                    ? 'bg-brand-lime text-text-inverse'
                    : 'bg-bg-surfaceAlt text-text-secondary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Overview' ? (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Overview</h2>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-text-muted">PAN</p>
                  <p className="font-mono">{user.pan ?? '—'}</p>
                </div>
                <div>
                  <p className="text-text-muted">Aadhaar</p>
                  <p className="font-mono">{user.aadhaarMasked ?? '—'}</p>
                </div>
                <div>
                  <p className="text-text-muted">GST</p>
                  <p className="font-mono">{user.gst ?? '—'}</p>
                </div>
                <div>
                  <p className="text-text-muted">Roles</p>
                  <p>{user.roles.map((r) => USER_ROLE_LABELS[r]).join(', ')}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {tab === 'Listings' ? (
            <Card>
              <CardContent className="space-y-2 pt-5">
                {(userListings?.data ?? [])
                  .filter((l) => l.sellerId === user.id)
                  .map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-border-light p-3 text-left hover:bg-bg-surfaceHover"
                      onClick={() => router.push(`/listings/${l.id}`)}
                    >
                      <span>{l.title}</span>
                      <Badge>{l.status}</Badge>
                    </button>
                  ))}
                {(userListings?.data ?? []).filter((l) => l.sellerId === user.id).length === 0 ? (
                  <p className="text-sm text-text-muted">No listings</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {tab === 'Transactions' ? (
            <Card>
              <CardContent className="space-y-2 pt-5">
                {(userTx?.data ?? []).slice(0, 15).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border-light p-3 text-sm"
                  >
                    <span className="font-mono">{t.id}</span>
                    <span>{formatInr(t.amount)}</span>
                    <Badge variant={t.status === 'completed' ? 'success' : 'warning'}>{t.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {tab === 'Disputes' ? (
            <Card>
              <CardContent className="space-y-2 pt-5">
                {(userDisputes?.data ?? [])
                  .filter((d) => d.buyerId === user.id || d.sellerId === user.id)
                  .map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className="flex w-full justify-between rounded-lg border border-border-light p-3 text-left text-sm hover:bg-bg-surfaceHover"
                      onClick={() => router.push(`/disputes/${d.id}`)}
                    >
                      <span>{d.id}</span>
                      <Badge>{d.status}</Badge>
                    </button>
                  ))}
              </CardContent>
            </Card>
          ) : null}

          {tab === 'Notes' ? (
            <Card>
              <CardContent className="space-y-4 pt-5">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-24 w-full rounded-lg border border-border-default bg-bg-base p-3 text-sm"
                  placeholder="Internal admin notes…"
                />
                <Button disabled={!note.trim()} loading={noteMut.isPending} onClick={() => noteMut.mutate()}>
                  Add note
                </Button>
                <ul className="space-y-3">
                  {(user.notes ?? []).map((n) => (
                    <li key={n.id} className="rounded-lg border border-border-light p-3 text-sm">
                      <p>{n.text}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {n.adminName} · {relativeTime(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {tab === 'Activity Log' ? (
            <Card>
              <CardContent className="space-y-2 pt-5 text-sm">
                <div className="rounded-lg border border-border-light p-3">
                  Joined · {new Date(user.joinedAt).toLocaleString('en-IN')} · web
                </div>
                {user.lastActiveAt ? (
                  <div className="rounded-lg border border-border-light p-3">
                    Last active · {new Date(user.lastActiveAt).toLocaleString('en-IN')} · mobile app
                  </div>
                ) : null}
                <div className="rounded-lg border border-border-light p-3">
                  KYC status · {user.kyc}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
