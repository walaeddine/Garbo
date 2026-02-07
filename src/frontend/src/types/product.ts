export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    brandId: string;
    categoryId: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductForCreation {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    brandId: string;
    categoryId: string;
    stock: number;
}

export interface ProductForUpdate {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    brandId: string;
    categoryId: string;
    stock: number;
}

export interface ProductParameters {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    orderBy?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface ProductsResponse {
    products: Product[];
    metaData: {
        currentPage: number;
        totalPages: number;
        pageSize: number;
        totalCount: number;
        hasPrevious: boolean;
        hasNext: boolean;
    };
}
