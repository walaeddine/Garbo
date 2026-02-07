import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { BrandsResponse, BrandParameters } from '@/types/brand';

export const useBrands = (params: BrandParameters = {}) => {
    return useQuery<BrandsResponse>({
        queryKey: ['brands', params],
        queryFn: async () => {
            const response = await apiClient.get('/brands', { params });
            // The backend returns the list of brands and metadata via headers (X-Pagination) 
            // but for simplicity here we assume the response body matches BrandsResponse
            // Let's check the API controller to be sure.

            // Correction: If the API returns headers for pagination, we extract them here.
            const paginationHeader = response.headers['x-pagination'];
            const metaData = paginationHeader ? JSON.parse(paginationHeader) : null;

            return {
                brands: response.data,
                metaData: metaData
            };
        },
        staleTime: 0,
    });
};
