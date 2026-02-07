import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { refreshUser, user, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            navigate('/');
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.post('/authentication/login', { email, password });
            localStorage.setItem('isAuthenticated', 'true');
            await refreshUser();
            navigate('/');
        } catch (err: any) {
            if (err.response?.status === 403 && err.response?.data?.isSoftDeleted) {
                // Determine if we show a dialog or just redirect. Let's redirect for simplicity or show a specific error with link.
                // Or better: Show a dedicated UI on login page?
                // Let's use a browser confirm for MVP or just redirect.
                // "Your account is scheduled for deletion. Reactivate?"
                const shouldReactivate = window.confirm("Your account is scheduled for deletion. Do you want to reactivate it?");
                if (shouldReactivate) {
                    navigate(`/reactivate-account?email=${email}`);
                    return;
                }
            }

            const errorMsg = err.response?.data?.Message || err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px] filter animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-secondary/20 blur-[120px] filter animate-pulse delay-1000" />
            </div>

            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="mr-2 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="font-bold text-primary-foreground">G</span>
                    </div>
                    Garbo
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Administering users has never been this seamless. Garbo provides top-tier management tools with a beautiful interface.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis, Product Manager</footer>
                    </blockquote>
                </div>
            </div>

            <div className="relative z-10 flex h-full w-full items-center justify-center p-8 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to sign in to your account
                        </p>
                    </div>

                    <Card className="border-0 bg-background/60 shadow-none backdrop-blur-xl sm:border sm:shadow-lg sm:bg-card/50">
                        <form onSubmit={handleSubmit}>
                            <CardContent className="pt-6 pb-6 space-y-4">
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
                                        placeholder="name@example.com"
                                        required
                                        className="bg-background/50 border-input/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pr-10 bg-background/50 border-input/50 focus:bg-background transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4 pb-6">
                                <Button className="w-full shadow-lg hover:shadow-primary/25 transition-all duration-300" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : 'Sign in'}
                                </Button>
                                <div className="text-sm text-center text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-primary hover:text-primary/80 hover:underline underline-offset-4 font-medium transition-colors">
                                        Sign up
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
