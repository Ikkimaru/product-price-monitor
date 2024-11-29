export interface PriceHistory {
  price: number;
  salePercentage: number;
  date: string;
}

export interface Product {
  id: string;
  baseId: number;
  title: string;
  url: string;
  image: string;
  store: string;
  price: number;
  salePercentage: number;
  priceHistory: PriceHistory[];
}
