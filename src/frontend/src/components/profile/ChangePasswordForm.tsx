import { useState } from "react"
import { useChangePassword } from "@/hooks/users/useChangePassword"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

export function ChangePasswordForm() {
    const { mutate: changePassword, isPending } = useChangePassword()
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        changePassword(formData, {
            onSuccess: () => {
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: ""
                })
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    Ensure your account is secure by using a strong password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="current-password"
                                type="password"
                                placeholder="Enter current password"
                                className="pl-9"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="Enter new password"
                                className="pl-9"
                                value={formData.newPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm new password"
                                className="pl-9"
                                value={formData.confirmNewPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Changing Password..." : "Change Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
