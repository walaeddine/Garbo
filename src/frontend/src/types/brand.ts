export interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BrandForCreation {
    name: string;
    description?: string;
    logoUrl?: string;
}

export interface BrandForUpdate {
    name: string;
    description?: string;
    logoUrl?: string;
}

export interface BrandParameters {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    orderBy?: string;
}

export interface MetaData {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface BrandsResponse {
    brands: Brand[];
    metaData: MetaData;
}
