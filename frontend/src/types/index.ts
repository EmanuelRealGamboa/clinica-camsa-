// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  roles: string[];
  is_staff: boolean;
  is_superuser: boolean;
}

// Order Types
export interface Order {
  id: number;
  assignment?: number;
  device_uid?: string;
  room?: number;
  room_code?: string;
  patient?: number;
  patient_name?: string;
  status: OrderStatus;
  status_display: string;
  placed_at: string;
  delivered_at?: string;
  cancelled_at?: string;
  items: OrderItem[];
  status_events?: OrderStatusEvent[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_category: string;
  quantity: number;
  unit_label: string;
  created_at: string;
}

export interface OrderStatusEvent {
  id: number;
  from_status: string;
  to_status: string;
  changed_by?: number;
  changed_by_email?: string;
  changed_at: string;
  note: string;
}

export interface CreateOrderRequest {
  device_uid: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export interface OrderStatusChangeRequest {
  to_status: OrderStatus;
  note?: string;
}

// Product Tag Types
export interface ProductTag {
  id: number;
  name: string;
  color: string;
  icon?: string;
  sort_order: number;
}

// Product Benefit Types
export interface ProductBenefit {
  icon: string;
  text: string;
}

// Product Types
export type CategoryType = 'DRINK' | 'SNACK' | 'FOOD' | 'OTHER';

export interface Product {
  id: number;
  category: number;
  category_name: string;
  category_type?: CategoryType;
  name: string;
  description: string;
  image_url?: string;
  image_url_full?: string;
  unit_label: string;
  price?: number | null; // Price for FOOD category items (null for free items)
  is_active: boolean;
  available?: number | null; // Available inventory quantity (null means unlimited)
  is_available?: boolean; // Whether product is available for ordering
  rating?: number; // 0-5 stars
  rating_count?: number;
  tags?: ProductTag[];
  benefits?: ProductBenefit[];
  is_featured?: boolean;
  featured_title?: string;
  featured_description?: string;
  product_sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  category_type?: CategoryType;
  sort_order: number;
  show_in_carousel?: boolean;
  carousel_order?: number;
  product_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Feedback Types
export interface Feedback {
  id: number;
  order: number;
  order_id: number;
  room: number;
  room_code: string;
  patient?: number;
  patient_name?: string;
  order_rating: number;
  stay_rating: number;
  comment?: string;
  created_at: string;
}

export interface CreateFeedbackRequest {
  device_uid: string;
  order_rating: number;
  stay_rating: number;
  comment?: string;
}

// WebSocket Types
export interface WSMessage {
  type: string;
  [key: string]: any;
}

export interface NewOrderMessage extends WSMessage {
  type: 'new_order';
  order_id: number;
  room_code?: string;
  device_uid?: string;
  placed_at: string;
}

export interface OrderStatusChangedMessage extends WSMessage {
  type: 'order_status_changed';
  order_id: number;
  status: OrderStatus;
  from_status: OrderStatus;
  changed_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
