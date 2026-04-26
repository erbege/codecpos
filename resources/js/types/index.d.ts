export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    outlet_id?: number;
    outlet?: Outlet;
    roles?: { id: number; name: string; guard_name: string }[];
    permissions?: { id: number; name: string; guard_name: string }[];
}

export interface Outlet {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    products_count?: number;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    name: string;
    sku: string;
    barcode?: string;
    price?: number;
    stock: number;
    image?: string;
}

export interface Product {
    id: number;
    category_id: number;
    category?: Category;
    name: string;
    sku: string;
    barcode?: string;
    price: number;
    cost_price: number;
    stock: number;
    min_stock: number;
    image?: string;
    is_active: boolean;
    has_variants: boolean;
    variants?: ProductVariant[];
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    sales_count?: number;
    created_at: string;
    updated_at: string;
}

export interface SaleItem {
    id: number;
    sale_id: number;
    product_id: number;
    product_variant_id?: number | null;
    product?: Product;
    product_name: string;
    qty: number;
    price: number;
    discount: number;
    promo_discount: number;
    promotion_id?: number | null;
    subtotal: number;
}

export interface Sale {
    id: number;
    invoice_number: string;
    user_id: number;
    user?: User;
    outlet_id?: number;
    outlet?: Outlet;
    customer_id?: number;
    customer?: Customer;
    subtotal: number;
    tax: number;
    discount: number;
    promo_discount: number;
    promo_name?: string | null;
    promotion_id?: number | null;
    total: number;
    paid: number;
    change: number;
    payment_method: 'cash' | 'transfer' | 'qris' | 'debit';
    status: 'completed' | 'voided' | 'refunded';
    notes?: string;
    items?: SaleItem[];
    created_at: string;
    updated_at: string;
}

export interface CartItem {
    product: Product;
    qty: number;
    discount: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

export interface DashboardStats {
    todaySalesCount: number;
    todaySalesTotal: number;
    totalProducts: number;
    lowStockProducts: number;
}

export interface WeeklySale {
    date: string;
    total: number;
    count: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        roles: string[];
        permissions: string[];
    };
    flash: {
        success?: string;
        error?: string;
        import_errors?: string[];
    };
    app_settings: {
        shop_name?: string;
        shop_address?: string;
        shop_phone?: string;
        shop_email?: string;
        shop_npwp?: string;
        shop_footer_notes?: string;
        enable_shift_management?: boolean;
    };
};
