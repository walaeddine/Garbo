import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { CategoriesResponse, CategoryParameters } from '@/types/category';

export const useCategories = (params: CategoryParameters = {}) => {
    return useQuery<CategoriesResponse>({
        queryKey: ['categories', params],
        queryFn: async () => {
            const response = await apiClient.get('/categories', { params });
            const paginationHeader = response.headers['x-pagination'];
            const metaData = paginationHeader ? JSON.parse(paginationHeader) : null;

            return {
                categories: response.data,
                metaData: metaData
            };
        },
        staleTime: 0,
    });
};
