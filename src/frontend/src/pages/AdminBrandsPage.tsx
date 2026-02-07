import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Edit2, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { BrandDialog } from "@/features/brands/components/brand-dialog";
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

import { AdminDataTable } from "@/components/admin/AdminDataTable";

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

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
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

    const handleDelete = async () => {
        if (!selectedBrand) return;
        await deleteBrandMutation.mutateAsync(selectedBrand.slug);
        toast.success(`Brand "${selectedBrand.name}" deleted successfully.`);
        setIsDeleteDialogOpen(false);
        fetchBrands();
    };

    const columns = [
        {
            header: "Logo",
            className: "w-[80px]",
            render: (brand: any) => (
                <div className="w-10 h-10 rounded-md border bg-background flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                    {brand.logoUrl ? (
                        <img src={`http://localhost:5000${brand.logoUrl}`} alt={brand.name} className="object-contain w-full h-full" />
                    ) : (
                        <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                    )}
                </div>
            )
        },
        {
            header: "Name",
            sortKey: "name",
            render: (brand: any) => <span className="font-semibold">{brand.name}</span>
        },
        {
            header: "Status",
            render: () => (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                    Active
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            render: (brand: any) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted" onClick={() => { setSelectedBrand(brand); setIsBrandDialogOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { setSelectedBrand(brand); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Brands</h1>
                    <p className="text-muted-foreground font-medium">Manage the product catalog brands.</p>
                </div>
                <Button className="gap-2" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4" /> Add Brand
                </Button>
            </div>

            <AdminDataTable
                data={brands}
                isLoading={isFetching}
                pagination={pagination}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search brands..."
                columns={columns}
                onPageChange={setPageNumber}
                onSort={handleSort}
                getSortIcon={getSortIcon}
            />

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
