import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { ProductsResponse, ProductParameters } from '@/types/product';

export const useProducts = (params: ProductParameters = {}) => {
    return useQuery<ProductsResponse>({
        queryKey: ['products', params],
        queryFn: async () => {
            const response = await apiClient.get('/products', { params });
            const paginationHeader = response.headers['x-pagination'];
            const metaData = paginationHeader ? JSON.parse(paginationHeader) : null;

            return {
                products: response.data,
                metaData: metaData
            };
        },
    });
};
