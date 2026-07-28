export function formatCurrency(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN')}`
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
