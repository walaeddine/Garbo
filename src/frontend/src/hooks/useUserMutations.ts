import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"

export function useUpdateUserRoles() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) => {
            await apiClient.post(`/authentication/${userId}/roles`, roles)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User roles updated successfully")
        },
        onError: () => {
            toast.error("Failed to update user roles")
        }
    })
}

export function useToggleUserLockout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, locked }: { userId: string; locked: boolean }) => {
            await apiClient.post(`/authentication/${userId}/lockout`, { locked })
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success(variables.locked ? "User account locked" : "User account unlocked")
        },
        onError: () => {
            toast.error("Failed to update user status")
        }
    })
}
