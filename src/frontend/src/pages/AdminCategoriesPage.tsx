import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tags, Plus, Edit2, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, ImageIcon } from "lucide-react";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
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

import { AdminDataTable } from "@/components/admin/AdminDataTable";

export default function AdminCategoriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived state from URL
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "name");
    const [pageNumber, setPageNumber] = useState(Number(searchParams.get("page")) || 1);

    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    // Sync state with URL
    useEffect(() => {
        const params: any = { page: pageNumber.toString() };
        if (searchTerm) params.search = searchTerm;
        if (orderBy !== "name") params.orderBy = orderBy;
        setSearchParams(params, { replace: true });
    }, [pageNumber, searchTerm, orderBy, setSearchParams]);

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
        setSelectedCategory(null);
        setIsCategoryDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        await deleteCategoryMutation.mutateAsync(selectedCategory.id);
        toast.success(`Category "${selectedCategory.name}" deleted successfully.`);
        setIsDeleteDialogOpen(false);
        fetchCategories();
    };

    const columns = [
        {
            header: "Image",
            className: "w-[80px]",
            render: (category: Category) => (
                <div className="w-10 h-10 rounded-md border bg-background flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                    {category.pictureUrl ? (
                        <img src={category.pictureUrl} alt={category.name} className="object-contain w-full h-full" />
                    ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                    )}
                </div>
            )
        },
        {
            header: "Name",
            sortKey: "name",
            render: (category: Category) => <span className="font-semibold">{category.name}</span>
        },
        {
            header: "Description",
            render: (category: Category) => <span className="text-muted-foreground truncate max-w-[200px] inline-block">{category.description || "-"}</span>
        },
        {
            header: "Actions",
            className: "text-right",
            render: (category: Category) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted" onClick={() => { setSelectedCategory(category); setIsCategoryDialogOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { setSelectedCategory(category); setIsDeleteDialogOpen(true); }}>
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
                    <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
                    <p className="text-muted-foreground font-medium">Manage the product catalog categories.</p>
                </div>
                <Button className="gap-2" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            <AdminDataTable
                data={categories}
                isLoading={isFetching}
                pagination={pagination}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search categories..."
                columns={columns}
                onPageChange={setPageNumber}
                onSort={handleSort}
                getSortIcon={getSortIcon}
                emptyMessage={
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
                }
            />

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
