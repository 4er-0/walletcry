/**
 * Financing: BNPL/installment math and a save-up-vs-finance comparison for the
 * wishlist financing calculator.
 */

import { affordability } from './affordability'
import { round2 } from './money'

export interface BnplResult {
  monthlyPayment: number
  totalPaid: number
  totalInterest: number
  months: number
}

/**
 * Installment plan for borrowing `principal` at annual `apr` over `termMonths`,
 * using the standard annuity formula. 0% APR → interest-free equal payments.
 */
export function bnpl(principal: number, apr: number, termMonths: number): BnplResult {
  if (termMonths <= 0 || principal <= 0) {
    return { monthlyPayment: 0, totalPaid: 0, totalInterest: 0, months: 0 }
  }
  const r = apr / 12
  const monthlyPayment =
    r === 0
      ? round2(principal / termMonths)
      : round2((principal * r) / (1 - Math.pow(1 + r, -termMonths)))
  const totalPaid = round2(monthlyPayment * termMonths)
  return {
    monthlyPayment,
    totalPaid,
    totalInterest: round2(totalPaid - principal),
    months: termMonths,
  }
}

export interface FinancingComparison {
  price: number
  /** Save up from surplus and buy outright. */
  saveUp: { months: number | null; interestCost: 0 }
  /** Finance now via BNPL/installments. */
  finance: BnplResult
  /** Extra paid (interest) to finance instead of saving up. */
  interestPremium: number
}

/** Compare buying-by-saving vs financing the purchase now. */
export function compareFinancing(params: {
  price: number
  apr: number
  termMonths: number
  monthlySurplus: number
  alreadySaved?: number
}): FinancingComparison {
  const { price, apr, termMonths, monthlySurplus, alreadySaved = 0 } = params
  const finance = bnpl(price - alreadySaved, apr, termMonths)
  return {
    price,
    saveUp: { months: affordability(price, monthlySurplus, alreadySaved).months, interestCost: 0 },
    finance,
    interestPremium: finance.totalInterest,
  }
}
