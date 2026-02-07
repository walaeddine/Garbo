import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, Plus, Edit2, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { BrandDialog } from "@/features/brands/components/brand-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBrands } from "@/hooks/brands/useBrands";
import { useDeleteBrand } from "@/hooks/brands/useDeleteBrand";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/components/ui/toaster";

export default function AdminBrandsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL or defaults
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "name");
    const [pageNumber, setPageNumber] = useState(Number(searchParams.get("page")) || 1);

    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    // Sync state with URL whenever it changes
    useEffect(() => {
        const params: any = { page: pageNumber.toString() };
        if (searchTerm) params.search = searchTerm;
        if (orderBy !== "name") params.orderBy = orderBy;

        setSearchParams(params, { replace: true });
    }, [pageNumber, searchTerm, orderBy, setSearchParams]);

    // React Query Hooks
    const { data, isLoading, refetch: fetchBrands, isPlaceholderData } = useBrands({
        searchTerm: debouncedSearchTerm,
        orderBy,
        pageNumber,
        pageSize: 10
    });

    const isFetching = isLoading || isPlaceholderData;

    const deleteBrandMutation = useDeleteBrand();

    // Dialog states
    const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<any | null>(null);

    const brands = data?.brands || [];
    const pagination = data?.metaData;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1);
    };

    const handleSort = (column: string) => {
        setOrderBy(prev => {
            if (prev === column) return `${column} desc`;
            if (prev === `${column} desc`) return column;
            return column;
        });
        setPageNumber(1);
    };

    const getSortIcon = (column: string) => {
        if (orderBy === column) return <ArrowUp className="h-4 w-4" />;
        if (orderBy === `${column} desc`) return <ArrowDown className="h-4 w-4" />;
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground/30" />;
    };

    const openCreateDialog = () => {
        setSelectedBrand(null);
        setIsBrandDialogOpen(true);
    };

    const openEditDialog = (brand: any) => {
        setSelectedBrand(brand);
        setIsBrandDialogOpen(true);
    };

    const openDeleteDialog = (brand: any) => {
        setSelectedBrand(brand);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedBrand) return;
        await deleteBrandMutation.mutateAsync(selectedBrand.slug);
        toast.success(`Brand "${selectedBrand.name}" deleted successfully.`);
        setIsDeleteDialogOpen(false);
        fetchBrands();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Brands</h1>
                        <p className="text-muted-foreground font-medium">Manage the product catalog brands.</p>
                    </div>
                </div>
                <Button className="gap-2" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4" /> Add Brand
                </Button>
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-sm:max-w-xs max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search brands..."
                                className="pl-8 bg-background"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        {pagination && (
                            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                                Showing <span className="text-foreground">{brands.length}</span> of {pagination.totalCount} results
                            </p>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[80px]">Logo</th>
                                    <th
                                        className="h-10 px-4 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center gap-1 justify-between">
                                            <span>Name</span>
                                            <div className="flex items-center bg-muted/50 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {getSortIcon("name")}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {isFetching ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-in fade-in duration-500">
                                            <td className="p-4"><Skeleton className="h-10 w-10 rounded-md" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-40" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                                            <td className="p-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        {brands.length > 0 ? (
                                            brands.map((brand) => (
                                                <tr key={brand.id} className="hover:bg-muted/10 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="w-10 h-10 rounded-md border bg-background flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                                                            {brand.logoUrl ? (
                                                                <img src={`http://localhost:5000${brand.logoUrl}`} alt={brand.name} className="object-contain w-full h-full" />
                                                            ) : (
                                                                <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-semibold">{brand.name}</td>
                                                    <td className="p-4">
                                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted" onClick={() => openEditDialog(brand)}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog(brand)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/40 mb-2">
                                                            <ShoppingBag className="h-8 w-8" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold tracking-tight">No brands found</h3>
                                                        <p className="text-sm text-muted-foreground max-w-[250px]">
                                                            We couldn't find any brands matching your search.
                                                        </p>
                                                        {searchTerm && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSearchTerm("")}
                                                                className="mt-2"
                                                            >
                                                                Clear search
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {pagination && (
                    <Pagination
                        metaData={pagination}
                        onPageChange={setPageNumber}
                        disabled={isFetching}
                    />
                )}
            </Card>

            <BrandDialog
                open={isBrandDialogOpen}
                onOpenChange={setIsBrandDialogOpen}
                brand={selectedBrand}
                onSuccess={fetchBrands}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the brand
                            <span className="font-bold text-foreground mx-1">"{selectedBrand?.name}"</span>
                            and any associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteBrandMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteBrandMutation.isPending}
                        >
                            {deleteBrandMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete Brand
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
