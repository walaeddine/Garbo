import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { Brand } from '@/types/brand';

export const useBrand = (slug: string) => {
    return useQuery<Brand>({
        queryKey: ['brand', slug],
        queryFn: async () => {
            const response = await apiClient.get(`/brands/${slug}`);
            return response.data;
        },
        enabled: !!slug,
    });
};
