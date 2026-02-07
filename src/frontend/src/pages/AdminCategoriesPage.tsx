import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tags, Search, Plus, Edit2, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, ImageIcon } from "lucide-react";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
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
import { useCategories } from "@/hooks/categories/useCategories";
import { useDeleteCategory } from "@/hooks/categories/useDeleteCategory";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/components/ui/toaster";
import type { Category } from "@/types/category";

export default function AdminCategoriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived state from URL
    const pageNumber = Number(searchParams.get("page")) || 1;
    const orderBy = searchParams.get("orderBy") || "name";

    // Local state for search input to handle debouncing
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    // Update URL when search term changes (debounced)
    useEffect(() => {
        const params: any = { page: "1" }; // Reset to page 1 on search
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        if (orderBy !== "name") params.orderBy = orderBy;

        // Only update if parameters actually changed (avoid redundant pushes)
        const currentSearch = searchParams.get("search") || "";
        if (currentSearch !== debouncedSearchTerm) {
            setSearchParams(params, { replace: true });
        }
    }, [debouncedSearchTerm, setSearchParams]); // Removed orderBy dependency to avoid fighting

    // Helper to update specific params
    const updateParams = (updates: any) => {
        const current = Object.fromEntries(searchParams.entries());
        const newParams = { ...current, ...updates };

        // Clean up defaults
        if (!newParams.search) delete newParams.search;
        if (newParams.orderBy === "name") delete newParams.orderBy;

        setSearchParams(newParams);
    };

    // React Query Hooks
    const { data, isLoading, refetch: fetchCategories, isPlaceholderData } = useCategories({
        searchTerm: debouncedSearchTerm,
        orderBy,
        pageNumber,
        pageSize: 10
    });

    const isFetching = isLoading || isPlaceholderData;

    const deleteCategoryMutation = useDeleteCategory();

    // Dialog states
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const categories = data?.categories || [];
    const pagination = data?.metaData;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSort = (column: string) => {
        const newOrder = orderBy === column ? `${column} desc` : column;
        updateParams({ orderBy: newOrder, page: "1" });
    };

    const handlePageChange = (page: number) => {
        updateParams({ page: page.toString() });
    };

    const getSortIcon = (column: string) => {
        if (orderBy === column) return <ArrowUp className="h-4 w-4" />;
        if (orderBy === `${column} desc`) return <ArrowDown className="h-4 w-4" />;
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground/30" />;
    };

    const openCreateDialog = () => {
        setSelectedCategory(null);
        setIsCategoryDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setSelectedCategory(category);
        setIsCategoryDialogOpen(true);
    };

    const openDeleteDialog = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        await deleteCategoryMutation.mutateAsync(selectedCategory.id);
        toast.success(`Category "${selectedCategory.name}" deleted successfully.`);
        setIsDeleteDialogOpen(false);
        fetchCategories();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
                        <p className="text-muted-foreground font-medium">Manage the product catalog categories.</p>
                    </div>
                </div>
                <Button className="gap-2" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-sm:max-w-xs max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search categories..."
                                className="pl-8 bg-background"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        {pagination && (
                            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                                Showing <span className="text-foreground">{categories.length}</span> of {pagination.totalCount} results
                            </p>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[80px]">Image</th>
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
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Description</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {isFetching ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-in fade-in duration-500">
                                            <td className="p-4"><Skeleton className="h-10 w-10 rounded-md" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-40" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-60" /></td>
                                            <td className="p-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        {categories.length > 0 ? (
                                            categories.map((category) => (
                                                <tr key={category.id} className="hover:bg-muted/10 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="w-10 h-10 rounded-md border bg-background flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                                                            {category.pictureUrl ? (
                                                                <img src={`http://localhost:5000${category.pictureUrl}`} alt={category.name} className="object-contain w-full h-full" />
                                                            ) : (
                                                                <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-semibold">{category.name}</td>
                                                    <td className="p-4 text-muted-foreground truncate max-w-[200px]">{category.description || "-"}</td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted" onClick={() => openEditDialog(category)}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog(category)}>
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
                                                            <Tags className="h-8 w-8" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold tracking-tight">No categories found</h3>
                                                        <p className="text-sm text-muted-foreground max-w-[250px]">
                                                            We couldn't find any categories matching your search.
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
                        onPageChange={handlePageChange}
                        disabled={isFetching}
                    />
                )}
            </Card>

            <CategoryDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                category={selectedCategory}
                onSuccess={fetchCategories}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category
                            <span className="font-bold text-foreground mx-1">"{selectedCategory?.name}"</span>
                            and any associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteCategoryMutation.isPending}
                        >
                            {deleteCategoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete Category
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
