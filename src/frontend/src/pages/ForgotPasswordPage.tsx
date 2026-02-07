import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.post('/authentication/forgot-password', { email });
            setSuccess(true);
            // Auto redirect after a few seconds
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (err: any) {
            console.error(err);
            // Fake success to prevent enumeration
            setSuccess(true);
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
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
                    <CardContent className="pt-8 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold">Code Sent!</h2>
                        <p className="text-muted-foreground">Check your email for the verification code.</p>
                        <p className="text-sm text-muted-foreground">Redirecting...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            {/* Abstract Background Elements matching Login */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px] filter animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-secondary/20 blur-[120px] filter animate-pulse delay-1000" />
            </div>

            <Card className="relative z-10 w-full max-w-md border-0 bg-background/60 shadow-none backdrop-blur-xl sm:border sm:shadow-lg sm:bg-card/50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Forgot password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we will send you a verification code
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
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                    Sending code...
                                </>
                            ) : (
                                'Send Code'
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
