import type { ServiceCategoryId } from './serviceCategoryContent'

export type RegionTierId = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4'
export type SeasonId = 'peak' | 'normal' | 'off'
export type FarmerSegmentId = 'small' | 'medium' | 'large' | 'organic' | 'institutional'

export interface RegionTier {
  id: RegionTierId
  label: string
  examples: string
  adjustment: string
  factor: number
}

export interface PricePackage {
  id: string
  label: string
  description: string
  /** Base (Tier-2) mid price in INR */
  basePrice: number
  unit: string
}

export interface PriceAddon {
  id: string
  label: string
  price: number
}

export interface ServicePricingGuide {
  categoryId: ServiceCategoryId
  packages: PricePackage[]
  addons: PriceAddon[]
  seasonalNote: string
  tip: string
  /** Display rows for market reference by region */
  regionalTable: { packageLabel: string; t1: string; t2: string; t3: string; t4: string }[]
}

export const REGION_TIERS: RegionTier[] = [
  {
    id: 'tier-1',
    label: 'Tier 1 — Metro / peri-urban',
    examples: 'Bangalore, Hyderabad, Pune, NCR',
    adjustment: '+30–50% vs base',
    factor: 1.4,
  },
  {
    id: 'tier-2',
    label: 'Tier 2 — Semi-urban',
    examples: 'Nashik, Aurangabad, Indore, Bhopal',
    adjustment: 'Base pricing',
    factor: 1,
  },
  {
    id: 'tier-3',
    label: 'Tier 3 — Rural / district HQ',
    examples: 'District towns, smaller mandals',
    adjustment: '−20–30% vs base',
    factor: 0.75,
  },
  {
    id: 'tier-4',
    label: 'Tier 4 — Very remote',
    examples: 'Village-level service areas',
    adjustment: '−30–50% vs base',
    factor: 0.6,
  },
]

export const SEASON_OPTIONS: { id: SeasonId; label: string; factor: number; hint: string }[] = [
  { id: 'peak', label: 'Peak season', factor: 1.1, hint: 'Feb–May, Sept–Nov · typically +10–20%' },
  { id: 'normal', label: 'Normal season', factor: 1, hint: 'Standard demand' },
  { id: 'off', label: 'Off-season', factor: 0.9, hint: 'Often −10–15% to attract bookings' },
]

export const FARMER_SEGMENTS: {
  id: FarmerSegmentId
  label: string
  discount: number
  hint: string
}[] = [
  { id: 'small', label: 'Smallholders (<2 ha)', discount: 0.2, hint: 'Affordability focus · ~15–25% softer rates' },
  { id: 'medium', label: 'Medium farms (2–10 ha)', discount: 0, hint: 'Base pricing works well' },
  { id: 'large', label: 'Large / commercial (10+ ha)', discount: 0.15, hint: 'Volume discount · contracts' },
  { id: 'organic', label: 'Organic farmers', discount: -0.12, hint: 'Specialized expertise · slight premium' },
  { id: 'institutional', label: 'Co-ops / institutions', discount: 0.25, hint: 'Bulk / group rates' },
]

export const SERVICE_PRICING: Record<ServiceCategoryId, ServicePricingGuide> = {
  'soil-testing': {
    categoryId: 'soil-testing',
    tip: 'Clear package + region keeps farmers from negotiating every sample.',
    seasonalNote: 'Peak sowing months: +10%. Slow months (Jun–Aug, Dec–Jan): −10%.',
    packages: [
      { id: 'standard', label: 'Standard sample', description: 'Basic analysis report', basePrice: 300, unit: 'sample' },
      { id: 'premium', label: 'Premium (micronutrients)', description: 'NPK + micro nutrients', basePrice: 500, unit: 'sample' },
      { id: 'bulk', label: 'Bulk (10+ samples)', description: 'Volume rate per sample', basePrice: 250, unit: 'sample' },
      { id: 'farm-plan', label: 'Farm plan report', description: '5-page crop recommendations', basePrice: 500, unit: 'report' },
    ],
    addons: [
      { id: 'micro', label: 'Micronutrient testing', price: 100 },
      { id: 'heavy', label: 'Heavy metal testing', price: 200 },
      { id: 'organic', label: 'Organic certification testing', price: 150 },
      { id: 'field-visit', label: 'Field visit + interpretation', price: 300 },
    ],
    regionalTable: [
      { packageLabel: 'Standard', t1: '₹400', t2: '₹300', t3: '₹240', t4: '₹200' },
      { packageLabel: 'Premium', t1: '₹650', t2: '₹500', t3: '₹400', t4: '₹350' },
      { packageLabel: 'Bulk 10+', t1: '₹330', t2: '₹250', t3: '₹200', t4: '₹170' },
    ],
  },
  'farm-consultancy': {
    categoryId: 'farm-consultancy',
    tip: 'Price by delivery mode (video vs on-farm). Experience tier can justify premium.',
    seasonalNote: 'Seasonal planning packages sell best before Kharif & Rabi.',
    packages: [
      { id: 'video', label: 'Video / phone (1 hr)', description: 'Remote advisory call', basePrice: 2000, unit: 'session' },
      { id: 'single', label: 'On-farm visit (2–3 hrs)', description: 'Single consultation', basePrice: 4000, unit: 'session' },
      { id: 'seasonal', label: 'Seasonal planning', description: 'Written multi-crop plan', basePrice: 6000, unit: 'plan' },
      { id: 'blueprint', label: 'Full farm blueprint', description: '5–10 ha detailed plan', basePrice: 10000, unit: 'project' },
    ],
    addons: [
      { id: 'written-plan', label: 'Written farm plan', price: 1000 },
      { id: 'calculator', label: 'Crop Excel calculator', price: 500 },
      { id: 'market', label: 'Market demand research', price: 800 },
      { id: 'followup', label: 'Video follow-up session', price: 500 },
    ],
    regionalTable: [
      { packageLabel: 'On-farm visit', t1: '₹5–6k', t2: '₹4–4.5k', t3: '₹3–3.5k', t4: '₹2–2.5k' },
      { packageLabel: 'Video call', t1: '₹2.5–3k', t2: '₹2–2.5k', t3: '₹1.5–2k', t4: '₹1–1.5k' },
      { packageLabel: 'Seasonal plan', t1: '₹8k', t2: '₹6k', t3: '₹4.5k', t4: '₹3k' },
    ],
  },
  mechanic: {
    categoryId: 'mechanic',
    tip: 'Quote labour clearly; parts are usually extra. Emergency surcharge is expected.',
    seasonalNote: 'Peak (Feb–May, Sept–Nov): +20% labour. Off-season packages: −15%.',
    packages: [
      { id: 'filter', label: 'Filter / minor fix', description: 'Quick pump/engine job', basePrice: 400, unit: 'visit' },
      { id: 'seal', label: 'Seal / bearing job', description: 'Common pump repair', basePrice: 750, unit: 'visit' },
      { id: 'service', label: 'Full engine / pump service', description: 'Standard overhaul labour', basePrice: 2500, unit: 'visit' },
      { id: 'amc-standard', label: 'AMC Standard (3 visits/yr)', description: 'Annual maintenance contract', basePrice: 4000, unit: 'year' },
    ],
    addons: [
      { id: 'emergency-24', label: 'Emergency within 24h', price: 500 },
      { id: 'emergency-12', label: 'Emergency within 12h', price: 1000 },
      { id: 'midnight', label: 'Midnight callout (12–6 AM)', price: 1500 },
      { id: 'parts-markup', label: 'Parts sourcing fee', price: 300 },
    ],
    regionalTable: [
      { packageLabel: 'Typical visit', t1: '1.3–1.5×', t2: 'Base', t3: '0.8×', t4: '0.6×' },
      { packageLabel: 'Pump overhaul', t1: '₹2.6–6k', t2: '₹2–4k', t3: '₹1.6–3.2k', t4: '₹1.2–2.4k' },
      { packageLabel: 'AMC Standard', t1: '₹5.2–6k', t2: '₹4k', t3: '₹3.2k', t4: '₹2.4k' },
    ],
  },
  irrigation: {
    categoryId: 'irrigation',
    tip: 'Show full system cost vs labour-only. Mention subsidy paperwork if you handle it.',
    seasonalNote: 'Monsoon planning promos (−10%) boost off-season adoption.',
    packages: [
      { id: 'labour-drip', label: 'Drip install labour / ha', description: 'Labour only (materials separate)', basePrice: 10000, unit: 'hectare' },
      { id: 'drip-full', label: 'Drip system (full) / ha', description: 'Materials + labour estimate', basePrice: 63000, unit: 'hectare' },
      { id: 'sprinkler-full', label: 'Sprinkler system / ha', description: 'Materials + labour estimate', basePrice: 40000, unit: 'hectare' },
      { id: 'survey', label: 'Site survey + layout', description: 'Design visit only', basePrice: 3000, unit: 'visit' },
    ],
    addons: [
      { id: 'docs', label: 'Subsidy paperwork help', price: 1000 },
      { id: 'fertigation', label: 'Fertigation setup', price: 3000 },
      { id: 'training', label: 'Training (3 sessions)', price: 2000 },
      { id: 'sensor', label: 'Moisture sensor install', price: 10000 },
    ],
    regionalTable: [
      { packageLabel: 'Drip full/ha', t1: '₹80–90k', t2: '₹60–70k', t3: '₹45–50k', t4: '₹35–40k' },
      { packageLabel: 'Sprinkler/ha', t1: '₹50–60k', t2: '₹40–45k', t3: '₹30–35k', t4: '₹22–28k' },
      { packageLabel: 'With subsidy*', t1: 'Lower net', t2: '₹30–45k drip', t3: 'Lower net', t4: 'Lower net' },
    ],
  },
  'equipment-repair': {
    categoryId: 'equipment-repair',
    tip: 'Separate labour vs parts. AMC plans create repeat revenue.',
    seasonalNote: 'Winter plowing season (Nov–Jan): +30%. Monsoon: −10% off-season.',
    packages: [
      { id: 'implement', label: 'Implement repair', description: 'Typical workshop job', basePrice: 2500, unit: 'visit' },
      { id: 'sprayer', label: 'Sprayer overhaul', description: 'Full sprayer service', basePrice: 3000, unit: 'visit' },
      { id: 'tractor', label: 'Tractor major repair', description: 'Engine/transmission labour', basePrice: 11000, unit: 'job' },
      { id: 'amc-single', label: 'AMC single machine', description: '2 visits / year', basePrice: 3000, unit: 'year' },
    ],
    addons: [
      { id: 'welding', label: 'Extra welding joint', price: 450 },
      { id: 'priority', label: 'Priority emergency slot', price: 800 },
      { id: 'tuning', label: 'Performance tuning', price: 1000 },
      { id: 'pickup', label: 'Pickup / drop', price: 500 },
    ],
    regionalTable: [
      { packageLabel: 'Typical job', t1: '+40%', t2: 'Base', t3: '−20%', t4: '−35%' },
      { packageLabel: 'Sprayer overhaul', t1: '₹2.8–5.6k', t2: '₹2–4k', t3: '₹1.6–3.2k', t4: '₹1.3–2.6k' },
      { packageLabel: 'AMC single', t1: '₹4.2k', t2: '₹3k', t3: '₹2.4k', t4: '₹2k' },
    ],
  },
  'drone-spraying': {
    categoryId: 'drone-spraying',
    tip: 'Always state per-hectare rate + minimum area. Chemicals usually farmer-supplied.',
    seasonalNote: 'Pest outbreaks can support surge (+10–15%). Weather cancel: free reschedule.',
    packages: [
      { id: 'spray', label: 'Pesticide spray', description: 'Per hectare · 5 ha min typical', basePrice: 400, unit: 'hectare' },
      { id: 'fertilizer', label: 'Liquid fertilizer spray', description: 'Per hectare', basePrice: 350, unit: 'hectare' },
      { id: 'ndvi', label: 'NDVI / health mapping', description: 'Map + problem report', basePrice: 500, unit: 'hectare' },
      { id: 'scouting', label: 'Pest scouting report', description: 'Visit + analysis', basePrice: 300, unit: 'hectare' },
    ],
    addons: [
      { id: 'chemicals', label: 'Provider-supplied chemicals', price: 3000 },
      { id: 'emergency', label: 'Emergency spray (24–48h)', price: 1000 },
      { id: 'bundle-map', label: 'Spray + mapping bundle (−5%)', price: 0 },
      { id: 'weekly', label: 'Weekly monitoring package', price: 9000 },
    ],
    regionalTable: [
      { packageLabel: 'Spray/ha', t1: '₹500–600', t2: '₹400', t3: '₹320', t4: '₹280' },
      { packageLabel: 'Mapping/ha', t1: '₹650', t2: '₹500', t3: '₹400', t4: '₹350' },
      { packageLabel: 'Scouting/ha', t1: '₹400', t2: '₹300', t3: '₹240', t4: '₹200' },
    ],
  },
  'crop-inspection': {
    categoryId: 'crop-inspection',
    tip: 'Price by field size and visit type (one-time vs seasonal contract).',
    seasonalNote: 'High pest pressure: +15% on weekly contracts. Off-season one-time: −20%.',
    packages: [
      { id: 'one-small', label: 'One-time (<2 ha)', description: 'Single field visit', basePrice: 500, unit: 'visit' },
      { id: 'one-medium', label: 'One-time (2–5 ha)', description: 'Single field visit', basePrice: 750, unit: 'visit' },
      { id: 'one-large', label: 'One-time (5+ ha)', description: 'Single field visit', basePrice: 1000, unit: 'visit' },
      { id: 'critical', label: 'Critical-stage package', description: '3–4 key growth stages', basePrice: 3000, unit: 'season' },
      { id: 'weekly', label: 'Season scouting contract', description: '8–10 visits / season', basePrice: 4500, unit: 'season' },
    ],
    addons: [
      { id: 'photos', label: 'Photo documentation pack', price: 200 },
      { id: 'lab', label: 'Lab ID confirmation', price: 300 },
      { id: 'video', label: 'Video report', price: 100 },
      { id: 'dosage', label: 'Pesticide dosage calculator', price: 200 },
    ],
    regionalTable: [
      { packageLabel: 'One-time', t1: '₹750–1.3k', t2: '₹500–1k', t3: '₹400–800', t4: '₹300–600' },
      { packageLabel: 'Weekly season', t1: '₹4.5–7.5k', t2: '₹3.5–6k', t3: '₹2.8–4.8k', t4: '₹2–3.6k' },
      { packageLabel: 'Critical stages', t1: '₹2.6–5.2k', t2: '₹2–4k', t3: '₹1.6–3.2k', t4: '₹1.2–2.4k' },
    ],
  },
}

export function getRegion(id: RegionTierId): RegionTier {
  return REGION_TIERS.find((t) => t.id === id) ?? REGION_TIERS[1]
}

export function getPricingGuide(categoryId: ServiceCategoryId): ServicePricingGuide {
  return SERVICE_PRICING[categoryId]
}

export function computeSuggestedPrice(opts: {
  categoryId: ServiceCategoryId
  packageId: string
  regionId: RegionTierId
  seasonId: SeasonId
  segmentId: FarmerSegmentId
  addonIds: string[]
  includesScore: number
}): { price: number; min: number; max: number; unit: string; label: string; breakdown: string } {
  const guide = getPricingGuide(opts.categoryId)
  const pkg = guide.packages.find((p) => p.id === opts.packageId) ?? guide.packages[0]
  const region = getRegion(opts.regionId)
  const season = SEASON_OPTIONS.find((s) => s.id === opts.seasonId) ?? SEASON_OPTIONS[1]
  const segment = FARMER_SEGMENTS.find((s) => s.id === opts.segmentId) ?? FARMER_SEGMENTS[1]

  let base = pkg.basePrice * region.factor * season.factor
  // Includes richness: more inclusions → lean toward upper band
  base *= 0.92 + opts.includesScore * 0.16
  // Segment: positive discount lowers; negative (organic) raises
  base *= 1 - segment.discount

  const addonTotal = guide.addons
    .filter((a) => opts.addonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  const mid = Math.round((base + addonTotal) / 10) * 10
  const min = Math.round((mid * 0.9) / 10) * 10
  const max = Math.round((mid * 1.1) / 10) * 10

  return {
    price: mid,
    min,
    max,
    unit: pkg.unit,
    label: pkg.label,
    breakdown: `${pkg.label} · ${region.label.split('—')[0].trim()} · ${season.label}${
      addonTotal ? ` · +₹${addonTotal} add-ons` : ''
    }`,
  }
}
