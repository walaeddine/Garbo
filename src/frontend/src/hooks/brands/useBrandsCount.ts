import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export function useBrandsCount() {
    return useQuery({
        queryKey: ["brands", "count"],
        queryFn: async () => {
            const response = await apiClient.get<number>("/brands/count")
            return response.data
        },
    })
}
