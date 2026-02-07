import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Users, Tags, Activity, Database, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBrandsCount } from "@/hooks/brands/useBrandsCount";
import { useCategoriesCount } from "@/hooks/categories/useCategoriesCount";
import { useUsersCount } from "@/hooks/users/useUsersCount";
import { useHealth } from "@/hooks/useHealth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AdminPage() {
    const { data: totalBrands, isLoading: brandsLoading } = useBrandsCount();
    const { data: totalCategories, isLoading: categoriesLoading } = useCategoriesCount();
    const { data: usersCount, isLoading: usersLoading } = useUsersCount();
    const { data: healthData, isLoading: healthLoading } = useHealth();

    const StatCard = ({ title, value, loading, icon: Icon, description, colorClass }: any) => (
        <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={cn("p-2 rounded-lg transition-colors bg-muted/50 group-hover:bg-primary/10", colorClass)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className="text-3xl font-bold tracking-tight">{value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
            </CardContent>
        </Card>
    );

    const HealthBadge = ({ component, status }: { component: string, status: string }) => {
        const isHealthy = status === "Healthy";
        return (
            <div className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50">
                <div className="flex items-center gap-2">
                    {component === "Database" ? <Database className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                    <span className="text-xs font-semibold">{component}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isHealthy ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("text-[10px] font-bold uppercase", isHealthy ? "text-green-500" : "text-red-500")}>
                        {status}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-lg font-medium">Control center for your system's entities and health status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Brands"
                    value={totalBrands}
                    loading={brandsLoading}
                    icon={ShoppingBag}
                    description="Catalog supply chain"
                    colorClass="text-blue-500"
                />
                <StatCard
                    title="Total Categories"
                    value={totalCategories}
                    loading={categoriesLoading}
                    icon={Tags}
                    description="Organized navigation"
                    colorClass="text-purple-500"
                />
                <StatCard
                    title="Total Users"
                    value={usersCount}
                    loading={usersLoading}
                    icon={Users}
                    description="Community growth"
                    colorClass="text-orange-500"
                />
                <Card className="border-primary/20 bg-primary/5 shadow-inner">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold">System Status</CardTitle>
                        <Activity className={cn("h-4 w-4", healthData?.status === "Healthy" ? "text-green-500" : "text-red-500")} />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {healthLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <>
                                <HealthBadge component="Database" status={healthData?.entries?.Database?.status || "Unknown"} />
                                <HealthBadge component="SMTP" status={healthData?.entries?.SMTP?.status || "Unknown"} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Brand Management", desc: "Update logos and inventory settings.", icon: ShoppingBag, link: "/admin/brands", color: "blue" },
                    { title: "Category Management", desc: "Organize taxonomy and groupings.", icon: Tags, link: "/admin/categories", color: "purple" },
                    { title: "User Directory", desc: "Moderation and role assignments.", icon: Users, link: "/admin/users", color: "orange" },
                ].map((item) => (
                    <Card key={item.title} className="flex flex-col h-full bg-gradient-to-b from-card to-muted/20 hover:border-primary/40 transition-all group shadow-sm">
                        <CardHeader>
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                item.color === "blue" ? "bg-blue-500/10 text-blue-500" :
                                    item.color === "purple" ? "bg-purple-500/10 text-purple-500" :
                                        "bg-orange-500/10 text-orange-500")}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription className="min-h-[40px]">{item.desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-0">
                            <Button asChild className="w-full group/btn" variant="secondary">
                                <Link to={item.link} className="flex items-center justify-center gap-2">
                                    Open Manager
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
