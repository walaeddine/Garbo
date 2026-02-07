import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useUpdateProfile } from "@/hooks/useUpdateProfile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User as UserIcon, Mail, KeyRound } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"

export function UpdateProfileForm() {
    const { user, refreshUser } = useAuth()
    const { mutate: updateProfile, isPending } = useUpdateProfile()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: ""
    })

    // Email Change Verification State
    const [emailChangePending, setEmailChangePending] = useState(false)
    const [pendingEmail, setPendingEmail] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)

    useEffect(() => {
        if (user && !emailChangePending) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || ""
            })
        }
    }, [user, emailChangePending])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Check if email changed
        const emailChanged = formData.email !== user?.email;

        updateProfile(formData, {
            onSuccess: () => {
                if (emailChanged) {
                    setPendingEmail(formData.email);
                    setEmailChangePending(true);
                    toast.info("Verification code sent to your NEW email.");
                } else {
                    setIsEditing(false)
                }
            }
        })
    }

    const handleVerifyEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            await apiClient.post('/users/confirm-email-change', { code: verificationCode });
            toast.success("Email updated successfully!"); // Removed "Please log in again"
            setEmailChangePending(false);
            setIsEditing(false);
            setVerificationCode("");

            // STAY LOGGED IN: Refresh global user context with new email
            await refreshUser();

        } catch (error: any) {
            // Error handled by interceptor ideally, or show toast
            toast.error("Invalid code or request failed.");
        } finally {
            setIsVerifying(false);
        }
    }

    if (!user) return null

    const [resendCooldown, setResendCooldown] = useState(0);
    const [resentSuccess, setResentSuccess] = useState(false);

    useEffect(() => {
        if (emailChangePending) {
            setResendCooldown(30); // Start with 30s cooldown on initial show
        }
    }, [emailChangePending]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        if (resentSuccess) {
            const timer = setTimeout(() => setResentSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [resentSuccess]);

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        try {
            await apiClient.post('/users/resend-email-change-code');
            toast.success("Verification code resent.");
            setResentSuccess(true);
            setResendCooldown(60);
        } catch (error) {
            toast.error("Failed to resend code.");
        }
    };

    if (emailChangePending) {
        return (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardHeader>
                    <CardTitle className="text-yellow-600">Verify New Email</CardTitle>
                    <CardDescription>
                        We sent a 6-digit code to <strong>{pendingEmail}</strong>. Please enter it below to confirm the change.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Verification Code</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="123456"
                                    className="pl-9 font-mono tracking-widest"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className={`px-0 ${resentSuccess ? "text-green-600 font-bold" : "text-muted-foreground"}`}
                                onClick={handleResendCode}
                                disabled={resendCooldown > 0}
                            >
                                {resentSuccess ? "Resent!" : (resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code")}
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="ghost" type="button" onClick={() => setEmailChangePending(false)}>Cancel</Button>
                                <Button type="submit" disabled={isVerifying || verificationCode.length < 6}>
                                    {isVerifying ? "Verifying..." : "Confirm Change"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col space-y-1.5">
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your personal information.
                    </CardDescription>
                </div>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </Button>
                )}
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                                    className="pl-9"
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                                    className="pl-9"
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                disabled={!isEditing}
                                className={`pl-9 ${!isEditing ? "bg-muted" : ""}`}
                            />
                        </div>
                        {isEditing && formData.email !== user.email && (
                            <Alert className="py-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                <AlertTitle className="text-xs font-semibold">Verification Required</AlertTitle>
                                <AlertDescription className="text-xs">
                                    Changing email requires verification. A code will be sent to the new address.
                                </AlertDescription>
                            </Alert>
                        )}
                        {!isEditing && (
                            <p className="text-[0.8rem] text-muted-foreground">
                                Click "Edit Profile" to change your details.
                            </p>
                        )}
                    </div>
                </CardContent>
                {isEditing && (
                    <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                )}
            </form>
        </Card>
    )
}
