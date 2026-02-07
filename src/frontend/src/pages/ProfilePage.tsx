import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm"
import { UpdateProfileForm } from "@/components/profile/UpdateProfileForm"
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog"

export default function ProfilePage() {
    const { user } = useAuth()

    if (!user) return null

    const displayName = user.displayName || 'User'
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    const roles = user.roles || []

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left space-y-1">
                    <h1 className="text-3xl font-bold">{displayName}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        {roles.map((role: string) => (
                            <Badge key={role} variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 border-transparent capitalize">
                                {role}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="account">Account Details</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6 mt-6">
                    <UpdateProfileForm />
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-6">
                    <ChangePasswordForm />

                    <Card>
                        <CardHeader>
                            <CardTitle>Session Management</CardTitle>
                            <CardDescription>
                                Manage your active sessions and security preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <p className="font-semibold text-primary">Current Authorization</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    You are authenticated as <span className="font-medium text-foreground">{roles.join(", ")}</span>.
                                    Your session is secured with JWT tokens.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions for your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                <div className="space-y-1">
                                    <p className="font-medium text-destructive">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your account will be SCHEDULED for deletion. You have 30 days to reactivate it.
                                    </p>
                                </div>
                                <DeleteAccountDialog />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

