import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import type { User } from "@/types/auth"

interface UserParameters {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
}

export function useUsers(params: UserParameters = {}) {
    return useQuery({
        queryKey: ["users", params],
        queryFn: async () => {
            const response = await apiClient.get<User[]>("/authentication/users", {
                params,
            })

            const pagination = response.headers["x-pagination"]
            const metaData = pagination ? JSON.parse(pagination) : null

            return {
                users: response.data,
                metaData
            }
        },
    })
}
