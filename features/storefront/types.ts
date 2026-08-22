export interface StorefrontProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  inventoryCount: number;
  imageUrl?: string;
  category: string;
}

export interface CartItem {
  product: StorefrontProduct;
  quantity: number;
}