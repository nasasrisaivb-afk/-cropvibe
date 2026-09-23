import type { WorkspaceListConfig } from '../components/workspace/WorkspaceListPage'

export const SELLER_QUOTES: WorkspaceListConfig = {
  title: 'Quotes',
  subtitle: 'RFQs matching your crops and area. Respond with price, qty, date and validity.',
  ctaLabel: 'Respond to RFQ',
  ctaPage: 'quotes',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'responded', label: 'Responded' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost / Expired' },
  ],
  columns: ['RFQ', 'Buyer', 'Crop', 'Qty', 'Target', 'Status'],
  empty: 'No RFQs match your crops yet.',
  rows: [
    { id: 'RFQ-441', tab: 'new', title: 'Tomato 2 t', subtitle: 'FreshStore · 38 km', status: { label: 'New', tone: 'warning' }, cells: ['RFQ-441', 'FreshStore', 'Tomato', '2 t', '₹2,050/qtl', 'New'] },
    { id: 'RFQ-442', tab: 'new', title: 'Potato 5 t', subtitle: 'Green Mart · 22 km', status: { label: 'New', tone: 'warning' }, cells: ['RFQ-442', 'Green Mart', 'Potato', '5 t', '₹1,180/qtl', 'New'] },
    { id: 'RFQ-430', tab: 'responded', title: 'Onion 3 t', subtitle: 'Organic Hub', status: { label: 'Responded', tone: 'info' }, cells: ['RFQ-430', 'Organic Hub', 'Onion', '3 t', '₹1,420/qtl', 'Responded'] },
    { id: 'RFQ-412', tab: 'won', title: 'Lettuce 400 kg', subtitle: 'Sunrise Agro', status: { label: 'Won', tone: 'success' }, cells: ['RFQ-412', 'Sunrise Agro', 'Lettuce', '400 kg', '₹55/kg', 'Won'] },
    { id: 'RFQ-401', tab: 'lost', title: 'Carrot 1 t', subtitle: 'Expired 2 days ago', status: { label: 'Expired', tone: 'neutral' }, cells: ['RFQ-401', 'Deccan Organics', 'Carrot', '1 t', '₹32/kg', 'Expired'] },
  ],
}

export const BUYER_RFQS: WorkspaceListConfig = {
  title: 'RFQs',
  subtitle: 'Ask matching sellers for quotes, then compare price, qty, date and rating.',
  ctaLabel: 'New RFQ',
  ctaPage: 'rfqs',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'quotes', label: 'Quotes received' },
    { value: 'closed', label: 'Closed' },
  ],
  columns: ['RFQ', 'Crop', 'Qty', 'Quotes', 'Delivery', 'Status'],
  empty: 'Create your first RFQ to source by requirement.',
  rows: [
    { id: 'RFQ-880', tab: 'quotes', title: 'Tomato 2 t', subtitle: '3 quotes · mandi ₹2,140', status: { label: 'Quotes in', tone: 'info' }, cells: ['RFQ-880', 'Tomato', '2 t', '3', '28 Sep', 'Quotes in'] },
    { id: 'RFQ-881', tab: 'open', title: 'Potato 5 t', subtitle: 'Visible to my suppliers', status: { label: 'Open', tone: 'warning' }, cells: ['RFQ-881', 'Potato', '5 t', '0', '02 Oct', 'Open'] },
    { id: 'RFQ-862', tab: 'closed', title: 'Onion 8 t', subtitle: 'Accepted Green Valley', status: { label: 'Closed', tone: 'success' }, cells: ['RFQ-862', 'Onion', '8 t', '4', '18 Sep', 'Closed'] },
  ],
}

export const BUYER_SUPPLIERS: WorkspaceListConfig = {
  title: 'Suppliers',
  subtitle: 'Favourites and past suppliers — rating, on-time %, last order.',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'fav', label: 'Favourites' },
    { value: 'past', label: 'Past' },
  ],
  columns: ['Supplier', 'District', 'Orders', 'On-time', 'Last order', 'Rating'],
  empty: 'Suppliers appear after your first order.',
  rows: [
    { id: 's1', tab: 'fav', title: 'Green Valley', subtitle: 'Verified seller', status: { label: '4.8 ★', tone: 'success' }, cells: ['Green Valley', 'Nashik', '18', '94%', '12 Sep', '4.8 ★'] },
    { id: 's2', tab: 'past', title: 'Fresh Farm', subtitle: 'Pune', status: { label: '4.6 ★', tone: 'success' }, cells: ['Fresh Farm', 'Pune', '7', '88%', '04 Sep', '4.6 ★'] },
    { id: 's3', tab: 'fav', title: 'Organic Roots', subtitle: 'Hyderabad', status: { label: '4.9 ★', tone: 'success' }, cells: ['Organic Roots', 'Hyderabad', '11', '97%', '20 Sep', '4.9 ★'] },
  ],
}

export const RENTAL_EQUIPMENT: WorkspaceListConfig = {
  title: 'Equipment',
  subtitle: 'Machines, rates, utilisation and document expiry.',
  ctaLabel: 'Add equipment',
  ctaPage: 'create',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'booked', label: 'Booked' },
    { value: 'maint', label: 'In maintenance' },
    { value: 'paused', label: 'Paused' },
  ],
  columns: ['Machine', 'Type', 'Rate / day', 'Utilisation', 'Next', 'Status'],
  empty: 'Add your first tractor or implement.',
  rows: [
    { id: 'Tractor #1', tab: 'available', title: 'Tractor #1', subtitle: 'Mahindra 575 · 2019', status: { label: 'Available', tone: 'success' }, cells: ['Tractor #1', 'Tractor', '₹2,500', '72%', 'Ready now', 'Available'] },
    { id: 'Tractor #2', tab: 'booked', title: 'Tractor #2', subtitle: 'Insurance expiring in 12 days', status: { label: 'Booked', tone: 'info' }, cells: ['Tractor #2', 'Tractor', '₹2,500', '81%', 'Return today', 'Booked'] },
    { id: 'Harvester #1', tab: 'booked', title: 'Harvester #1', subtitle: 'Operator assigned', status: { label: 'Booked', tone: 'info' }, cells: ['Harvester #1', 'Harvester', '₹4,500', '64%', '3 days', 'Booked'] },
    { id: 'Sprayer #2', tab: 'maint', title: 'Sprayer #2', subtitle: 'Service in progress', status: { label: 'Maintenance', tone: 'warning' }, cells: ['Sprayer #2', 'Sprayer', '₹800', '41%', 'Due tomorrow', 'Maintenance'] },
  ],
}

export const RENTAL_BOOKINGS: WorkspaceListConfig = {
  title: 'Bookings',
  subtitle: 'Requests expire if unpaid. Handover and return checklists live on the detail.',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'requests', label: 'Requests' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Active' },
    { value: 'done', label: 'Completed' },
    { value: 'cancel', label: 'Cancelled' },
  ],
  columns: ['Booking', 'Renter', 'Machine', 'Dates', 'Deposit', 'Status'],
  empty: 'No booking requests yet.',
  rows: [
    { id: 'BK-4418', tab: 'requests', title: 'Sprayer #1', subtitle: 'Expires in 2h', status: { label: 'Requested', tone: 'warning' }, cells: ['BK-4418', 'MNO Farm', 'Sprayer #1', '24–25 Sep', '₹4,000', 'Requested'] },
    { id: 'BK-4413', tab: 'upcoming', title: 'Harvester #1', subtitle: 'Handover 9:00 AM', status: { label: 'Confirmed', tone: 'info' }, cells: ['BK-4413', 'ABC Farm', 'Harvester #1', '24 Sep', '₹12,000', 'Confirmed'] },
    { id: 'BK-4412', tab: 'active', title: 'Tractor #2', subtitle: 'Return today 5 PM', status: { label: 'Active', tone: 'primary' }, cells: ['BK-4412', 'Farm Ltd', 'Tractor #2', '20–23 Sep', '₹8,000', 'Active'] },
    { id: 'BK-4390', tab: 'done', title: 'Rotavator #1', subtitle: 'No damage', status: { label: 'Completed', tone: 'success' }, cells: ['BK-4390', 'XYZ Inc', 'Rotavator #1', '12–14 Sep', '₹5,000', 'Completed'] },
  ],
}

export const RENTAL_OPERATORS: WorkspaceListConfig = {
  title: 'Operators',
  subtitle: 'Drivers and operators — licence, availability, assign to bookings.',
  ctaLabel: 'Add operator',
  ctaPage: 'operators',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
  ],
  columns: ['Operator', 'Licence', 'Machine types', 'Next booking', 'Status'],
  empty: 'Add operators if you rent with a driver.',
  rows: [
    { id: 'op1', tab: 'assigned', title: 'Ramesh Patil', subtitle: 'Assigned to BK-4412', status: { label: 'Assigned', tone: 'info' }, cells: ['Ramesh Patil', 'MH-12-2028', 'Tractor, rotavator', 'BK-4412', 'Assigned'] },
    { id: 'op2', tab: 'free', title: 'Suresh Kale', subtitle: 'Free this week', status: { label: 'Available', tone: 'success' }, cells: ['Suresh Kale', 'MH-31-2027', 'Harvester', '—', 'Available'] },
  ],
}

export const RENTAL_MAINT: WorkspaceListConfig = {
  title: 'Maintenance',
  subtitle: 'Logs, hour-meter schedules, reminders, and calendar auto-blocks.',
  ctaLabel: 'Log maintenance',
  ctaPage: 'maintenance',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'due', label: 'Due' },
    { value: 'done', label: 'Completed' },
  ],
  columns: ['Machine', 'Type', 'Cost', 'Vendor', 'Date', 'Status'],
  empty: 'No maintenance logs yet.',
  rows: [
    { id: 'm1', tab: 'due', title: 'Tractor #3 service', subtitle: '5 days overdue', status: { label: 'Overdue', tone: 'danger' }, cells: ['Tractor #3', 'Service', '₹4,800', 'Mahindra Care', '18 Sep', 'Overdue'] },
    { id: 'm2', tab: 'done', title: 'Sprayer #2 nozzles', subtitle: 'Calendar unblocked', status: { label: 'Done', tone: 'success' }, cells: ['Sprayer #2', 'Repair', '₹1,200', 'Local workshop', '21 Sep', 'Done'] },
  ],
}

export const SERVICE_LIST: WorkspaceListConfig = {
  title: 'Services',
  subtitle: 'Farm visit, video and phone offerings. Publishing is gated by verification.',
  ctaLabel: 'New service',
  ctaPage: 'create',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Drafts' },
    { value: 'paused', label: 'Paused' },
  ],
  columns: ['Service', 'Mode', 'Price', 'Area', 'Rating', 'Status'],
  empty: 'Add your first service offering.',
  rows: [
    { id: 'sv1', tab: 'active', title: 'Soil testing visit', subtitle: 'Farmer should keep last irrigation date ready', status: { label: 'Active', tone: 'success' }, cells: ['Soil testing visit', 'Farm visit', '₹1,200/visit', '25 km', '4.9', 'Active'] },
    { id: 'sv2', tab: 'active', title: 'Pest advisory', subtitle: 'Video or phone', status: { label: 'Active', tone: 'success' }, cells: ['Pest advisory', 'Video', '₹600/session', 'Maharashtra', '4.8', 'Active'] },
    { id: 'sv3', tab: 'draft', title: 'Irrigation audit', subtitle: 'Draft — add credentials', status: { label: 'Draft', tone: 'neutral' }, cells: ['Irrigation audit', 'Farm visit', '₹2,400', '40 km', '—', 'Draft'] },
  ],
}

export const SERVICE_APPTS: WorkspaceListConfig = {
  title: 'Appointments',
  subtitle: 'Accept requests, check visit-day weather, start visit, then write the report.',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'requests', label: 'Requests' },
    { value: 'today', label: 'Today' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'done', label: 'Completed' },
  ],
  columns: ['Appointment', 'Farmer', 'Crop', 'Slot', 'Weather', 'Status'],
  empty: 'No appointments yet.',
  rows: [
    { id: 'AP-201', tab: 'today', title: 'Soil visit · Wardha', subtitle: 'Start after 10:30', status: { label: 'Scheduled', tone: 'info' }, cells: ['AP-201', 'Meena Patil', 'Soybean', 'Today 10:30', 'Clear', 'Scheduled'] },
    { id: 'AP-202', tab: 'requests', title: 'Pest advisory', subtitle: 'Expires today', status: { label: 'Requested', tone: 'warning' }, cells: ['AP-202', 'Rajesh', 'Cotton', 'Thu 16:00', 'Rain 40%', 'Requested'] },
    { id: 'AP-188', tab: 'done', title: 'Leaf blight follow-up', subtitle: 'Report shared', status: { label: 'Completed', tone: 'success' }, cells: ['AP-188', 'Meena Patil', 'Soybean', '16 Sep', '—', 'Completed'] },
  ],
}

export const SERVICE_REPORTS: WorkspaceListConfig = {
  title: 'Field Reports',
  subtitle: 'Observations, photos, diagnosis, recommendations, and a follow-up date.',
  ctaLabel: 'Write report',
  ctaPage: 'reports',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'shared', label: 'Shared' },
    { value: 'follow', label: 'Follow-up due' },
  ],
  columns: ['Report', 'Farmer', 'Diagnosis', 'Follow-up', 'Status'],
  empty: 'Reports appear after you complete a visit.',
  rows: [
    { id: 'FR-88', tab: 'draft', title: 'Visit with Meena Patil', subtitle: 'Draft since yesterday', status: { label: 'Draft', tone: 'warning' }, cells: ['FR-88', 'Meena Patil', 'Pending', '—', 'Draft'] },
    { id: 'FR-81', tab: 'follow', title: 'Leaf blight case', subtitle: '7-day check-in', status: { label: 'Follow-up', tone: 'info' }, cells: ['FR-81', 'Meena Patil', 'Leaf blight', '24 Sep', 'Follow-up'] },
    { id: 'FR-70', tab: 'shared', title: 'Soil health card', subtitle: 'PDF shared in-app', status: { label: 'Shared', tone: 'success' }, cells: ['FR-70', 'Rajesh', 'Low nitrogen', '—', 'Shared'] },
  ],
}

export const SERVICE_PORTFOLIO: WorkspaceListConfig = {
  title: 'Portfolio & credentials',
  subtitle: 'Case studies and certifications. Admin-verified credentials become badges.',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'cases', label: 'Case studies' },
    { value: 'certs', label: 'Certifications' },
  ],
  columns: ['Item', 'Type', 'Outcome', 'Verified', 'Status'],
  empty: 'Add a before/after case study.',
  rows: [
    { id: 'p1', tab: 'cases', title: 'Soybean yield recovery', subtitle: 'Wardha · 4 acres', status: { label: 'Published', tone: 'success' }, cells: ['Soybean yield recovery', 'Case study', '+18% yield', 'Yes', 'Published'] },
    { id: 'p2', tab: 'certs', title: 'IARI soil health', subtitle: 'Verified by admin', status: { label: 'Verified', tone: 'success' }, cells: ['IARI soil health', 'Certificate', 'Badge on profile', 'Yes', 'Verified'] },
  ],
}

export const EDU_COURSES: WorkspaceListConfig = {
  title: 'Courses',
  subtitle: 'Publishing requires admin review. Include a low-bandwidth audio variant where you can.',
  ctaLabel: 'New course',
  ctaPage: 'create',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'review', label: 'In review' },
    { value: 'live', label: 'Published' },
    { value: 'changes', label: 'Needs changes' },
  ],
  columns: ['Course', 'Language', 'Learners', 'Completion', 'Status'],
  empty: 'Start a course draft.',
  rows: [
    { id: 'c1', tab: 'live', title: 'Organic Farming 101', subtitle: 'Marathi + English', status: { label: 'Published', tone: 'success' }, cells: ['Organic Farming 101', 'Marathi', '35', '78%', 'Published'] },
    { id: 'c2', tab: 'changes', title: 'Soil Health Mastery', subtitle: '2 review comments', status: { label: 'Needs changes', tone: 'warning' }, cells: ['Soil Health Mastery', 'Hindi', '18', '82%', 'Needs changes'] },
    { id: 'c3', tab: 'review', title: 'IPM Techniques', subtitle: 'Submitted 21 Sep', status: { label: 'In review', tone: 'info' }, cells: ['IPM Techniques', 'English', '24', '65%', 'In review'] },
  ],
}

export const EDU_LEARNERS: WorkspaceListConfig = {
  title: 'Learners',
  subtitle: 'Progress, last active, and inactive > 7 days.',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'idle', label: 'Inactive > 7d' },
  ],
  columns: ['Learner', 'Course', 'Progress', 'Last active', 'Status'],
  empty: 'Learners appear after the first enrolment.',
  rows: [
    { id: 'l1', tab: 'active', title: 'Anita Deshmukh', subtitle: 'Organic 101', status: { label: 'Active', tone: 'success' }, cells: ['Anita Deshmukh', 'Organic 101', '64%', 'Today', 'Active'] },
    { id: 'l2', tab: 'idle', title: 'Vikram Joshi', subtitle: 'IPM Techniques', status: { label: 'Inactive', tone: 'warning' }, cells: ['Vikram Joshi', 'IPM Techniques', '22%', '11 days ago', 'Inactive'] },
  ],
}

export const EDU_SESSIONS: WorkspaceListConfig = {
  title: 'Live Sessions',
  subtitle: 'Schedule, join link, attendees and recordings. Phase 2 extras stay light for MVP.',
  ctaLabel: 'Schedule live session',
  ctaPage: 'sessions',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
  ],
  columns: ['Session', 'Course', 'When', 'Attendees', 'Status'],
  empty: 'No live sessions scheduled.',
  rows: [
    { id: 'ls1', tab: 'upcoming', title: 'Q&A · irrigation', subtitle: 'Recording will be saved', status: { label: 'Scheduled', tone: 'info' }, cells: ['Q&A · irrigation', 'Organic 101', '26 Sep 18:00', '18 RSVP', 'Scheduled'] },
    { id: 'ls2', tab: 'past', title: 'Field demo recap', subtitle: 'Recording uploaded', status: { label: 'Recorded', tone: 'success' }, cells: ['Field demo recap', 'IPM Techniques', '18 Sep', '42', 'Recorded'] },
  ],
}

export const EDU_ASSESS: WorkspaceListConfig = {
  title: 'Assessments',
  subtitle: 'Question bank and grading queue — oldest first.',
  ctaLabel: 'New quiz',
  ctaPage: 'assessments',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'queue', label: 'To grade' },
    { value: 'done', label: 'Graded' },
  ],
  columns: ['Item', 'Course', 'Pending', 'Oldest', 'Status'],
  empty: 'No quizzes yet.',
  rows: [
    { id: 'q1', tab: 'queue', title: 'Organic 101 · Quiz 3', subtitle: '6 submissions', status: { label: 'To grade', tone: 'warning' }, cells: ['Quiz 3', 'Organic 101', '6', '20 Sep', 'To grade'] },
    { id: 'q2', tab: 'done', title: 'IPM assignment 1', subtitle: 'Results by question ready', status: { label: 'Graded', tone: 'success' }, cells: ['Assignment 1', 'IPM Techniques', '0', '12 Sep', 'Graded'] },
  ],
}

export const EDU_QNA: WorkspaceListConfig = {
  title: 'Q&A',
  subtitle: 'Per-course questions, unanswered first. Pin answers. No full forum in MVP.',
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Unanswered' },
    { value: 'pinned', label: 'Pinned' },
  ],
  columns: ['Question', 'Course', 'Asked', 'Status'],
  empty: 'No learner questions yet.',
  rows: [
    { id: 'qa1', tab: 'open', title: 'Can I apply neem after rain?', subtitle: 'IPM · module 2', status: { label: 'Unanswered', tone: 'warning' }, cells: ['Can I apply neem after rain?', 'IPM Techniques', '2h ago', 'Unanswered'] },
    { id: 'qa2', tab: 'pinned', title: 'Drip vs flood for tomato', subtitle: 'Pinned answer', status: { label: 'Pinned', tone: 'success' }, cells: ['Drip vs flood for tomato', 'Organic 101', 'Mon', 'Pinned'] },
  ],
}
