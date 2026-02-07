import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const defaultEmail = location.state?.email || '';

    const [email, setEmail] = useState(defaultEmail);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/authentication/reset-password', {
                email,
                code,
                newPassword,
                confirmNewPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.Message || err.response?.data?.message || 'Failed to reset password. Check the code and try again.';
            if (err.response?.data?.ModelState) {
                // Handle model state errors if useful, or just show generic
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px] filter animate-pulse" />
                </div>
                <Card className="relative z-10 w-full max-w-md border-0 bg-background/60 shadow-none backdrop-blur-xl sm:border sm:shadow-lg sm:bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center text-green-500">Password Reset Successful!</CardTitle>
                        <CardDescription className="text-center">
                            Your password has been securely updated. Redirecting to login...
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-6">
                        <Button onClick={() => navigate('/login')} className="w-full">
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px] filter animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-secondary/20 blur-[120px] filter animate-pulse delay-1000" />
            </div>

            <Card className="relative z-10 w-full max-w-md border-0 bg-background/60 shadow-none backdrop-blur-xl sm:border sm:shadow-lg sm:bg-card/50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter the 6-digit code sent to your email and your new password.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                readOnly={!!defaultEmail}
                                className={defaultEmail ? "bg-muted text-muted-foreground" : "bg-background/50 border-input/50"}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                className="bg-background/50 border-input/50 focus:bg-background transition-colors tracking-widest text-center text-lg font-mono"
                                maxLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="pr-10 bg-background/50 border-input/50 focus:bg-background transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                            <Input
                                id="confirmNewPassword"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                className="bg-background/50 border-input/50 focus:bg-background transition-colors"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full shadow-lg hover:shadow-primary/25 transition-all duration-300" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                        <div className="text-center">
                            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
