import type { Role } from '../types/roles'

export interface ActionItem {
  id: string
  title: string
  detail: string
  cta: string
  page: string
  urgency: 'high' | 'medium' | 'low'
}

export interface KpiItem {
  title: string
  value: string
  hint: string
  positive?: boolean
}

export interface IntelCard {
  kind: 'mandi' | 'weather' | 'scheme'
  title: string
  body: string
  meta: string
  page: string
}

export interface HomeConfig {
  kpis: KpiItem[]
  actions: ActionItem[]
  intel: IntelCard[]
  chartTitle: string
  chartHint: string
  chartPoints: { label: string; value: number }[]
  activity: { time: string; text: string }[]
}

export const HOME_CONTENT: Record<Role, HomeConfig> = {
  seller: {
    kpis: [
      { title: 'Active listings', value: '28', hint: '2 published today', positive: true },
      { title: "This month's earnings", value: '₹ 45,320', hint: '12% vs last month', positive: true },
      { title: 'Orders to act on', value: '3', hint: 'Awaiting accept / dispatch' },
      { title: 'Rating', value: '4.7 / 5', hint: '156 reviews' },
    ],
    actions: [
      { id: 'a1', title: '3 new orders to accept', detail: 'FreshStore, Green Mart, Organic Hub', cta: 'Review orders', page: 'orders', urgency: 'high' },
      { id: 'a2', title: 'Dispatch due today', detail: 'PO-8923 tomatoes — packing photos needed', cta: 'Dispatch', page: 'orders', urgency: 'high' },
      { id: 'a3', title: '2 RFQs matching your crops', detail: 'Tomato 2t · Potato 5t within 40 km', cta: 'Respond', page: 'quotes', urgency: 'medium' },
      { id: 'a4', title: 'Scheme deadline in 5 days', detail: 'PM-KISAN instalment window — official link', cta: 'View scheme', page: 'schemes', urgency: 'medium' },
    ],
    intel: [
      { kind: 'mandi', title: 'Tomato · Nagpur mandi', body: 'Modal ₹ 2,140 / qtl', meta: 'AGMARKNET · updated 2h ago', page: 'mandi' },
      { kind: 'weather', title: 'Nagpur forecast', body: 'Rain 60% tomorrow · delay dispatch', meta: 'IMD · updated 40m ago', page: 'weather' },
      { kind: 'scheme', title: 'Likely relevant', body: 'PM-KISAN instalment window open', meta: 'Curated · last verified 12 Sep 2026', page: 'schemes' },
    ],
    chartTitle: 'Earnings',
    chartHint: 'Last 7 / 30 / 90 days',
    chartPoints: [
      { label: '17', value: 8200 },
      { label: '18', value: 11400 },
      { label: '19', value: 9600 },
      { label: '20', value: 15200 },
      { label: '21', value: 12800 },
      { label: '22', value: 18100 },
      { label: '23', value: 16400 },
    ],
    activity: [
      { time: '11:32', text: 'Order PO-8922 received from FreshStore' },
      { time: '10:15', text: 'Listing “Organic Tomatoes” approved' },
      { time: 'Yesterday', text: 'Quote sent for RFQ-441 tomato 2t' },
      { time: 'Yesterday', text: 'Payout of ₹ 25,000 marked pending' },
      { time: 'Mon', text: 'Buyer Green Mart left a 5★ review' },
    ],
  },
  buyer: {
    kpis: [
      { title: 'Open orders', value: '6', hint: '2 arriving this week' },
      { title: "This month's spend", value: '₹ 1,82,400', hint: '8% vs last month', positive: false },
      { title: 'RFQ responses', value: '11', hint: '3 quotes to compare' },
      { title: 'Active suppliers', value: '14', hint: '2 new this month', positive: true },
    ],
    actions: [
      { id: 'b1', title: 'Confirm delivery', detail: 'PO-8919 lettuce arrived — quality check', cta: 'Confirm receipt', page: 'orders', urgency: 'high' },
      { id: 'b2', title: 'Review 3 quotes', detail: 'RFQ tomato 2t — price vs mandi shown', cta: 'Compare', page: 'rfqs', urgency: 'high' },
      { id: 'b3', title: 'Invoice due tomorrow', detail: 'Green Valley · ₹ 42,800', cta: 'Pay', page: 'wallet', urgency: 'medium' },
    ],
    intel: [
      { kind: 'mandi', title: 'Potato · Pune mandi', body: 'Modal ₹ 1,260 / qtl · ↑ 4%', meta: 'AGMARKNET · updated 1h ago', page: 'mandi' },
      { kind: 'weather', title: 'Disruption risk', body: 'Heavy rain on Nashik–Pune corridor', meta: 'IMD · updated 30m ago', page: 'weather' },
    ],
    chartTitle: 'Spend by crop',
    chartHint: 'This month',
    chartPoints: [
      { label: 'Tom', value: 62000 },
      { label: 'Pot', value: 48000 },
      { label: 'Oni', value: 31000 },
      { label: 'Let', value: 22400 },
      { label: 'Car', value: 19000 },
    ],
    activity: [
      { time: '09:10', text: 'Quote received from Green Valley' },
      { time: 'Yesterday', text: 'PO-8918 dispatched from Nashik' },
      { time: 'Yesterday', text: 'Saved supplier Organic Roots' },
      { time: 'Mon', text: 'RFQ potato 5t closed — 4 quotes' },
      { time: 'Sun', text: 'Reorder of onions placed' },
    ],
  },
  rental: {
    kpis: [
      { title: 'Utilisation', value: '68%', hint: '↑ 5 pts vs last month', positive: true },
      { title: 'Upcoming bookings', value: '7', hint: '2 handovers tomorrow' },
      { title: "This month's revenue", value: '₹ 1,24,500', hint: '11% vs last month', positive: true },
      { title: 'Machines available', value: '5', hint: '1 in maintenance' },
    ],
    actions: [
      { id: 'r1', title: '4 booking requests', detail: 'Tractor #1 request expires in 2h', cta: 'Accept', page: 'bookings', urgency: 'high' },
      { id: 'r2', title: 'Handover due 9:00 AM', detail: 'Harvester #1 · ABC Farm — checklist', cta: 'Start handover', page: 'bookings', urgency: 'high' },
      { id: 'r3', title: 'Maintenance overdue', detail: 'Tractor #3 · 5 days past service', cta: 'Log service', page: 'maintenance', urgency: 'medium' },
      { id: 'r4', title: 'Insurance expiring', detail: 'Rotavator #1 RC insurance in 12 days', cta: 'Documents', page: 'equipment', urgency: 'low' },
    ],
    intel: [
      { kind: 'weather', title: 'Rain days this week', body: 'Thu–Fri wet · block field work', meta: 'IMD · updated 25m ago', page: 'weather' },
      { kind: 'scheme', title: 'Mechanisation support', body: 'CHC hiring subsidy — likely relevant', meta: 'Curated · last verified 08 Sep 2026', page: 'schemes' },
    ],
    chartTitle: 'Revenue',
    chartHint: 'Last 7 days',
    chartPoints: [
      { label: '17', value: 12000 },
      { label: '18', value: 18500 },
      { label: '19', value: 14200 },
      { label: '20', value: 21000 },
      { label: '21', value: 16800 },
      { label: '22', value: 25400 },
      { label: '23', value: 19800 },
    ],
    activity: [
      { time: '08:40', text: 'Booking BK-4418 requested for Sprayer #1' },
      { time: 'Yesterday', text: 'Tractor #2 returned — no damage' },
      { time: 'Yesterday', text: 'Deposit released to renter Farm Ltd' },
      { time: 'Mon', text: 'Maintenance completed on Sprayer #2' },
      { time: 'Sun', text: 'Operator Ramesh assigned to BK-4412' },
    ],
  },
  service: {
    kpis: [
      { title: "Today's appointments", value: '3', hint: 'Next at 10:30 AM' },
      { title: 'Pending requests', value: '5', hint: '2 expire today' },
      { title: "This month's revenue", value: '₹ 86,400', hint: '9% vs last month', positive: true },
      { title: 'Rating', value: '4.9 / 5', hint: '88 reviews' },
    ],
    actions: [
      { id: 's1', title: 'Accept 2 visit requests', detail: 'Soil test · pest advisory within 15 km', cta: 'Review', page: 'appointments', urgency: 'high' },
      { id: 's2', title: 'Submit pending report', detail: 'Visit with Meena Patil — draft since yesterday', cta: 'Write report', page: 'reports', urgency: 'high' },
      { id: 's3', title: 'Follow-up due', detail: 'Leaf blight case — 7 day check-in', cta: 'Open', page: 'appointments', urgency: 'medium' },
    ],
    intel: [
      { kind: 'weather', title: 'Visit-day weather', body: 'Clear this afternoon · rain after 6 PM', meta: 'IMD · updated 20m ago', page: 'weather' },
      { kind: 'mandi', title: 'Client crop prices', body: 'Soybean modal ₹ 4,320 / qtl', meta: 'AGMARKNET · updated 3h ago', page: 'mandi' },
      { kind: 'scheme', title: 'To share with farmer', body: 'Soil Health Card — likely relevant', meta: 'Curated · last verified 01 Sep 2026', page: 'schemes' },
    ],
    chartTitle: 'Appointments',
    chartHint: 'Last 7 days',
    chartPoints: [
      { label: '17', value: 2 },
      { label: '18', value: 4 },
      { label: '19', value: 3 },
      { label: '20', value: 5 },
      { label: '21', value: 2 },
      { label: '22', value: 6 },
      { label: '23', value: 3 },
    ],
    activity: [
      { time: '07:55', text: 'New consultancy request from Wardha' },
      { time: 'Yesterday', text: 'Field report shared with farmer' },
      { time: 'Yesterday', text: 'Video consult completed' },
      { time: 'Mon', text: 'Credential “IARI soil” verified' },
      { time: 'Sun', text: 'Portfolio case study published' },
    ],
  },
  educator: {
    kpis: [
      { title: 'Active learners', value: '142', hint: '18 new this week', positive: true },
      { title: 'Completion rate', value: '71%', hint: '↑ 3 pts', positive: true },
      { title: "This month's revenue", value: '₹ 38,920', hint: 'Paid enrolments' },
      { title: 'Rating', value: '4.8 / 5', hint: '64 reviews' },
    ],
    actions: [
      { id: 'e1', title: 'Grade 6 submissions', detail: 'Oldest first · Organic 101 quiz 3', cta: 'Grade', page: 'assessments', urgency: 'high' },
      { id: 'e2', title: '5 unanswered Q&A', detail: 'IPM Techniques · module 2', cta: 'Reply', page: 'qna', urgency: 'medium' },
      { id: 'e3', title: 'Course review feedback', detail: 'Soil Health Mastery needs 2 changes', cta: 'Open course', page: 'courses', urgency: 'medium' },
    ],
    intel: [],
    chartTitle: 'Enrolments',
    chartHint: 'Last 7 days',
    chartPoints: [
      { label: '17', value: 4 },
      { label: '18', value: 8 },
      { label: '19', value: 5 },
      { label: '20', value: 12 },
      { label: '21', value: 7 },
      { label: '22', value: 15 },
      { label: '23', value: 9 },
    ],
    activity: [
      { time: '12:04', text: 'New enrolment in Organic Farming 101' },
      { time: 'Yesterday', text: 'Certificate issued to 4 learners' },
      { time: 'Yesterday', text: 'Q&A pinned on irrigation module' },
      { time: 'Mon', text: 'Live session recording uploaded' },
      { time: 'Sun', text: 'Course submitted for admin review' },
    ],
  },
}
