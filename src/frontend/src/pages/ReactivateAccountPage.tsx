import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import apiClient from "@/lib/apiClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ReactivateAccountPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const email = searchParams.get("email")
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<"request" | "verify">("request")

    useEffect(() => {
        if (!email) {
            navigate("/login")
        }
    }, [email, navigate])

    const handleRequestCode = async () => {
        setLoading(true)
        try {
            await apiClient.post("/users/request-reactivation", { email })
            setStep("verify")
            toast.success("Reactivation code sent to your email.")
        } catch (error) {
            toast.error("Failed to request reactivation code.")
        } finally {
            setLoading(false)
        }
    }

    const handleReactivate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await apiClient.post("/users/reactivate-account", { email, code })
            toast.success("Account reactivated! Please log in.")
            navigate("/login")
        } catch (error) {
            toast.error("Invalid code or reactivation failed.")
        } finally {
            setLoading(false)
        }
    }

    if (!email) return null

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reactivate Account</CardTitle>
                    <CardDescription>
                        Your account is currently scheduled for deletion.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === "request" ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                To restore access to your account <strong>{email}</strong>, we need to verify your identity.
                                Click below to receive a verification code.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleReactivate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    placeholder="Enter 6-digit code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {step === "request" ? (
                        <>
                            <Button className="w-full" onClick={handleRequestCode} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reactivation Code
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => navigate("/login")}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button className="w-full" onClick={handleReactivate} disabled={loading || !code}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reactivate Account
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setStep("request")}>
                                Back
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
