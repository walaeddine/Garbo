import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import type { User } from "@/types/auth"
import { extractPagination } from "@/lib/api-utils"

interface UserParameters {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
}

export function useUsers(params: UserParameters = {}) {
    return useQuery({
        queryKey: ["users", params],
        queryFn: async () => {
            const response = await apiClient.get<User[]>("/users", {
                params,
            })

            const metaData = extractPagination(response)

            return {
                users: response.data,
                metaData
            }
        },
    })
}
