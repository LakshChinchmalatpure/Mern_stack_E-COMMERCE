export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  password?: string; // used temporarily in memory or returned selectively
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product; // Populated client-side
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'paid' | 'unpaid';
  createdAt: string;
}

export interface RecommendationResponse {
  recommendations: {
    productId: string;
    reason: string;
  }[];
}
