import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface UpdateProfileData {
    firstName: string
    lastName: string
}

export function useUpdateProfile() {
    const { refreshUser } = useAuth()

    return useMutation({
        mutationFn: async (data: UpdateProfileData) => {
            await apiClient.put("/users", data)
        },
        onSuccess: async () => {
            await refreshUser()
            toast.success("Profile updated successfully")
        },
        onError: (error: any) => {
            // Check for ModelState errors
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                // Just snag the first one or join them
                const firstErrorKey = Object.keys(errors)[0];
                const firstErrorMessage = errors[firstErrorKey]?.[0];
                toast.error(firstErrorMessage || "Failed to update profile");
            } else {
                toast.error(error.response?.data?.message || "Failed to update profile");
            }
        }
    })
}
