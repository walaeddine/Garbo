import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export interface HealthReport {
    status: string
    entries: {
        [key: string]: {
            status: string
            description?: string
            data?: {
                [key: string]: any
            }
        }
    }
}

export function useHealth() {
    return useQuery({
        queryKey: ["health"],
        queryFn: async () => {
            const response = await apiClient.get<HealthReport>("/health")
            return response.data
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}
