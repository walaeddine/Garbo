import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export function useCategoriesCount() {
    return useQuery({
        queryKey: ["categories", "count"],
        queryFn: async () => {
            const response = await apiClient.get<number>("/categories/count")
            return response.data
        },
    })
}
