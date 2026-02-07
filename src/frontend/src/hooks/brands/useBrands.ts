import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { BrandsResponse, BrandParameters } from '@/types/brand';
import { extractPagination } from '@/lib/api-utils';

export const useBrands = (params: BrandParameters = {}) => {
    return useQuery<BrandsResponse>({
        queryKey: ['brands', params],
        queryFn: async () => {
            const response = await apiClient.get('/brands', { params });
            const metaData = extractPagination(response);

            return {
                brands: response.data,
                metaData: metaData
            };
        },
        staleTime: 0,
    });
};
