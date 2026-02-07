import { type ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import type { MetaData } from "@/lib/api-utils";

interface Column<T> {
    header: ReactNode | ((sortIcon?: ReactNode) => ReactNode);
    render: (item: T) => ReactNode;
    className?: string;
    sortKey?: string;
}

interface AdminDataTableProps<T> {
    title?: string;
    description?: string;
    data: T[];
    isLoading: boolean;
    pagination?: MetaData | null;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    columns: Column<T>[];
    onPageChange?: (page: number) => void;
    onSort?: (key: string) => void;
    getSortIcon?: (key: string) => ReactNode;
    emptyMessage?: ReactNode;
    actions?: ReactNode;
}

export function AdminDataTable<T>({
    data,
    isLoading,
    pagination,
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Search...",
    columns,
    onPageChange,
    onSort,
    getSortIcon,
    emptyMessage = "No results found.",
    actions,
}: AdminDataTableProps<T>) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/50">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative w-full max-sm:max-w-xs max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            className="pl-8 bg-background"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        {pagination && (
                            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                                Showing <span className="text-foreground">{data.length}</span> of {pagination.totalCount} results
                            </p>
                        )}
                        {actions}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30 border-b">
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className={`h-10 px-4 text-left font-medium text-muted-foreground ${column.sortKey ? "cursor-pointer hover:text-foreground transition-colors group" : ""
                                            } ${column.className || ""}`}
                                        onClick={() => column.sortKey && onSort?.(column.sortKey)}
                                    >
                                        <div className="flex items-center gap-1 justify-between">
                                            {typeof column.header === "function"
                                                ? column.header(column.sortKey ? getSortIcon?.(column.sortKey) : undefined)
                                                : column.header}
                                            {column.sortKey && getSortIcon && (
                                                <div className="flex items-center bg-muted/50 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {getSortIcon(column.sortKey)}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-in fade-in duration-500">
                                        {columns.map((_, j) => (
                                            <td key={j} className="p-4">
                                                <Skeleton className="h-5 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="py-24 text-center">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={index} className="hover:bg-muted/10 transition-colors group">
                                        {columns.map((column, j) => (
                                            <td key={j} className={`p-4 ${column.className || ""}`}>
                                                {column.render(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            {pagination && onPageChange && (
                <Pagination
                    metaData={pagination}
                    onPageChange={onPageChange}
                    disabled={isLoading}
                />
            )}
        </Card>
    );
}
