export class ApiError {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly status = 400,
    public readonly details?: unknown,
  ) {}
}

export function paginate(page = 1, limit = 20) {
  const take = Math.min(Math.max(limit, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip, page: Math.max(page, 1), limit: take };
}

export function pageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** Platform take-rate (15%) — escrow model */
export const PLATFORM_FEE_RATE = 0.15;

export function calcFees(subtotal: number) {
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
  const sellerEarnings = Math.round((subtotal - platformFee) * 100) / 100;
  return { platformFee, sellerEarnings, total: subtotal };
}

export function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'listing'
  );
}

export function orderNumber(kind: string) {
  const prefix =
    kind === 'RENTAL' ? 'BK' : kind === 'SERVICE' ? 'AP' : kind === 'COURSE' ? 'EN' : 'PO';
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}
