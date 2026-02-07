import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);

        try {
            await apiClient.post('/authentication/register', formData);
            navigate('/verify-email', { state: { email: formData.email } });
        } catch (err: any) {
            setErrors(err.response?.data || { message: 'Registration failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -right-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px] filter animate-pulse" />
                <div className="absolute -bottom-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-secondary/20 blur-[120px] filter animate-pulse delay-1000" />
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
                            &ldquo;Join thousands of administrators who have streamlined their workflow with Garbo. Account management redefined.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>

            <div className="relative z-10 flex h-full w-full items-center justify-center p-8 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your details below to create your account
                        </p>
                    </div>

                    <Card className="border-0 bg-background/60 shadow-none backdrop-blur-xl sm:border sm:shadow-lg sm:bg-card/50">
                        <form onSubmit={handleSubmit}>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 pb-6">
                                {errors && typeof errors === 'string' && (
                                    <div className="col-span-full p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                                        {errors}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-background/50 border-input/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-background/50 border-input/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-background/50 border-input/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleInputChange}
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
                                {errors && typeof errors === 'object' && !Array.isArray(errors) && (
                                    <div className="col-span-full text-xs text-destructive space-y-1">
                                        {Object.entries(errors).map(([key, value]: [string, any]) => (
                                            <div key={key}>{Array.isArray(value) ? value[0] : value}</div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4 pb-6">
                                <Button className="w-full shadow-lg hover:shadow-primary/25 transition-all duration-300" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : 'Create account'}
                                </Button>
                                <div className="text-sm text-center text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-primary hover:text-primary/80 hover:underline underline-offset-4 font-medium transition-colors">
                                        Sign in
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
