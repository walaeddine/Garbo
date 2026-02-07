import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { BrandForUpdate } from '@/types/brand';

interface UpdateBrandParams {
    slug: string;
    brand: BrandForUpdate;
}

export const useUpdateBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ slug, brand }: UpdateBrandParams) => {
            const response = await apiClient.put(`/brands/${slug}`, brand);
            return response.data;
        },
        onSuccess: (_, { slug }) => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            queryClient.invalidateQueries({ queryKey: ['brand', slug] });
        },
    });
};
