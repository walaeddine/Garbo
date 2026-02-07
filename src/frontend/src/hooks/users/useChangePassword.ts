import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"
import type { ChangePasswordData } from "@/types/auth"

export function useChangePassword() {
    return useMutation({
        mutationFn: async (data: ChangePasswordData) => {
            await apiClient.post("/authentication/change-password", data)
        },
        onSuccess: () => {
            toast.success("Password changed successfully")
        },
        onError: (error: any) => {
            if (error.response?.data?.Errors) {
                // If the error object contains validation errors
                const errors = error.response.data.Errors;
                if (typeof errors === 'object') {
                    // Get all error messages joined
                    const errorMessages = Object.values(errors).flat().join('\n');
                    toast.error(errorMessages);
                    return;
                }
            }
            // Fallback error message
            toast.error(error.response?.data?.message || "Failed to change password")
        }
    })
}
