/** Sides of a deal: the tables and modifiers can apply only to buying or only to selling. */
export const TRADING_CONTEXTS = ['purchase', 'sale'] as const;
export type TradingContext = (typeof TRADING_CONTEXTS)[number];

/** Special results of the negotiation: no deal, a deal gone wrong, or a better offer than the table gives. */
export const NEGOTIATION_OUTCOMES = ['no-agreement', 'absolute-failure', 'special-offer'] as const;
export type NegotiationOutcome = (typeof NEGOTIATION_OUTCOMES)[number];

/** One row of the negotiation table: the percent of the expected price for a range of the active side's total. */
export interface NegotiationRow {
  /** Null: no lower limit */
  min: number | null;
  /** Null: no upper limit */
  max: number | null;
  /** Percent of the expected price when buying; null when the row has no deal */
  purchase: number | null;
  /** Percent of the expected price when selling; null when the row has no deal */
  sale: number | null;
  outcome?: NegotiationOutcome;
}

export const PRICE_FACTOR_TYPES = ['choice', 'flag', 'number'] as const;
export type PriceFactorType = (typeof PRICE_FACTOR_TYPES)[number];

/** A multiplier of the expected price, or percent points added to it. */
export const PRICE_FACTOR_MODES = ['multiplier', 'percent'] as const;
export type PriceFactorMode = (typeof PRICE_FACTOR_MODES)[number];

export interface PriceFactorOption {
  key: string;
  value: number;
}

/**
 * A market condition of the expected price: a choice among options, a flag with a value, or a number of units with a
 * value per unit (days of travel, borders crossed...).
 */
export interface PriceFactor {
  key: string;
  type: PriceFactorType;
  mode: PriceFactorMode;
  value?: number;
  options?: PriceFactorOption[];
  perUnit?: number;
  min?: number;
  max?: number;
  /** Sides it applies to; every side when missing */
  contexts?: TradingContext[];
  description?: string;
}

/** One row of the taxes and tolls (Treasure Law Table 2-2i, spec 062): a reference table that no rule reads. */
export interface TaxRow {
  key: string;
  /** Gold; null when the tax has no fixed cost (a percent, a varying fee) */
  cost: number | null;
  /** What the cost is charged per, as printed */
  unit: string | null;
  notes: string | null;
}

/**
 * Tables of buying and selling (workspace spec 048): the negotiation table and the price factors of the expected
 * price. The values come from the rulebook and are imported from the gitignored data directory
 * (data/treasure-law/trading-tables.json), never written in code.
 */
export interface TradingTables {
  negotiation: NegotiationRow[];
  priceFactors: PriceFactor[];
  /** Taxes and tolls (spec 062), stored in their own document; empty until imported */
  taxation: TaxRow[];
}
