import { OrderBookWithRatio } from './type';

// Generate dummy data for buy orders (bids) - 15 levels
// Total buy volume: 10.0 BTC, Total sell volume: 8.0 BTC, Combined total: 18.0 BTC
export const buyRowsWithRatio: OrderBookWithRatio[] = [
  {
    price: '95500',
    quantity: '0.2',
    quantity_total: '0.2',
    accumulation_amount_ratio: 0.2 / 18.0,
  }, // ~0.011
  {
    price: '95400',
    quantity: '0.3',
    quantity_total: '0.5',
    accumulation_amount_ratio: 0.5 / 18.0,
  }, // ~0.028
  {
    price: '95300',
    quantity: '0.4',
    quantity_total: '0.9',
    accumulation_amount_ratio: 0.9 / 18.0,
  }, // ~0.05
  {
    price: '95200',
    quantity: '0.6',
    quantity_total: '1.5',
    accumulation_amount_ratio: 1.5 / 18.0,
  }, // ~0.083
  {
    price: '95100',
    quantity: '0.8',
    quantity_total: '2.3',
    accumulation_amount_ratio: 2.3 / 18.0,
  }, // ~0.128
  {
    price: '95000',
    quantity: '1.1',
    quantity_total: '3.4',
    accumulation_amount_ratio: 3.4 / 18.0,
  }, // ~0.189
  {
    price: '94900',
    quantity: '0.9',
    quantity_total: '4.3',
    accumulation_amount_ratio: 4.3 / 18.0,
  }, // ~0.239
  {
    price: '94800',
    quantity: '1.3',
    quantity_total: '5.6',
    accumulation_amount_ratio: 5.6 / 18.0,
  }, // ~0.311
  {
    price: '94700',
    quantity: '0.7',
    quantity_total: '6.3',
    accumulation_amount_ratio: 6.3 / 18.0,
  }, // ~0.35
  {
    price: '94600',
    quantity: '1.0',
    quantity_total: '7.3',
    accumulation_amount_ratio: 7.3 / 18.0,
  }, // ~0.406
  {
    price: '94500',
    quantity: '0.8',
    quantity_total: '8.1',
    accumulation_amount_ratio: 8.1 / 18.0,
  }, // ~0.45
  {
    price: '94400',
    quantity: '0.6',
    quantity_total: '8.7',
    accumulation_amount_ratio: 8.7 / 18.0,
  }, // ~0.483
  {
    price: '94300',
    quantity: '0.5',
    quantity_total: '9.2',
    accumulation_amount_ratio: 9.2 / 18.0,
  }, // ~0.511
  {
    price: '94200',
    quantity: '0.4',
    quantity_total: '9.6',
    accumulation_amount_ratio: 9.6 / 18.0,
  }, // ~0.533
  {
    price: '94100',
    quantity: '0.4',
    quantity_total: '10.0',
    accumulation_amount_ratio: 10.0 / 18.0,
  }, // ~0.556
];

export const sellRowsWithRatio: OrderBookWithRatio[] = [
  {
    price: '95600',
    quantity: '0.1',
    quantity_total: '0.1',
    accumulation_amount_ratio: 0.1 / 18.0,
  }, // ~0.006
  {
    price: '95700',
    quantity: '0.2',
    quantity_total: '0.3',
    accumulation_amount_ratio: 0.3 / 18.0,
  }, // ~0.017
  {
    price: '95800',
    quantity: '0.3',
    quantity_total: '0.6',
    accumulation_amount_ratio: 0.6 / 18.0,
  }, // ~0.033
  {
    price: '95900',
    quantity: '0.4',
    quantity_total: '1.0',
    accumulation_amount_ratio: 1.0 / 18.0,
  }, // ~0.056
  {
    price: '96000',
    quantity: '0.5',
    quantity_total: '1.5',
    accumulation_amount_ratio: 1.5 / 18.0,
  }, // ~0.083
  {
    price: '96100',
    quantity: '0.6',
    quantity_total: '2.1',
    accumulation_amount_ratio: 2.1 / 18.0,
  }, // ~0.117
  {
    price: '96200',
    quantity: '0.8',
    quantity_total: '2.9',
    accumulation_amount_ratio: 2.9 / 18.0,
  }, // ~0.161
  {
    price: '96300',
    quantity: '0.7',
    quantity_total: '3.6',
    accumulation_amount_ratio: 3.6 / 18.0,
  }, // ~0.2
  {
    price: '96400',
    quantity: '0.9',
    quantity_total: '4.5',
    accumulation_amount_ratio: 4.5 / 18.0,
  }, // ~0.25
  {
    price: '96500',
    quantity: '0.8',
    quantity_total: '5.3',
    accumulation_amount_ratio: 5.3 / 18.0,
  }, // ~0.294
  {
    price: '96600',
    quantity: '0.7',
    quantity_total: '6.0',
    accumulation_amount_ratio: 6.0 / 18.0,
  }, // ~0.333
  {
    price: '96700',
    quantity: '0.6',
    quantity_total: '6.6',
    accumulation_amount_ratio: 6.6 / 18.0,
  }, // ~0.367
  {
    price: '96800',
    quantity: '0.7',
    quantity_total: '7.3',
    accumulation_amount_ratio: 7.3 / 18.0,
  }, // ~0.406
  {
    price: '96900',
    quantity: '0.4',
    quantity_total: '7.7',
    accumulation_amount_ratio: 7.7 / 18.0,
  }, // ~0.428
  {
    price: '97000',
    quantity: '0.3',
    quantity_total: '8.0',
    accumulation_amount_ratio: 8.0 / 18.0,
  }, // ~0.444
];
