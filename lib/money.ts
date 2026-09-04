/** Local-currency conversion rates, e.g. `{"UZS": 13000, "TJS": 12}`. */
export type ExchangeRates = Record<string, number>;

/** Convert an amount in the base currency (EUR) to a local currency. */
export function convertEur(amountEur: number, currency: string, rates: ExchangeRates): number {
  const rate = rates[currency];
  return rate && rate > 0 ? amountEur * rate : 0;
}

/** Format an amount as currency, honouring the currency's minor units. */
export function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
