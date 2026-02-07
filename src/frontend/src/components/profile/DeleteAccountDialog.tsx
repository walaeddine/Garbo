import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function DeleteAccountDialog() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            await apiClient.delete('/users')
            toast.info("Account scheduled for deletion.")
            logout()
            navigate('/login')
        } catch (error) {
            toast.error("Failed to delete account.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-sm text-muted-foreground">
                            This action will schedule your account for deletion.
                            <br /><br />
                            <strong>What happens next:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Your data will remain recoverable for <strong>30 days</strong>.</li>
                                <li>After 30 days, your personal data will be anonymized.</li>
                                <li>Historical records (e.g. invoices) may be retained for legal compliance.</li>
                            </ul>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading}>
                        {loading ? "Deleting..." : "Yes, Delete My Account"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
