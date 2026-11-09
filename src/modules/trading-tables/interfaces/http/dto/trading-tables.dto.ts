import { ApiProperty } from '@nestjs/swagger';
import {
  NEGOTIATION_OUTCOMES,
  type NegotiationOutcome,
  PRICE_FACTOR_MODES,
  PRICE_FACTOR_TYPES,
  type PriceFactorMode,
  type PriceFactorType,
  TRADING_CONTEXTS,
  type TradingContext,
  type TradingTables,
} from '../../../domain/value-objects/trading-tables.vo.js';

export class NegotiationRowDto {
  @ApiProperty({ type: Number, nullable: true, example: 1, description: 'Lowest total of the row; null has no limit' })
  min: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 10, description: 'Highest total of the row; null has no limit' })
  max: number | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Percent of the expected price when buying' })
  purchase: number | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Percent of the expected price when selling' })
  sale: number | null;

  @ApiProperty({ type: String, enum: NEGOTIATION_OUTCOMES, required: false })
  outcome?: NegotiationOutcome;
}

export class PriceFactorOptionDto {
  @ApiProperty({ example: 'merchant' })
  key: string;

  @ApiProperty()
  value: number;
}

export class PriceFactorDto {
  @ApiProperty({ example: 'supply-demand' })
  key: string;

  @ApiProperty({ type: String, enum: PRICE_FACTOR_TYPES })
  type: PriceFactorType;

  @ApiProperty({ type: String, enum: PRICE_FACTOR_MODES, description: 'A multiplier, or percent points added' })
  mode: PriceFactorMode;

  @ApiProperty({ required: false, description: 'Flag: its value' })
  value?: number;

  @ApiProperty({ type: [PriceFactorOptionDto], required: false, description: 'Choice: its options' })
  options?: PriceFactorOptionDto[];

  @ApiProperty({ required: false, description: 'Number: value of each unit' })
  perUnit?: number;

  @ApiProperty({ required: false })
  min?: number;

  @ApiProperty({ required: false })
  max?: number;

  @ApiProperty({ type: [String], enum: TRADING_CONTEXTS, required: false, description: 'Sides it applies to; all when missing' })
  contexts?: TradingContext[];

  @ApiProperty({ required: false })
  description?: string;
}

/** A row of the taxes and tolls (Treasure Law Table 2-2i, spec 062). */
export class TaxRowDto {
  @ApiProperty({ example: 'bridge-toll' })
  key: string;

  @ApiProperty({ type: Number, nullable: true, description: 'Gold; null when it has no fixed cost' })
  cost: number | null;

  @ApiProperty({ type: String, nullable: true, description: 'What the cost is charged per, as printed' })
  unit: string | null;

  @ApiProperty({ type: String, nullable: true })
  notes: string | null;
}

export class TradingTablesDto {
  @ApiProperty({ type: [NegotiationRowDto], description: 'Negotiation table: percent of the expected price by total' })
  negotiation: NegotiationRowDto[];

  @ApiProperty({ type: [PriceFactorDto], description: 'Market conditions of the expected price' })
  priceFactors: PriceFactorDto[];

  @ApiProperty({ type: [TaxRowDto], description: 'Taxes and tolls (spec 062); empty until imported' })
  taxation: TaxRowDto[];

  static fromEntity(entity: TradingTables): TradingTablesDto {
    return Object.assign(new TradingTablesDto(), entity);
  }
}
