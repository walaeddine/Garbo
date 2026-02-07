import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Rocket, Shield, Zap } from "lucide-react";

export default function HomePage() {
    return (
        <div className="space-y-12 py-8">
            <section className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    Welcome to <span className="text-primary">Garbo</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
                    The ultimate platform for managing your brand identity with speed, security, and elegance.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Button size="lg" asChild>
                        <Link to="/register">Get Started</Link>
                    </Button>
                    <Button size="lg" variant="outline">
                        Learn More
                    </Button>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <Zap className="h-10 w-10 text-primary mb-2" />
                        <CardTitle>Lightning Fast</CardTitle>
                        <CardDescription>Optimized for performance and responsiveness.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Garbo is built on the latest technologies to ensure your experience is always smooth and fast.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <Shield className="h-10 w-10 text-primary mb-2" />
                        <CardTitle>Secure by Default</CardTitle>
                        <CardDescription>Enterprise-grade security for your data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Your security is our priority. We use industry-standard encryption and RBAC.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <Rocket className="h-10 w-10 text-primary mb-2" />
                        <CardTitle>Scale with Ease</CardTitle>
                        <CardDescription>Designed to grow with your business.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Whether you're a startup or an enterprise, Garbo scales effortlessly with your needs.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
