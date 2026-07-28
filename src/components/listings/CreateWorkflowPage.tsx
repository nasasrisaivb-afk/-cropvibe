import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import type { Role } from '../../types/roles'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/format'

const SELLER_CATEGORIES = ['Fruits', 'Vegetables', 'Grains', 'Dairy Products', 'Seeds', 'Fertilizers', 'Pesticides', 'Organic Produce', 'Livestock Products']
const RENTAL_TYPES = ['Machinery', 'Equipment', 'Labour', 'Driver Services', 'Warehouse Storage']
const SERVICE_TYPES = ['Soil Testing', 'Farm Consultancy', 'Mechanic Services', 'Irrigation Services', 'Equipment Repair', 'Drone Spraying', 'Crop Inspection']
const COURSE_CATEGORIES = ['Organic Farming', 'Crop Management', 'Soil & Nutrition', 'Pest Management', 'Equipment & Machinery', 'Business & Marketing', 'Other']

function Progress({ step, total, color }: { step: number; total: number; color: string }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex justify-between text-sm text-slate-500">
        <span>Step {step} of {total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full transition-all" style={{ width: `${(step / total) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function SellerCreateFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    category: '', name: '', variety: '', description: '', origin: '', harvestDate: '', storage: '',
    sizeWeight: '', shelfLife: '', moq: '', unit: 'kg', price: '', quantity: '', reorderLevel: '', availableTill: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const price = Number(form.price) || 0
  const fee = price * 0.15
  const earnings = price - fee

  const update = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }))
    setErrors((p) => {
      const n = { ...p }
      delete n[k]
      return n
    })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (step === 1 && !form.category) e.category = 'Select a category'
    if (step === 2) {
      if (!form.name.trim()) e.name = 'Required'
      if (form.description.trim().length < 50) e.description = 'Min 50 characters'
      if (!form.origin.trim()) e.origin = 'Required'
    }
    if (step === 3 && !form.moq) e.moq = 'Required'
    if (step === 4) {
      if (!form.price) e.price = 'Required'
      if (!form.quantity) e.quantity = 'Required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <Card>
      <h1 className="mb-2 text-2xl font-bold">Create Product Listing</h1>
      <Progress step={step} total={5} color="#2D5016" />

      {step === 1 && (
        <div>
          <h3 className="mb-3 font-semibold">What are you selling?</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {SELLER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => update('category', cat)}
                className={cn('rounded-md border-2 px-4 py-3 text-left text-sm', form.category === cat ? 'border-green-800 bg-green-50 font-semibold' : 'border-slate-200')}
              >
                {form.category === cat ? '◉' : '○'} {cat}
              </button>
            ))}
          </div>
          {errors.category ? <p className="mt-2 text-sm text-red-600">{errors.category}</p> : null}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <FormInput label="Product Name" value={form.name} onChange={(e) => update('name', e.target.value)} required error={errors.name} />
          <Select label="Variety / Grade" value={form.variety} onChange={(e) => update('variety', e.target.value)} options={['A Grade', 'B Grade', 'Premium', 'Standard'].map((o) => ({ value: o, label: o }))} />
          <FormInput label="Description" as="textarea" value={form.description} onChange={(e) => update('description', e.target.value)} required error={errors.description} helperText="Min 50 characters" />
          <FormInput label="Origin / Source" value={form.origin} onChange={(e) => update('origin', e.target.value)} required error={errors.origin} placeholder="e.g., Nashik District" />
          <FormInput label="Harvesting Date" type="date" value={form.harvestDate} onChange={(e) => update('harvestDate', e.target.value)} />
          <Select label="Storage Conditions" value={form.storage} onChange={(e) => update('storage', e.target.value)} options={['Ambient', 'Cold Storage', 'Refrigerated'].map((o) => ({ value: o, label: o }))} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
            <p className="font-medium">Upload Images (min 3, max 10)</p>
            <p className="text-xs text-slate-500">1024×1024 recommended, &lt; 5MB each</p>
            <input type="file" accept="image/*" multiple className="mt-3" />
          </div>
          <FormInput label="Size / Weight" value={form.sizeWeight} onChange={(e) => update('sizeWeight', e.target.value)} placeholder="Medium, 150-200g" />
          <FormInput label="Shelf Life" value={form.shelfLife} onChange={(e) => update('shelfLife', e.target.value)} placeholder="5-7 days" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="MOQ" type="number" value={form.moq} onChange={(e) => update('moq', e.target.value)} required error={errors.moq} />
            <Select label="Unit" value={form.unit} onChange={(e) => update('unit', e.target.value)} options={['kg', 'boxes', 'pieces', 'dozen'].map((o) => ({ value: o, label: o }))} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <FormInput label={`Price per ${form.unit}`} type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required error={errors.price} />
          <FormInput label="Quantity Available" type="number" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} required error={errors.quantity} />
          <FormInput label="Reorder Level" type="number" value={form.reorderLevel} onChange={(e) => update('reorderLevel', e.target.value)} helperText="Alert when stock drops below this" />
          <FormInput label="Available Till" type="date" value={form.availableTill} onChange={(e) => update('availableTill', e.target.value)} />
          {price > 0 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p>Base Price: {formatCurrency(price)}/{form.unit}</p>
              <p>Platform Fee: {formatCurrency(fee)}/{form.unit} (15%)</p>
              <p className="font-semibold text-green-800">Your Earnings: {formatCurrency(earnings)}/{form.unit} (85%)</p>
            </div>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-3 text-sm">
          <h3 className="text-lg font-semibold">Review & Publish</h3>
          <p><strong>Category:</strong> {form.category}</p>
          <p><strong>Product:</strong> {form.name}</p>
          <p><strong>Origin:</strong> {form.origin}</p>
          <p><strong>Price:</strong> {formatCurrency(price)}/{form.unit}</p>
          <p><strong>MOQ:</strong> {form.moq} {form.unit}</p>
          <p className="text-slate-600">{form.description}</p>
          <p className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">Your listing will go live after quick review (usually &lt; 1 hour).</p>
        </div>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="secondary" roleColor="seller" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Previous</Button>
        <div className="flex gap-2">
          {step === 5 && <Button variant="secondary" roleColor="seller" onClick={onDone}>Save Draft</Button>}
          <Button
            roleColor="seller"
            onClick={() => {
              if (!validate()) return
              if (step === 5) onDone()
              else setStep((s) => s + 1)
            }}
          >
            {step === 5 ? 'Publish Listing' : 'Next'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function RentalCreateFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ type: '', name: '', power: '', condition: '', rate: '', unit: 'day', deposit: '', area: '25' })
  const rate = Number(form.rate) || 0

  return (
    <Card>
      <h1 className="mb-2 text-2xl font-bold">Add Equipment</h1>
      <Progress step={step} total={5} color="#6B4423" />
      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {RENTAL_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, type: t }))} className={cn('rounded-md border-2 px-4 py-3 text-left text-sm', form.type === t ? 'border-amber-900 bg-amber-50 font-semibold' : 'border-slate-200')}>
              {form.type === t ? '◉' : '○'} {t}
            </button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <FormInput label="Equipment Name/Model" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <FormInput label="Power (HP)" type="number" value={form.power} onChange={(e) => setForm((p) => ({ ...p, power: e.target.value }))} />
          <Select label="Condition" value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))} options={['Excellent', 'Good', 'Fair'].map((o) => ({ value: o, label: o }))} />
          <div className="rounded-lg border-2 border-dashed p-4"><p className="text-sm font-medium">Ownership Proof</p><input type="file" className="mt-2" /></div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed p-6 text-center">
            <p className="font-medium">Upload Photos (min 4)</p>
            <input type="file" accept="image/*" multiple className="mt-3" />
          </div>
          {['Working condition', 'Tires/wheels good', 'No major dents', 'Lights working', 'Documentation complete'].map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> {c}</label>
          ))}
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <FormInput label="Rental Rate" type="number" value={form.rate} onChange={(e) => setForm((p) => ({ ...p, rate: e.target.value }))} required />
          <Select label="Time Unit" value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} options={['day', 'hour', 'shift'].map((o) => ({ value: o, label: `Per ${o}` }))} />
          <FormInput label="Security Deposit" type="number" value={form.deposit} onChange={(e) => setForm((p) => ({ ...p, deposit: e.target.value }))} />
          <FormInput label="Service Area (km)" type="number" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} />
          {rate > 0 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p>Rate: {formatCurrency(rate)}/{form.unit}</p>
              <p>Platform fee: {formatCurrency(rate * 0.15)} (15%)</p>
              <p className="font-semibold text-amber-900">Your earnings: {formatCurrency(rate * 0.85)} (85%)</p>
            </div>
          )}
        </div>
      )}
      {step === 5 && (
        <div className="space-y-2 text-sm">
          <p><strong>Type:</strong> {form.type}</p>
          <p><strong>Name:</strong> {form.name}</p>
          <p><strong>Rate:</strong> {formatCurrency(rate)}/{form.unit}</p>
        </div>
      )}
      <div className="mt-8 flex justify-between">
        <Button variant="secondary" roleColor="rental" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Previous</Button>
        <Button roleColor="rental" onClick={() => (step === 5 ? onDone() : setStep((s) => s + 1))}>{step === 5 ? 'Publish' : 'Next'}</Button>
      </div>
    </Card>
  )
}

function ServiceCreateFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ type: '', name: '', description: '', duration: '2 hours', price: '', area: '25' })
  const price = Number(form.price) || 0

  return (
    <Card>
      <h1 className="mb-2 text-2xl font-bold">Create Service Offering</h1>
      <Progress step={step} total={5} color="#5D4E37" />
      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICE_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, type: t }))} className={cn('rounded-md border-2 px-4 py-3 text-left text-sm', form.type === t ? 'border-stone-700 bg-stone-50 font-semibold' : 'border-slate-200')}>
              {form.type === t ? '◉' : '○'} {t}
            </button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <FormInput label="Service Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <FormInput label="Description" as="textarea" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
          {['Soil sample analysis', 'Nutrient report', 'Fertilizer recommendations', 'Follow-up consultation'].map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" /> {c}</label>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <FormInput label="Service Area (km)" type="number" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} />
          <Select label="Appointment Duration" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} options={['30 mins', '1 hour', '2 hours', '3 hours', 'Half-day', 'Full-day'].map((o) => ({ value: o, label: o }))} />
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <FormInput label="Service Price" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          {price > 0 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p>Service Price: {formatCurrency(price)}</p>
              <p>Platform Fee: {formatCurrency(price * 0.15)} (15%)</p>
              <p className="font-semibold text-stone-700">Your Earnings: {formatCurrency(price * 0.85)}</p>
            </div>
          )}
        </div>
      )}
      {step === 5 && (
        <div className="space-y-2 text-sm">
          <p><strong>Type:</strong> {form.type}</p>
          <p><strong>Name:</strong> {form.name}</p>
          <p><strong>Price:</strong> {formatCurrency(price)}</p>
          <p>{form.description}</p>
        </div>
      )}
      <div className="mt-8 flex justify-between">
        <Button variant="secondary" roleColor="service" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Previous</Button>
        <Button roleColor="service" onClick={() => (step === 5 ? onDone() : setStep((s) => s + 1))}>{step === 5 ? 'Publish' : 'Next'}</Button>
      </div>
    </Card>
  )
}

function EducatorCreateFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ title: '', category: '', shortDesc: '', fullDesc: '', audience: '', level: '', price: '', paid: 'Paid' })
  const [outcomes, setOutcomes] = useState(['', '', ''])
  const price = Number(form.price) || 0

  return (
    <Card>
      <h1 className="mb-2 text-2xl font-bold">Create Course</h1>
      <Progress step={step} total={5} color="#4A235A" />
      {step === 1 && (
        <div className="space-y-4">
          <FormInput label="Course Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <Select label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} options={COURSE_CATEGORIES.map((o) => ({ value: o, label: o }))} />
          <FormInput label="Short Description" value={form.shortDesc} onChange={(e) => setForm((p) => ({ ...p, shortDesc: e.target.value }))} maxLength={50} helperText="50 chars max" />
          <FormInput label="Full Description" as="textarea" value={form.fullDesc} onChange={(e) => setForm((p) => ({ ...p, fullDesc: e.target.value }))} />
          <FormInput label="Target Audience" value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))} />
          <Select label="Difficulty" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} options={['Beginner', 'Intermediate', 'Advanced'].map((o) => ({ value: o, label: o }))} />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Add modules and lessons (demo structure).</p>
          <FormInput label="Module 1 Name" placeholder="Introduction to Soil Health" />
          <FormInput label="Lesson 1 Title" placeholder="What is soil composition?" />
          <Select label="Content Type" value="Video" onChange={() => undefined} options={['Video', 'Document', 'Quiz', 'Assignment'].map((o) => ({ value: o, label: o }))} />
          <input type="file" className="block w-full text-sm" />
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <p className="font-medium">What will students learn? (at least 3)</p>
          {outcomes.map((o, i) => (
            <FormInput key={i} label={`Outcome ${i + 1}`} value={o} onChange={(e) => setOutcomes((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))} required />
          ))}
          <Button type="button" variant="secondary" roleColor="educator" onClick={() => setOutcomes((p) => [...p, ''])}>+ Add more</Button>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <Select label="Course Type" value={form.paid} onChange={(e) => setForm((p) => ({ ...p, paid: e.target.value }))} options={['Paid', 'Free'].map((o) => ({ value: o, label: o }))} />
          {form.paid === 'Paid' && (
            <FormInput label="Price" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          )}
          {price > 0 && form.paid === 'Paid' && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p>Course Price: {formatCurrency(price)}</p>
              <p>Platform Fee: {formatCurrency(price * 0.15)}</p>
              <p className="font-semibold text-purple-900">Your Earnings: {formatCurrency(price * 0.85)}</p>
            </div>
          )}
        </div>
      )}
      {step === 5 && (
        <div className="space-y-2 text-sm">
          <p><strong>Title:</strong> {form.title}</p>
          <p><strong>Category:</strong> {form.category}</p>
          <p><strong>Level:</strong> {form.level}</p>
          <p><strong>Price:</strong> {form.paid === 'Free' ? 'Free' : formatCurrency(price)}</p>
        </div>
      )}
      <div className="mt-8 flex justify-between">
        <Button variant="secondary" roleColor="educator" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Previous</Button>
        <Button roleColor="educator" onClick={() => (step === 5 ? onDone() : setStep((s) => s + 1))}>{step === 5 ? 'Publish' : 'Next'}</Button>
      </div>
    </Card>
  )
}

function BuyerSupplierFlow() {
  const [query, setQuery] = useState('')
  const suppliers = useMemo(
    () =>
      [
        { name: 'Green Valley', location: 'Nashik', rating: 4.8, specialties: 'Tomatoes', moq: '50kg', price: '₹45/kg' },
        { name: 'Fresh Farm', location: 'Pune', rating: 4.6, specialties: 'Potatoes', moq: '100kg', price: '₹28/kg' },
        { name: 'Organic Roots', location: 'Hyderabad', rating: 4.9, specialties: 'Lettuce', moq: '20kg', price: '₹60/kg' },
      ].filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.specialties.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Find Suppliers</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find suppliers by product"
        className="focus-ring w-full rounded-md border border-slate-300 px-4 py-3"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <Card key={s.name}>
            <p className="font-semibold">{s.name}</p>
            <p className="text-xs text-slate-500">{s.location} · {s.rating}⭐</p>
            <p className="mt-2 text-sm">{s.specialties} · MOQ {s.moq}</p>
            <p className="text-sm font-medium text-blue-900">{s.price}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" roleColor="buyer">♡ Save</Button>
              <Button size="sm" roleColor="buyer">Send Quote</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function CreateWorkflowPage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const role = (user?.activeRole ?? 'seller') as Role
  const kycPending = user?.kycStatus === 'pending'

  if (kycPending && role !== 'buyer') {
    return (
      <Card>
        <h1 className="text-xl font-bold">Feature Locked</h1>
        <p className="mt-2 text-sm text-slate-600">KYC approval required before creating listings, equipment, services, or courses.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Card>
    )
  }

  const onDone = () => navigate('/dashboard/listings')

  if (role === 'buyer') return <BuyerSupplierFlow />
  if (role === 'rental') return <RentalCreateFlow onDone={onDone} />
  if (role === 'service') return <ServiceCreateFlow onDone={onDone} />
  if (role === 'educator') return <EducatorCreateFlow onDone={onDone} />
  return <SellerCreateFlow onDone={onDone} />
}
