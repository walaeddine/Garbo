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

export interface MetaData {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface CategoriesResponse {
    categories: Category[];
    metaData: MetaData;
}
