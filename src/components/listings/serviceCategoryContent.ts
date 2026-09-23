export type ServiceCategoryId =
  | 'soil-testing'
  | 'farm-consultancy'
  | 'mechanic'
  | 'irrigation'
  | 'equipment-repair'
  | 'drone-spraying'
  | 'crop-inspection'

export type PricingUnit = 'session' | 'visit' | 'sample' | 'acre' | 'hour' | 'day'

export interface MarketPricing {
  budget: string
  average: string
  premium: string
  note: string
  unit: PricingUnit
}

export interface AdaptiveField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'multi-select'
  placeholder?: string
  required?: boolean
  helperText?: string
  options?: { value: string; label: string }[]
}

export interface ServiceCategory {
  id: ServiceCategoryId
  title: string
  tagline: string
  description: string
  detailTip: string
  photoGuidance: string
  color: string
  softBg: string
  examples: string[]
  includes: string[]
  pricing: MarketPricing
  nameLabel: string
  namePlaceholder: string
  descriptionPlaceholder: string
  adaptiveFields: AdaptiveField[]
  durationOptions: { value: string; label: string }[]
}

const LANGUAGE_OPTIONS = [
  { value: 'telugu', label: 'Telugu' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'english', label: 'English' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'malayalam', label: 'Malayalam' },
]

const CROP_OPTIONS = [
  { value: 'paddy', label: 'Paddy / rice' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'chilli', label: 'Chilli' },
  { value: 'groundnut', label: 'Groundnut' },
  { value: 'maize', label: 'Maize' },
  { value: 'sugarcane', label: 'Sugarcane' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'pulses', label: 'Pulses' },
  { value: 'oilseeds', label: 'Oilseeds' },
  { value: 'fruits', label: 'Fruits / orchard' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'flowers', label: 'Flowers' },
  { value: 'other', label: 'Other crops' },
]

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'soil-testing',
    title: 'Soil Testing',
    tagline: 'Lab analysis for nutrients, pH & soil health',
    description:
      'Help farmers know what their soil needs before sowing. Clear reports and fertilizer advice get booked again and again.',
    detailTip: 'Farmers book faster when turnaround time and report format are crystal clear.',
    photoGuidance: 'Lab setup, sample collection in field, or a sample report (blur personal data)',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['NPK & micronutrients testing', 'Soil pH & salinity (EC)', 'Organic carbon measurement'],
    includes: [
      'On-site sample collection',
      'Lab analysis report',
      'Nutrient deficiency summary',
      'Fertilizer recommendations',
      'Crop-specific advice',
      'Follow-up consultation call',
    ],
    pricing: {
      budget: '₹800–₹1,200',
      average: '₹1,500–₹2,500',
      premium: '₹3,000–₹4,500',
      note: 'Per sample · Full packages cost more',
      unit: 'sample',
    },
    nameLabel: 'Service name',
    namePlaceholder: 'e.g., Complete soil health pack — NPK + micro',
    descriptionPlaceholder: 'e.g., Clear NPK + micro report with fertilizer plan in 3 days…',
    durationOptions: [
      { value: 'same-day', label: 'Same-day collection' },
      { value: '1-2-days', label: '1–2 days (report)' },
      { value: '3-5-days', label: '3–5 days (full lab)' },
      { value: '1-week', label: 'Within 1 week' },
    ],
    adaptiveFields: [
      {
        id: 'testType',
        label: 'Test package',
        type: 'select',
        required: true,
        helperText: 'What the farmer receives',
        options: [
          { value: 'basic-npk', label: 'Basic NPK' },
          { value: 'npk-ph', label: 'NPK + pH + EC' },
          { value: 'full-micro', label: 'Full + micronutrients' },
          { value: 'organic', label: 'Organic carbon / organic matter' },
          { value: 'salinity', label: 'Salinity / sodicity check' },
          { value: 'water', label: 'Water quality (pH, TDS, EC)' },
          { value: 'leaf', label: 'Leaf / tissue testing' },
          { value: 'custom', label: 'Custom package' },
        ],
      },
      {
        id: 'labType',
        label: 'Testing location',
        type: 'select',
        required: true,
        options: [
          { value: 'own-lab', label: 'My own lab' },
          { value: 'partner-lab', label: 'Partner / govt lab' },
          { value: 'kit-field', label: 'Field kit (on-site)' },
          { value: 'mixed', label: 'Field kit + lab confirm' },
        ],
      },
      {
        id: 'sampleCollection',
        label: 'Sample collection',
        type: 'select',
        required: true,
        options: [
          { value: 'on-site', label: 'I collect on-site' },
          { value: 'farmer-brings', label: 'Farmer brings sample' },
          { value: 'courier', label: 'Courier / pickup point' },
          { value: 'both', label: 'Flexible — any method' },
        ],
      },
      {
        id: 'samplesPerVisit',
        label: 'Samples per visit',
        type: 'select',
        options: [
          { value: '1', label: '1 sample' },
          { value: '2-3', label: '2–3 samples' },
          { value: '4-6', label: '4–6 samples' },
          { value: 'bulk', label: 'Bulk / plot grid' },
        ],
      },
      {
        id: 'crops',
        label: 'Crops you support',
        type: 'multi-select',
        helperText: 'Select all that apply',
        options: CROP_OPTIONS,
      },
      {
        id: 'reportFormat',
        label: 'Report format',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: [
          { value: 'printed', label: 'Printed report' },
          { value: 'whatsapp', label: 'WhatsApp / digital PDF' },
          { value: 'verbal', label: 'Verbal explanation on site' },
          { value: 'fertilizer-plan', label: 'Written fertilizer plan' },
          { value: 'local-lang', label: 'Report in local language' },
        ],
      },
      {
        id: 'turnaround',
        label: 'Typical turnaround',
        type: 'select',
        required: true,
        options: [
          { value: '24h', label: 'Within 24 hours' },
          { value: '2-3d', label: '2–3 days' },
          { value: '5-7d', label: '5–7 days' },
          { value: '10d', label: 'Up to 10 days' },
        ],
      },
      {
        id: 'languages',
        label: 'Languages you explain in',
        type: 'multi-select',
        options: LANGUAGE_OPTIONS,
      },
    ],
  },
  {
    id: 'farm-consultancy',
    title: 'Farm Consultancy',
    tagline: 'Crop planning, advisory & farm management advice',
    description:
      'Guide farmers on crop choice, inputs, and operations. One clear session can save a season of wrong decisions.',
    detailTip: 'Name your crop focus and delivery mode — farmers filter by these first.',
    photoGuidance: 'You on a farm visit, advisory notes, or past success plot photos',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Crop planning', 'Input advisory', 'Yield improvement'],
    includes: [
      'Farm visit or video call',
      'Crop / season plan',
      'Input recommendations',
      'Cost estimate guidance',
      'Written summary notes',
      'One follow-up within 7 days',
    ],
    pricing: {
      budget: '₹1,000–₹2,000',
      average: '₹2,500–₹4,000',
      premium: '₹5,000–₹8,000',
      note: 'Per session · Multi-visit packages higher',
      unit: 'session',
    },
    nameLabel: 'Service name',
    namePlaceholder: 'e.g., Season crop planning consultation',
    descriptionPlaceholder: 'e.g., Season plan for chilli/cotton with input cost guidance…',
    durationOptions: [
      { value: '30-mins', label: '30 minutes' },
      { value: '1-hour', label: '1 hour' },
      { value: '2-hours', label: '2 hours' },
      { value: 'half-day', label: 'Half-day farm visit' },
      { value: 'full-day', label: 'Full-day visit' },
    ],
    adaptiveFields: [
      {
        id: 'focusArea',
        label: 'Advisory focus',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: [
          { value: 'crop-selection', label: 'Crop selection' },
          { value: 'fertilizer', label: 'Fertilizer planning' },
          { value: 'pest', label: 'Pest & disease management' },
          { value: 'irrigation', label: 'Irrigation advice' },
          { value: 'organic', label: 'Organic / natural farming' },
          { value: 'business', label: 'Farm business / marketing' },
          { value: 'soil-health', label: 'Soil health' },
          { value: 'seed', label: 'Seed variety choice' },
          { value: 'post-harvest', label: 'Post-harvest / storage' },
        ],
      },
      {
        id: 'mode',
        label: 'How you deliver',
        type: 'select',
        required: true,
        options: [
          { value: 'on-farm', label: 'On-farm visit' },
          { value: 'phone-video', label: 'Phone / video call' },
          { value: 'group', label: 'Group / FPO session' },
          { value: 'both', label: 'Farm visit or call' },
        ],
      },
      {
        id: 'experience',
        label: 'Years of experience',
        type: 'select',
        required: true,
        options: [
          { value: '1-2', label: '1–2 years' },
          { value: '3-5', label: '3–5 years' },
          { value: '6-10', label: '6–10 years' },
          { value: '10plus', label: '10+ years' },
        ],
      },
      {
        id: 'qualification',
        label: 'Background / qualification',
        type: 'select',
        options: [
          { value: 'agri-degree', label: 'Agriculture degree / diploma' },
          { value: 'extension', label: 'Extension / KVK experience' },
          { value: 'progressive', label: 'Progressive farmer' },
          { value: 'agri-input', label: 'Agri-input professional' },
          { value: 'self-taught', label: 'Self-taught / field experience' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'crops',
        label: 'Crops you advise on',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: CROP_OPTIONS,
      },
      {
        id: 'season',
        label: 'Best seasons for your advice',
        type: 'multi-select',
        options: [
          { value: 'kharif', label: 'Kharif' },
          { value: 'rabi', label: 'Rabi' },
          { value: 'zaid', label: 'Zaid / summer' },
          { value: 'year-round', label: 'Year-round' },
        ],
      },
      {
        id: 'languages',
        label: 'Languages',
        type: 'multi-select',
        required: true,
        options: LANGUAGE_OPTIONS,
      },
    ],
  },
  {
    id: 'mechanic',
    title: 'Mechanic Services',
    tagline: 'On-site diagnosis & repair for farm machines',
    description:
      'Fix pumps, engines, and implements when farmers need them most. Fast response during peak season wins loyal clients.',
    detailTip: 'List machines + emergency availability — that’s what farmers search for when something breaks.',
    photoGuidance: 'Workshop, tools, or you repairing a pump/tractor (with permission)',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Pump repair', 'Engine diagnosis', 'Implement welding'],
    includes: [
      'On-site diagnosis',
      'Labour for repair',
      'Parts estimate before work',
      'Test run after repair',
      'Basic maintenance tips',
      '7-day workmanship warranty',
    ],
    pricing: {
      budget: '₹500–₹1,000',
      average: '₹1,500–₹3,000',
      premium: '₹3,500–₹6,000',
      note: 'Per visit · Parts usually extra',
      unit: 'visit',
    },
    nameLabel: 'Service name',
    namePlaceholder: 'e.g., On-site pump & engine mechanic',
    descriptionPlaceholder: 'e.g., Same-day pump repair with parts estimate before work…',
    durationOptions: [
      { value: '1-hour', label: '1 hour' },
      { value: '2-hours', label: '2 hours' },
      { value: 'half-day', label: 'Half-day' },
      { value: 'full-day', label: 'Full-day' },
      { value: 'emergency', label: 'Emergency / ASAP' },
    ],
    adaptiveFields: [
      {
        id: 'machines',
        label: 'Machines you service',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: [
          { value: 'pumps', label: 'Water pumps' },
          { value: 'tractors', label: 'Tractors' },
          { value: 'tillers', label: 'Power tillers' },
          { value: 'sprayers', label: 'Sprayers' },
          { value: 'generators', label: 'Generators' },
          { value: 'implements', label: 'Implements / attachments' },
          { value: 'harvesters', label: 'Harvesters' },
          { value: '2wheelers', label: 'Farm 2-wheelers' },
          { value: 'motors', label: 'Electric motors' },
        ],
      },
      {
        id: 'skills',
        label: 'Skills',
        type: 'multi-select',
        required: true,
        options: [
          { value: 'diesel', label: 'Diesel engines' },
          { value: 'petrol', label: 'Petrol engines' },
          { value: 'electrical', label: 'Electrical / wiring' },
          { value: 'welding', label: 'Welding' },
          { value: 'hydraulics', label: 'Hydraulics' },
          { value: 'fabrication', label: 'Fabrication' },
          { value: 'bearing', label: 'Bearing / seal work' },
        ],
      },
      {
        id: 'workMode',
        label: 'Where you work',
        type: 'select',
        required: true,
        options: [
          { value: 'on-site', label: 'On farmer site' },
          { value: 'workshop', label: 'At my workshop' },
          { value: 'both', label: 'On-site or workshop' },
        ],
      },
      {
        id: 'parts',
        label: 'Spare parts',
        type: 'select',
        required: true,
        options: [
          { value: 'bring', label: 'I can arrange parts' },
          { value: 'farmer', label: 'Farmer provides parts' },
          { value: 'both', label: 'Either — discuss on call' },
        ],
      },
      {
        id: 'tools',
        label: 'Tools you bring',
        type: 'select',
        options: [
          { value: 'full', label: 'Full tool kit' },
          { value: 'basic', label: 'Basic tools' },
          { value: 'welding', label: 'Tools + welding set' },
          { value: 'farmer', label: 'Need farmer tools too' },
        ],
      },
      {
        id: 'emergency',
        label: 'Emergency support',
        type: 'select',
        required: true,
        options: [
          { value: 'yes', label: 'Yes — same-day when possible' },
          { value: 'peak', label: 'Peak season only' },
          { value: 'no', label: 'Scheduled visits only' },
        ],
      },
      {
        id: 'experience',
        label: 'Years of experience',
        type: 'select',
        options: [
          { value: '1-2', label: '1–2 years' },
          { value: '3-5', label: '3–5 years' },
          { value: '6-10', label: '6–10 years' },
          { value: '10plus', label: '10+ years' },
        ],
      },
      {
        id: 'languages',
        label: 'Languages',
        type: 'multi-select',
        options: LANGUAGE_OPTIONS,
      },
    ],
  },
  {
    id: 'irrigation',
    title: 'Irrigation Services',
    tagline: 'Drip, sprinkler & pump installation support',
    description:
      'Design and set up irrigation that saves water and labour. Farmers pay for systems that work the first season.',
    detailTip: 'Say clearly if materials are included — surprise costs kill trust.',
    photoGuidance: 'Completed drip/sprinkler installs, layout sketches, or pump setups',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Drip layout', 'Sprinkler setup', 'Pump installation'],
    includes: [
      'Site survey / measurement',
      'Layout or design sketch',
      'Installation labour',
      'System test & demo',
      'Basic usage guidance',
      'One free service visit (30 days)',
    ],
    pricing: {
      budget: '₹2,000–₹5,000',
      average: '₹6,000–₹12,000',
      premium: '₹15,000–₹30,000',
      note: 'Per plot / unit · Materials often separate',
      unit: 'visit',
    },
    nameLabel: 'Service name',
    namePlaceholder: 'e.g., Drip irrigation design & install',
    descriptionPlaceholder: 'e.g., Drip design + install for 1–5 acres, materials quoted separately…',
    durationOptions: [
      { value: 'half-day', label: 'Half-day' },
      { value: '1-day', label: '1 day' },
      { value: '2-3-days', label: '2–3 days' },
      { value: 'project', label: 'Full project (quote)' },
    ],
    adaptiveFields: [
      {
        id: 'systemType',
        label: 'System type',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: [
          { value: 'drip', label: 'Drip irrigation' },
          { value: 'sprinkler', label: 'Sprinkler' },
          { value: 'rain-gun', label: 'Rain gun' },
          { value: 'micro-sprinkler', label: 'Micro-sprinkler' },
          { value: 'pump-install', label: 'Pump installation' },
          { value: 'bore-pipe', label: 'Bore / pipeline work' },
          { value: 'filter', label: 'Filter / fertigation setup' },
          { value: 'maintenance', label: 'Maintenance / flushing' },
        ],
      },
      {
        id: 'workScope',
        label: 'What you offer',
        type: 'select',
        required: true,
        options: [
          { value: 'design-only', label: 'Design / layout only' },
          { value: 'install-only', label: 'Installation only' },
          { value: 'design-install', label: 'Design + installation' },
          { value: 'service', label: 'Service / repair only' },
          { value: 'full', label: 'End-to-end project' },
        ],
      },
      {
        id: 'materials',
        label: 'Materials',
        type: 'select',
        required: true,
        options: [
          { value: 'included', label: 'I can supply materials' },
          { value: 'farmer', label: 'Farmer buys materials' },
          { value: 'quote', label: 'Quoted case by case' },
        ],
      },
      {
        id: 'plotSize',
        label: 'Typical plot size',
        type: 'select',
        required: true,
        options: [
          { value: 'under-1', label: 'Under 1 acre' },
          { value: '1-5', label: '1–5 acres' },
          { value: '5-20', label: '5–20 acres' },
          { value: '20plus', label: '20+ acres' },
        ],
      },
      {
        id: 'crops',
        label: 'Crops / use cases',
        type: 'multi-select',
        options: CROP_OPTIONS,
      },
      {
        id: 'subsidy',
        label: 'Subsidy / scheme support',
        type: 'select',
        options: [
          { value: 'yes', label: 'Yes — I help with paperwork' },
          { value: 'aware', label: 'I know schemes, farmer applies' },
          { value: 'no', label: 'Installation only' },
        ],
      },
      {
        id: 'teamSize',
        label: 'Team size for install',
        type: 'select',
        options: [
          { value: 'solo', label: 'Just me' },
          { value: '2-3', label: '2–3 people' },
          { value: '4plus', label: '4+ person crew' },
        ],
      },
      {
        id: 'languages',
        label: 'Languages',
        type: 'multi-select',
        options: LANGUAGE_OPTIONS,
      },
    ],
  },
  {
    id: 'equipment-repair',
    title: 'Equipment Repair',
    tagline: 'Scheduled maintenance & workshop repairs',
    description:
      'Keep sprayers, tillers, and implements ready for season. Preventive service listings get steady bookings.',
    detailTip: 'Say if you work on-site or workshop — farmers choose based on that.',
    photoGuidance: 'Workshop bay, before/after repair, or service checklist photos',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Annual service', 'Sprayer overhaul', 'Implement repair'],
    includes: [
      'Inspection checklist',
      'Labour for service/repair',
      'Parts estimate approval',
      'Post-service test',
      'Service record note',
      'Pickup / drop (if workshop)',
    ],
    pricing: {
      budget: '₹800–₹1,500',
      average: '₹2,000–₹4,500',
      premium: '₹5,000–₹10,000',
      note: 'Per visit · Major overhauls higher',
      unit: 'visit',
    },
    nameLabel: 'Service name',
    namePlaceholder: 'e.g., Tractor implement annual service',
    descriptionPlaceholder: 'e.g., Annual sprayer service with checklist + 30-day warranty…',
    durationOptions: [
      { value: '2-hours', label: '2 hours' },
      { value: 'half-day', label: 'Half-day' },
      { value: '1-day', label: '1 day' },
      { value: 'multi-day', label: 'Multi-day workshop job' },
    ],
    adaptiveFields: [
      {
        id: 'equipment',
        label: 'Equipment covered',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: [
          { value: 'sprayer', label: 'Sprayers' },
          { value: 'tiller', label: 'Tillers' },
          { value: 'tractor', label: 'Tractors' },
          { value: 'harvester', label: 'Harvesters' },
          { value: 'implements', label: 'Implements' },
          { value: 'pump', label: 'Pumps' },
          { value: 'generator', label: 'Generators' },
          { value: 'thresher', label: 'Threshers' },
        ],
      },
      {
        id: 'locationType',
        label: 'Where you work',
        type: 'select',
        required: true,
        options: [
          { value: 'on-site', label: 'On farmer site' },
          { value: 'workshop', label: 'At my workshop' },
          { value: 'both', label: 'On-site or workshop' },
        ],
      },
      {
        id: 'serviceType',
        label: 'Service type',
        type: 'select',
        required: true,
        options: [
          { value: 'preventive', label: 'Preventive / annual service' },
          { value: 'breakdown', label: 'Breakdown repair' },
          { value: 'overhaul', label: 'Major overhaul' },
          { value: 'both', label: 'Preventive + breakdown' },
        ],
      },
      {
        id: 'parts',
        label: 'Spare parts',
        type: 'select',
        options: [
          { value: 'stock', label: 'Common parts in stock' },
          { value: 'order', label: 'I can order parts' },
          { value: 'farmer', label: 'Farmer provides parts' },
          { value: 'either', label: 'Flexible' },
        ],
      },
      {
        id: 'brandFocus',
        label: 'Brand familiarity',
        type: 'multi-select',
        options: [
          { value: 'mahindra', label: 'Mahindra' },
          { value: 'john-deere', label: 'John Deere' },
          { value: 'swaraj', label: 'Swaraj' },
          { value: 'sonalika', label: 'Sonalika' },
          { value: 'honda', label: 'Honda / portable engines' },
          { value: 'generic', label: 'Most common brands' },
          { value: 'any', label: 'Any brand' },
        ],
      },
      {
        id: 'warranty',
        label: 'Workmanship warranty',
        type: 'select',
        required: true,
        options: [
          { value: 'none', label: 'No warranty' },
          { value: '7d', label: '7 days' },
          { value: '30d', label: '30 days' },
          { value: '90d', label: '90 days' },
        ],
      },
      {
        id: 'experience',
        label: 'Years of experience',
        type: 'select',
        options: [
          { value: '1-2', label: '1–2 years' },
          { value: '3-5', label: '3–5 years' },
          { value: '6-10', label: '6–10 years' },
          { value: '10plus', label: '10+ years' },
        ],
      },
    ],
  },
  {
    id: 'drone-spraying',
    title: 'Drone Spraying',
    tagline: 'Aerial spraying, scouting & precision crop mapping',
    description:
      'Cover large acres fast with precise spraying or NDVI surveys. Peak pest season drives high demand.',
    detailTip: 'State minimum acres and who supplies chemicals — avoids booking disputes.',
    photoGuidance: 'Drone in field, spray flight, or sample NDVI / mapping output',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Pesticide application (aerial)', 'Fertilizer spraying', 'Crop health mapping (NDVI)'],
    includes: [
      'Pilot & drone operation',
      'Spray / survey for booked acres',
      'Chemical mixing guidance (if spray)',
      'Flight summary / map delivery',
      'Weather safety checks',
      'Re-spray if weather aborts (same day)',
    ],
    pricing: {
      budget: '₹300–₹500/acre',
      average: '₹600–₹900/acre',
      premium: '₹1,000–₹1,500/acre',
      note: 'Chemicals usually farmer-supplied · Min acreage applies',
      unit: 'acre',
    },
    nameLabel: 'Service name',
    namePlaceholder: 'e.g., Drone pesticide spray — 5 acre minimum',
    descriptionPlaceholder: 'e.g., Licensed drone spray, 5-acre min, chemicals by farmer…',
    durationOptions: [
      { value: 'half-day', label: 'Half-day slot' },
      { value: 'full-day', label: 'Full-day slot' },
      { value: 'per-acre', label: 'Per acre (flexible)' },
    ],
    adaptiveFields: [
      {
        id: 'droneService',
        label: 'Drone service type',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: [
          { value: 'spray', label: 'Pesticide / fertilizer spraying' },
          { value: 'imaging', label: 'Crop imaging / NDVI' },
          { value: 'scouting', label: 'Field scouting' },
          { value: 'seeding', label: 'Aerial seeding' },
          { value: 'mapping', label: 'Plot mapping / survey' },
        ],
      },
      {
        id: 'minAcres',
        label: 'Minimum acres',
        type: 'select',
        required: true,
        options: [
          { value: '1', label: '1 acre' },
          { value: '2', label: '2 acres' },
          { value: '5', label: '5 acres' },
          { value: '10', label: '10 acres' },
          { value: '20', label: '20 acres' },
        ],
      },
      {
        id: 'maxAcresDay',
        label: 'Max acres per day',
        type: 'select',
        options: [
          { value: '10', label: 'Up to 10 acres' },
          { value: '25', label: 'Up to 25 acres' },
          { value: '50', label: 'Up to 50 acres' },
          { value: '100', label: '100+ acres' },
        ],
      },
      {
        id: 'crops',
        label: 'Crops you spray / survey',
        type: 'multi-select',
        options: CROP_OPTIONS,
      },
      {
        id: 'chemicals',
        label: 'Chemicals / inputs',
        type: 'select',
        required: true,
        options: [
          { value: 'farmer', label: 'Farmer supplies chemicals' },
          { value: 'provider', label: 'I can arrange chemicals' },
          { value: 'either', label: 'Either — discuss before booking' },
        ],
      },
      {
        id: 'tankCapacity',
        label: 'Spray tank capacity',
        type: 'select',
        options: [
          { value: '5-10', label: '5–10 L' },
          { value: '10-16', label: '10–16 L' },
          { value: '16-30', label: '16–30 L' },
          { value: '30plus', label: '30 L+' },
          { value: 'na', label: 'N/A (imaging only)' },
        ],
      },
      {
        id: 'license',
        label: 'Pilot / drone compliance',
        type: 'select',
        required: true,
        options: [
          { value: 'licensed', label: 'Licensed pilot' },
          { value: 'registered', label: 'Drone registered' },
          { value: 'both', label: 'Licensed + registered' },
          { value: 'pending', label: 'In process' },
        ],
      },
      {
        id: 'weather',
        label: 'Weather policy',
        type: 'select',
        options: [
          { value: 'reschedule', label: 'Free reschedule if weather bad' },
          { value: 'partial', label: 'Partial spray + reschedule' },
          { value: 'discuss', label: 'Discuss case by case' },
        ],
      },
    ],
  },
  {
    id: 'crop-inspection',
    title: 'Crop Inspection',
    tagline: 'Field checks for pests, disease & crop stage',
    description:
      'Walk the field, spot problems early, and recommend action. Buyers and progressive farmers book this before critical stages.',
    detailTip: 'Be specific about crops and what the farmer gets after the visit.',
    photoGuidance: 'Field walk photos, pest samples (safe), or sample inspection summary',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Pest scouting', 'Disease check', 'Pre-harvest inspection'],
    includes: [
      'Field walk-through',
      'Pest / disease identification',
      'Photo evidence',
      'Action recommendations',
      'Short written summary',
      'One follow-up call',
    ],
    pricing: {
      budget: '₹500–₹1,000',
      average: '₹1,500–₹3,000',
      premium: '₹3,500–₹6,000',
      note: 'Per visit · Larger farms may need half-day',
      unit: 'visit',
    },
    nameLabel: 'Service name',
    namePlaceholder: 'e.g., Mid-season pest & disease inspection',
    descriptionPlaceholder: 'e.g., Cotton/chilli pest scout with photos + action list…',
    durationOptions: [
      { value: '1-hour', label: '1 hour' },
      { value: '2-hours', label: '2 hours' },
      { value: 'half-day', label: 'Half-day' },
      { value: 'full-day', label: 'Full-day (large farms)' },
    ],
    adaptiveFields: [
      {
        id: 'inspectionFocus',
        label: 'Inspection focus',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: [
          { value: 'pest', label: 'Pest scouting' },
          { value: 'disease', label: 'Disease check' },
          { value: 'nutrient', label: 'Nutrient deficiency signs' },
          { value: 'growth', label: 'Growth stage assessment' },
          { value: 'pre-harvest', label: 'Pre-harvest readiness' },
          { value: 'insurance', label: 'Insurance / claim support' },
          { value: 'buyer', label: 'Buyer / quality check' },
        ],
      },
      {
        id: 'crops',
        label: 'Crops you inspect',
        type: 'multi-select',
        required: true,
        helperText: 'Select all that apply',
        options: CROP_OPTIONS,
      },
      {
        id: 'plotSize',
        label: 'Typical plot size',
        type: 'select',
        options: [
          { value: 'under-2', label: 'Under 2 acres' },
          { value: '2-10', label: '2–10 acres' },
          { value: '10-25', label: '10–25 acres' },
          { value: '25plus', label: '25+ acres' },
        ],
      },
      {
        id: 'method',
        label: 'Inspection method',
        type: 'select',
        options: [
          { value: 'walk', label: 'Field walk only' },
          { value: 'walk-sample', label: 'Walk + plant samples' },
          { value: 'drone-assist', label: 'Walk + drone assist' },
          { value: 'lab-refer', label: 'Can refer to lab if needed' },
        ],
      },
      {
        id: 'report',
        label: 'What farmer receives',
        type: 'select',
        required: true,
        options: [
          { value: 'verbal', label: 'Verbal advice on site' },
          { value: 'photos', label: 'Photos + WhatsApp notes' },
          { value: 'written', label: 'Written inspection report' },
          { value: 'full', label: 'Photos + written report + plan' },
        ],
      },
      {
        id: 'followUp',
        label: 'Follow-up included?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes', label: 'Yes — one follow-up call' },
          { value: 'week', label: 'Yes — within 7 days' },
          { value: 'paid', label: 'Follow-up at extra charge' },
          { value: 'no', label: 'Single visit only' },
        ],
      },
      {
        id: 'experience',
        label: 'Years of experience',
        type: 'select',
        options: [
          { value: '1-2', label: '1–2 years' },
          { value: '3-5', label: '3–5 years' },
          { value: '6-10', label: '6–10 years' },
          { value: '10plus', label: '10+ years' },
        ],
      },
      {
        id: 'languages',
        label: 'Languages',
        type: 'multi-select',
        options: LANGUAGE_OPTIONS,
      },
    ],
  },
]

export function getServiceCategoryById(id: ServiceCategoryId | ''): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((c) => c.id === id)
}

export const SERVICE_STEP_LABELS = ['Category', 'Details', 'Pricing', 'Review'] as const
