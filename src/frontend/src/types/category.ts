import type {   MetaData } from '@/lib/api-utils';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    pictureUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryForCreation {
    name: string;
    description?: string;
    pictureUrl?: string;
}

export interface CategoryForUpdate {
    name: string;
    description?: string;
    pictureUrl?: string;
}

export interface CategoryParameters {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    orderBy?: string;
}

export interface CategoriesResponse {
    categories: Category[];
    metaData: MetaData | null;
}
