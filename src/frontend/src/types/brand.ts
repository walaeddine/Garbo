import type { MetaData } from '@/lib/api-utils';

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

export interface BrandsResponse {
    brands: Brand[];
    metaData: MetaData | null;
}
