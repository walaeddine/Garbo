import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Users, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import { useBrands } from "@/hooks/brands/useBrands";
import { useCategories } from "@/hooks/categories/useCategories";
import { useUsersCount } from "@/hooks/useUsersCount";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
    const { data: brandsData, isLoading: brandsLoading } = useBrands({ pageSize: 1 });
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ pageSize: 1 });
    const { data: usersCount, isLoading: usersLoading } = useUsersCount();

    const totalBrands = brandsData?.metaData?.totalCount ?? 0;
    const totalCategories = categoriesData?.metaData?.totalCount ?? 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your system entities and configurations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20 transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        {brandsLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{totalBrands}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Directly from database</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <Tags className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {categoriesLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{totalCategories}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Product categories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {usersLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{usersCount}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                    </CardContent>
                </Card>
                {/* Add more stats as needed */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-primary" /> Brand Management
                        </CardTitle>
                        <CardDescription>Create, update, and delete product brands.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-sm">Manage Inventory</p>
                                <p className="text-xs text-muted-foreground font-medium">Update brand details and logos.</p>
                            </div>
                            <Button asChild size="sm">
                                <Link to="/admin/brands">Open Manager</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tags className="h-5 w-5 text-primary" /> Category Management
                        </CardTitle>
                        <CardDescription>Manage product categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-sm">Organize Products</p>
                                <p className="text-xs text-muted-foreground font-medium">Create and edit categories.</p>
                            </div>
                            <Button asChild size="sm">
                                <Link to="/admin/categories">Open Manager</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> User Management
                        </CardTitle>
                        <CardDescription>Manage user roles and permissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-sm">User Directory</p>
                                <p className="text-xs text-muted-foreground font-medium">View and edit user profiles.</p>
                            </div>
                            <Button asChild size="sm">
                                <Link to="/admin/users">Open Directory</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
