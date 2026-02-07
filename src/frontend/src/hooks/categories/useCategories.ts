import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { CategoriesResponse, CategoryParameters } from '@/types/category';
import { extractPagination } from '@/lib/api-utils';

export const useCategories = (params: CategoryParameters = {}) => {
    return useQuery<CategoriesResponse>({
        queryKey: ['categories', params],
        queryFn: async () => {
            const response = await apiClient.get('/categories', { params });
            const metaData = extractPagination(response);

            return {
                categories: response.data,
                metaData: metaData
            };
        },
        staleTime: 0,
    });
};
