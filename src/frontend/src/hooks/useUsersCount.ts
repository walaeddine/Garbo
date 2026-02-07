import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export function useUsersCount() {
    return useQuery({
        queryKey: ["users", "count"],
        queryFn: async () => {
            const response = await apiClient.get<number>("/authentication/count")
            return response.data
        },
    })
}
