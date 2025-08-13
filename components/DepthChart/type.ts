// Dummy data types (simplified versions of the original types)
export interface OrderBookWithRatio {
  price: string;
  quantity: string;
  quantity_total: string;
  accumulation_amount_ratio: number;
}

export interface OrderBookWithPoint extends OrderBookWithRatio {
  x: number;
  y: number;
}
