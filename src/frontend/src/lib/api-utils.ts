import type { AxiosResponse } from 'axios';

export interface MetaData {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

/**
 * Extracts pagination metadata from the 'X-Pagination' header of an Axios response.
 */
export function extractPagination(response: AxiosResponse): MetaData | null {
    const paginationHeader = response.headers['x-pagination'];
    if (!paginationHeader) return null;

    try {
        return JSON.parse(paginationHeader);
    } catch (error) {
        console.error('Failed to parse X-Pagination header:', error);
        return null;
    }
}
