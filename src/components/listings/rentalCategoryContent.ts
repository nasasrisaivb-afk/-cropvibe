export type RentalCategoryId =
  | 'farm-machinery'
  | 'vehicles'
  | 'tools'
  | 'labour'
  | 'driver-services'
  | 'agricultural-land'
  | 'storage'

export type PricingUnit = 'day' | 'hour' | 'season' | 'month' | 'project'

export interface MarketPricing {
  budget: string
  average: string
  premium: string
  note: string
  unit: PricingUnit
}

export interface RentalCategory {
  id: RentalCategoryId
  title: string
  tagline: string
  description: string
  color: string
  softBg: string
  examples: string[]
  minPhotos: number
  photoGuidance: string
  hasConditionChecklist: boolean
  conditionItems: string[]
  pricing: MarketPricing
  nameLabel: string
  namePlaceholder: string
  descriptionPlaceholder?: string
  profileSample?: {
    name: string
    description: string
    fields: Record<string, string>
  }
  adaptiveFields: AdaptiveField[]
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

export const RENTAL_CATEGORIES: RentalCategory[] = [
  {
    id: 'farm-machinery',
    title: 'Farm Machinery',
    tagline: 'Large equipment for cultivation, harvesting & processing',
    description:
      'Rent out heavy farming machinery during peak seasons. High demand during sowing, monsoon, and harvest. Earn from machinery that sits idle off-season.',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Tractors (20–60+ HP)', 'Combine Harvesters', 'Power Tillers', 'Rotavators & Seeders'],
    minPhotos: 3,
    photoGuidance: 'Include: full view, engine/components, and in operation if possible',
    hasConditionChecklist: true,
    conditionItems: [
      'Engine runs smoothly',
      'All hydraulics working',
      'No major dents/welding issues',
      'Lights & safety features OK',
      'Papers complete (RC, insurance)',
    ],
    pricing: {
      budget: '₹400–₹700',
      average: '₹800–₹1,200',
      premium: '₹1,300–₹1,800',
      note: 'Varies by power, age, location',
      unit: 'day',
    },
    nameLabel: 'Equipment name / model',
    namePlaceholder: 'e.g., John Deere 5050D Tractor',
    adaptiveFields: [
      {
        id: 'powerHP',
        label: 'Power (HP)',
        type: 'number',
        placeholder: 'e.g., 50',
        required: true,
        helperText: 'Engine horsepower',
      },
      {
        id: 'engineType',
        label: 'Engine type',
        type: 'select',
        required: true,
        options: [
          { value: 'diesel', label: 'Diesel' },
          { value: 'petrol', label: 'Petrol' },
          { value: 'electric', label: 'Electric' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'fuelDetails',
        label: 'Fuel consumption',
        type: 'text',
        placeholder: 'e.g., 3–4 L/hour',
        helperText: 'Helps renters estimate operating cost',
      },
      {
        id: 'delivery',
        label: 'Delivery available?',
        type: 'select',
        options: [
          { value: 'yes-free', label: 'Yes — free within service area' },
          { value: 'yes-paid', label: 'Yes — paid delivery' },
          { value: 'no', label: 'Pickup only' },
        ],
      },
      {
        id: 'operator',
        label: 'Operator support',
        type: 'select',
        options: [
          { value: 'included', label: 'Operator included' },
          { value: 'training', label: 'Training available' },
          { value: 'none', label: 'Machine only' },
        ],
      },
    ],
  },
  {
    id: 'vehicles',
    title: 'Vehicles & Transport',
    tagline: 'Trucks, trailers & carts for moving produce & goods',
    description:
      'Rent transport vehicles to farmers, traders & logistics. Peak demand during harvest & planting, with year-round use for fertilizers, seeds, and market runs.',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Trucks (4–10 ton)', 'Tractor + Trailer', 'Pickup vehicles', 'Cold storage trucks'],
    minPhotos: 4,
    photoGuidance: 'Include: exterior sides, cargo area, engine, and on-road view',
    hasConditionChecklist: true,
    conditionItems: [
      'Engine runs smoothly',
      'Tires/wheels in good condition',
      'No major dents or welding issues',
      'Lights & indicators working',
      'Papers complete (RC, insurance, pollution)',
    ],
    pricing: {
      budget: '₹600–₹900',
      average: '₹1,000–₹1,500',
      premium: '₹1,600–₹2,200',
      note: 'Cold storage trucks command 20–30% premium',
      unit: 'day',
    },
    nameLabel: 'Vehicle name / model',
    namePlaceholder: 'e.g., Ashok Leyland 2516 Truck',
    adaptiveFields: [
      {
        id: 'vehicleType',
        label: 'Vehicle type',
        type: 'select',
        required: true,
        options: [
          { value: 'truck', label: 'Truck' },
          { value: 'trailer', label: 'Open / closed trailer' },
          { value: 'tractor-trailer', label: 'Tractor + Trailer combo' },
          { value: 'auto', label: 'Three-wheeler (Auto)' },
          { value: 'pickup', label: 'Pickup (4-wheel)' },
          { value: 'cold-storage', label: 'Cold storage truck' },
          { value: 'bullock-cart', label: 'Bullock cart' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'capacity',
        label: 'Load capacity',
        type: 'text',
        placeholder: 'e.g., 6 metric tons',
        required: true,
        helperText: 'Maximum load in tons or kg',
      },
      {
        id: 'fuelEfficiency',
        label: 'Fuel efficiency',
        type: 'text',
        placeholder: 'e.g., 8–10 km/L',
      },
      {
        id: 'specialFeatures',
        label: 'Special features',
        type: 'text',
        placeholder: 'Covered, refrigerated, tarpaulin included…',
      },
      {
        id: 'driverIncluded',
        label: 'Driver included?',
        type: 'select',
        options: [
          { value: 'yes', label: 'Yes — driver included' },
          { value: 'optional', label: 'Optional (extra charge)' },
          { value: 'no', label: 'Vehicle only' },
        ],
      },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Hand Equipment',
    tagline: 'Portable equipment & tools for daily farm operations',
    description:
      'Rent specialized tools seasonally. Lower investment, quick turnover, steady income. High rental frequency means consistent year-round earnings.',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Sprayers (manual & power)', 'Water pumps', 'Brush cutters', 'Generators & chainsaws'],
    minPhotos: 3,
    photoGuidance: 'Include: full view, working state, and close-up of condition',
    hasConditionChecklist: true,
    conditionItems: [
      'All functions work smoothly',
      'No damage, dents, or rust',
      'Safety features intact',
      'Clean & well-maintained',
      'Complete with all accessories',
    ],
    pricing: {
      budget: '₹20–₹100 (hand tools)',
      average: '₹150–₹400 (motorized)',
      premium: '₹300–₹700 (power equipment)',
      note: 'Pumps & generators: ₹200–₹500/day',
      unit: 'day',
    },
    nameLabel: 'Tool / equipment name',
    namePlaceholder: 'e.g., Honda 2HP Water Pump',
    adaptiveFields: [
      {
        id: 'toolType',
        label: 'Equipment type',
        type: 'select',
        required: true,
        options: [
          { value: 'sprayer-manual', label: 'Sprayer (manual)' },
          { value: 'sprayer-power', label: 'Power sprayer' },
          { value: 'pump', label: 'Water pump' },
          { value: 'generator', label: 'Power generator' },
          { value: 'chainsaw', label: 'Chainsaw' },
          { value: 'brush-cutter', label: 'Brush cutter' },
          { value: 'weeding', label: 'Weeding tools' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'specs',
        label: 'Specifications',
        type: 'text',
        placeholder: 'e.g., 20L capacity, 5 HP',
        required: true,
        helperText: 'Power, capacity, dimensions',
      },
      {
        id: 'powerSource',
        label: 'Fuel / power',
        type: 'select',
        options: [
          { value: 'petrol', label: 'Petrol' },
          { value: 'diesel', label: 'Diesel' },
          { value: 'electric', label: 'Electric' },
          { value: 'manual', label: 'Manual (no fuel)' },
        ],
      },
      {
        id: 'usageGuidance',
        label: 'Usage guidance available?',
        type: 'select',
        options: [
          { value: 'yes', label: 'Yes — I will explain proper use' },
          { value: 'no', label: 'No — renters should know how' },
        ],
      },
    ],
  },
  {
    id: 'labour',
    title: 'Labour Services',
    tagline: 'Skilled & unskilled workers for farm operations',
    description:
      'List as a skilled worker or labour team. Farmers hire for seasonal work, harvest help, or specialized tasks. Build reputation through reviews.',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Unskilled / general labour', 'Semi-skilled (irrigation, spraying)', 'Skilled (machinery, repair)', 'Labour teams'],
    minPhotos: 2,
    photoGuidance: 'Include: portrait/ID photo, and at work if possible',
    hasConditionChecklist: true,
    conditionItems: [
      'Clear description of skills',
      'Years of experience stated',
      'Availability clear (seasonal / year-round)',
      'Realistic wage expectations',
      'References available (1–2 farmers)',
    ],
    pricing: {
      budget: '₹350–₹600 (unskilled)',
      average: '₹700–₹1,200 (semi-skilled)',
      premium: '₹1,500–₹2,500 (skilled)',
      note: 'Teams: ₹5,000–₹25,000 per project',
      unit: 'day',
    },
    nameLabel: 'Your name / team name',
    namePlaceholder: 'e.g., Ramesh Kumar / Harvest Team',
    adaptiveFields: [
      {
        id: 'labourType',
        label: 'Labour type',
        type: 'select',
        required: true,
        options: [
          { value: 'unskilled', label: 'Unskilled / general' },
          { value: 'semi-skilled', label: 'Semi-skilled' },
          { value: 'skilled', label: 'Skilled' },
          { value: 'team', label: 'Labour team' },
        ],
      },
      {
        id: 'skills',
        label: 'Skills & activities',
        type: 'textarea',
        placeholder: 'e.g., Weeding, harvesting, tractor operation, pesticide application…',
        required: true,
        helperText: 'List tasks you are proficient in',
      },
      {
        id: 'experience',
        label: 'Years of experience',
        type: 'number',
        placeholder: 'e.g., 5',
        required: true,
      },
      {
        id: 'availability',
        label: 'Availability',
        type: 'select',
        required: true,
        options: [
          { value: 'seasonal', label: 'Seasonal (harvest / planting)' },
          { value: 'year-round', label: 'Year-round' },
          { value: 'on-demand', label: 'Flexible / on-demand' },
        ],
      },
      {
        id: 'teamSize',
        label: 'Team size (if applicable)',
        type: 'text',
        placeholder: 'e.g., 8 workers',
      },
      {
        id: 'languages',
        label: 'Languages spoken',
        type: 'text',
        placeholder: 'e.g., Telugu, Hindi',
      },
    ],
  },
  {
    id: 'driver-services',
    title: 'Driver Profile',
    tagline: 'Truck, tractor & farm transport operators',
    description:
      'List yourself as a licensed driver for crop transport, mandi runs, tractor-trailer haulage, or on-field equipment moves. Steady work, flexible routes, repeat clients.',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Truck driver', 'Tractor operator', 'Farm-to-mandi haulage', 'Field logistics'],
    minPhotos: 2,
    photoGuidance: 'Include: professional portrait and driving license (visible)',
    hasConditionChecklist: true,
    conditionItems: [
      'License details & validity stated',
      'Years of experience stated',
      'Vehicle types you can operate listed',
      'Availability clearly marked',
      'Rate clearly stated',
      '1–2 references from previous employers',
    ],
    pricing: {
      budget: '₹1,500–₹2,500 (driver only)',
      average: '₹2,000–₹4,000 (driver + vehicle)',
      premium: '₹3,000–₹6,000 (specialized)',
      note: 'Hourly: ₹200–₹400/hour · Long-haul: ₹2,500–₹5,000/day',
      unit: 'day',
    },
    nameLabel: 'Your name',
    namePlaceholder: 'Ramesh Yadav – Truck & Tractor Driver, Karimnagar',
    descriptionPlaceholder:
      '10 years of experience driving farm trucks and tractor-trailers for produce transport and field logistics. Familiar with local mandi routes. Available for both farm-to-market runs and on-field equipment operation.',
    profileSample: {
      name: 'Ramesh Yadav – Truck & Tractor Driver, Karimnagar',
      description:
        '10 years of experience driving farm trucks and tractor-trailers for produce transport and field logistics. Familiar with local mandi routes. Available for both farm-to-market runs and on-field equipment operation.',
      fields: {
        serviceType: 'truck-driver',
        licenseType: 'commercial-hv',
        vehicleTypes: 'Truck, Tractor+Trailer',
        experience: '10',
        availability: 'full-time',
        languages: 'Telugu, Hindi, English',
      },
    },
    adaptiveFields: [
      {
        id: 'serviceType',
        label: 'Service type',
        type: 'select',
        required: true,
        options: [
          { value: 'truck-driver', label: 'Truck Driver' },
          { value: 'tractor-operator', label: 'Tractor Operator' },
          { value: 'vehicle-driver', label: 'Vehicle + driver' },
          { value: 'driver-only', label: 'Driver only (no vehicle)' },
          { value: 'logistics', label: 'Logistics & coordination' },
        ],
      },
      {
        id: 'licenseType',
        label: 'License category',
        type: 'select',
        required: true,
        options: [
          { value: 'commercial-hv', label: 'Commercial (Heavy Vehicle)' },
          { value: 'lmv', label: 'LMV (light motor vehicle)' },
          { value: 'hmv', label: 'HMV (heavy motor vehicle)' },
          { value: 'both', label: 'Both LMV & HMV' },
          { value: 'tractor', label: 'Tractor / trailer' },
        ],
      },
      {
        id: 'vehicleTypes',
        label: 'Vehicles you can operate',
        type: 'text',
        placeholder: 'Truck, Tractor+Trailer',
        required: true,
      },
      {
        id: 'experience',
        label: 'Years of driving experience',
        type: 'number',
        placeholder: '10',
        required: true,
      },
      {
        id: 'availability',
        label: 'Availability',
        type: 'select',
        required: true,
        options: [
          { value: 'full-time', label: 'Full-time' },
          { value: 'part-time', label: 'Part-time' },
          { value: 'seasonal', label: 'Seasonal' },
          { value: 'on-demand', label: 'On-demand' },
        ],
      },
      {
        id: 'languages',
        label: 'Languages spoken',
        type: 'text',
        placeholder: 'Telugu, Hindi, English',
      },
    ],
  },
  {
    id: 'agricultural-land',
    title: 'Agricultural Land',
    tagline: 'Rent out farmland for cultivation or other uses',
    description:
      'Lease farmland to farmers or agribusinesses. Passive income from idle land with seasonal, annual, or multi-year terms.',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Irrigated farmland', 'Rainfed / dry land', 'Orchards & plantations', 'Fish ponds & greenhouses'],
    minPhotos: 5,
    photoGuidance: 'Include: full land view, soil closeup, irrigation, road access, and GPS/landmark',
    hasConditionChecklist: true,
    conditionItems: [
      'Exact area stated (acres/hectares/guntas)',
      'Soil type & yield data noted',
      'Water source & availability described',
      'Irrigation infrastructure detailed',
      'Road & market access described',
      'Lease duration options listed',
      'GPS / landmark description provided',
    ],
    pricing: {
      budget: '₹5,000–₹15,000 (fallow)',
      average: '₹10,000–₹25,000 (rainfed)',
      premium: '₹25,000–₹50,000 (irrigated)',
      note: 'Per acre per season · Orchards & ponds vary',
      unit: 'season',
    },
    nameLabel: 'Land listing title',
    namePlaceholder: 'e.g., 5-acre irrigated land near Warangal',
    adaptiveFields: [
      {
        id: 'landType',
        label: 'Land type',
        type: 'select',
        required: true,
        options: [
          { value: 'irrigated', label: 'Cultivated (with irrigation)' },
          { value: 'rainfed', label: 'Rainfed / dry land' },
          { value: 'orchard', label: 'Orchard / plantation' },
          { value: 'fallow', label: 'Fallow land' },
          { value: 'grazing', label: 'Grazing / pasture' },
          { value: 'fish-pond', label: 'Fish pond / aquaculture' },
          { value: 'greenhouse', label: 'Greenhouse / polytunnel space' },
        ],
      },
      {
        id: 'area',
        label: 'Land area',
        type: 'text',
        placeholder: 'e.g., 3.5 acres',
        required: true,
      },
      {
        id: 'soilType',
        label: 'Soil type',
        type: 'text',
        placeholder: 'e.g., Black cotton, red loamy',
      },
      {
        id: 'waterSource',
        label: 'Water & irrigation',
        type: 'textarea',
        placeholder: 'Well depth, bore yield, canal, drip system…',
        required: true,
        helperText: 'Critical for renters — be specific',
      },
      {
        id: 'leaseTerms',
        label: 'Lease terms available',
        type: 'select',
        required: true,
        options: [
          { value: 'seasonal', label: 'Seasonal (3–4 months)' },
          { value: 'annual', label: 'Annual (12 months)' },
          { value: 'multi-year', label: 'Multi-year' },
          { value: 'flexible', label: 'Flexible / negotiable' },
        ],
      },
      {
        id: 'access',
        label: 'Road & market access',
        type: 'text',
        placeholder: 'e.g., 2 km from paved road, 8 km to market',
      },
    ],
  },
  {
    id: 'storage',
    title: 'Storage & Infrastructure',
    tagline: 'Warehouses, sheds & storage solutions',
    description:
      'Rent storage for crops, seeds, fertilizers, or equipment. Seasonal demand, low maintenance, passive income from unused building space.',
    color: 'var(--cv-forest)',
    softBg: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
    examples: ['Warehouses & godowns', 'Cold storage', 'Grain silos', 'Drying yards & equipment sheds'],
    minPhotos: 5,
    photoGuidance: 'Include: exterior, interior space, security, loading area, and location context',
    hasConditionChecklist: true,
    conditionItems: [
      'Exact size / capacity stated',
      'Storage type (open / covered / cold) clear',
      'Ventilation & moisture control described',
      'Security features listed',
      'Loading / unloading access detailed',
      'Power & water availability noted',
      'Maintenance responsibility stated',
    ],
    pricing: {
      budget: '₹10–₹20/sq.ft (open)',
      average: '₹15–₹40/sq.ft (covered)',
      premium: '₹40–₹100+/sq.ft (cold)',
      note: 'Monthly rates · Silos & sheds priced per unit',
      unit: 'month',
    },
    nameLabel: 'Storage listing title',
    namePlaceholder: 'e.g., 2000 sq.ft covered godown — Karimnagar',
    adaptiveFields: [
      {
        id: 'storageType',
        label: 'Storage type',
        type: 'select',
        required: true,
        options: [
          { value: 'warehouse-open', label: 'Warehouse — open' },
          { value: 'warehouse-covered', label: 'Warehouse — fully covered' },
          { value: 'godown', label: 'Godown (traditional)' },
          { value: 'cold-storage', label: 'Cold storage' },
          { value: 'silo-steel', label: 'Grain silo — steel' },
          { value: 'silo-concrete', label: 'Grain silo — concrete' },
          { value: 'storage-tank', label: 'Storage tank (liquid / FRP)' },
          { value: 'drying-yard', label: 'Drying yard' },
          { value: 'drying-shed', label: 'Drying shed (semi-covered)' },
          { value: 'fertilizer', label: 'Fertilizer storage' },
          { value: 'seed-storage', label: 'Seed storage room' },
          { value: 'equipment-shed', label: 'Equipment shed / garage' },
          { value: 'greenhouse', label: 'Greenhouse' },
          { value: 'polytunnel', label: 'Polytunnel' },
          { value: 'pack-house', label: 'Pack house / grading shed' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'capacity',
        label: 'Capacity / size',
        type: 'text',
        placeholder: 'e.g., 1500 sq.ft or 100 tons',
        required: true,
        helperText: 'Use sq.ft, cubic meters, tons, or bags',
      },
      {
        id: 'capacityUnit',
        label: 'Capacity unit',
        type: 'select',
        required: true,
        options: [
          { value: 'sqft', label: 'Square feet (sq.ft)' },
          { value: 'sqm', label: 'Square meters' },
          { value: 'tons', label: 'Tons' },
          { value: 'bags', label: 'Bags' },
          { value: 'cubic-m', label: 'Cubic meters' },
          { value: 'per-unit', label: 'Per unit / shed / silo' },
        ],
      },
      {
        id: 'coverage',
        label: 'Coverage',
        type: 'select',
        required: true,
        options: [
          { value: 'open', label: 'Open (uncovered)' },
          { value: 'semi', label: 'Semi-covered' },
          { value: 'full', label: 'Fully covered' },
          { value: 'climate', label: 'Climate-controlled / cold' },
          { value: 'insulated', label: 'Insulated (non-cold)' },
        ],
      },
      {
        id: 'flooring',
        label: 'Flooring / surface',
        type: 'select',
        options: [
          { value: 'concrete', label: 'Concrete' },
          { value: 'brick', label: 'Brick' },
          { value: 'tiled', label: 'Tiled' },
          { value: 'earthen', label: 'Earthen / compacted soil' },
          { value: 'raised-platform', label: 'Raised platform' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'ventilation',
        label: 'Ventilation',
        type: 'select',
        options: [
          { value: 'natural', label: 'Natural air circulation' },
          { value: 'vents', label: 'Wall / roof vents' },
          { value: 'exhaust-fans', label: 'Exhaust fans' },
          { value: 'forced-air', label: 'Forced-air system' },
          { value: 'none', label: 'Limited / none' },
        ],
      },
      {
        id: 'moisture',
        label: 'Moisture control',
        type: 'select',
        options: [
          { value: 'waterproof', label: 'Waterproof roof & walls' },
          { value: 'drainage', label: 'Drainage available' },
          { value: 'damp-proof', label: 'Damp-proof flooring' },
          { value: 'dehumidifier', label: 'Dehumidifier / dryers' },
          { value: 'basic', label: 'Basic weather protection' },
          { value: 'none', label: 'No special moisture control' },
        ],
      },
      {
        id: 'temperature',
        label: 'Temperature control',
        type: 'select',
        options: [
          { value: 'none', label: 'Ambient (no control)' },
          { value: 'fans', label: 'Fans / cooling only' },
          { value: 'cold-0-10', label: 'Cold storage 0–10°C' },
          { value: 'cold-10-25', label: 'Cool storage 10–25°C' },
          { value: 'adjustable', label: 'Adjustable climate control' },
        ],
      },
      {
        id: 'security',
        label: 'Security features',
        type: 'multi-select',
        helperText: 'Select all that apply',
        options: [
          { value: 'padlock', label: 'Padlock / locked doors' },
          { value: 'gated', label: 'Gated compound' },
          { value: 'boundary-wall', label: 'Boundary wall' },
          { value: 'watchman', label: 'Watchman / security guard' },
          { value: 'cctv', label: 'CCTV cameras' },
          { value: 'alarm', label: 'Alarm system' },
          { value: 'night-lighting', label: 'Night lighting' },
          { value: 'fire-safety', label: 'Fire extinguisher / safety' },
          { value: 'none', label: 'No special security' },
        ],
      },
      {
        id: 'loading',
        label: 'Loading access',
        type: 'multi-select',
        helperText: 'Select all that apply',
        options: [
          { value: 'truck-access', label: 'Truck can reach door' },
          { value: 'tractor-access', label: 'Tractor access' },
          { value: 'loading-ramp', label: 'Loading ramp' },
          { value: 'dock', label: 'Loading dock' },
          { value: 'wide-gate', label: 'Wide gate for large vehicles' },
          { value: 'paved-approach', label: 'Paved approach road' },
          { value: 'dirt-approach', label: 'Dirt / kacha approach' },
          { value: 'manual-only', label: 'Manual loading only' },
        ],
      },
      {
        id: 'utilities',
        label: 'Power & water',
        type: 'multi-select',
        helperText: 'Select all that apply',
        options: [
          { value: 'electricity', label: 'Electricity available' },
          { value: '3-phase', label: '3-phase power' },
          { value: 'backup-generator', label: 'Backup generator' },
          { value: 'fans-cooling', label: 'Power for fans / cooling' },
          { value: 'water-tap', label: 'Water tap on site' },
          { value: 'borewell', label: 'Borewell / well nearby' },
          { value: 'lighting', label: 'Interior lighting' },
          { value: 'none', label: 'No power or water' },
        ],
      },
      {
        id: 'roadAccess',
        label: 'Road & market access',
        type: 'select',
        options: [
          { value: 'main-road', label: 'On main / highway road' },
          { value: 'paved-1km', label: 'Within 1 km of paved road' },
          { value: 'paved-5km', label: '1–5 km from paved road' },
          { value: 'remote', label: 'Remote / village approach' },
          { value: 'near-market', label: 'Near market / mandi' },
        ],
      },
      {
        id: 'leaseTerms',
        label: 'Lease terms available',
        type: 'select',
        required: true,
        options: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'seasonal', label: 'Seasonal' },
          { value: 'annual', label: 'Annual' },
          { value: 'flexible', label: 'Flexible / negotiable' },
        ],
      },
      {
        id: 'maintenance',
        label: 'Maintenance responsibility',
        type: 'select',
        options: [
          { value: 'owner', label: 'Owner maintains structure' },
          { value: 'renter', label: 'Renter responsible for upkeep' },
          { value: 'shared', label: 'Shared (structure vs. contents)' },
          { value: 'negotiable', label: 'Negotiable' },
        ],
      },
    ],
  },
]

export function getCategoryById(id: RentalCategoryId | ''): RentalCategory | undefined {
  return RENTAL_CATEGORIES.find((c) => c.id === id)
}

export const STEP_LABELS = ['Category', 'Details', 'Pricing', 'Review'] as const
