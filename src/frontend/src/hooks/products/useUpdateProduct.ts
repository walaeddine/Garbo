import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { ProductForUpdate } from '@/types/product';

interface UpdateProductParams {
    id: string;
    product: ProductForUpdate;
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, product }: UpdateProductParams) => {
            const response = await apiClient.put(`/products/${id}`, product);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
        },
    });
};
