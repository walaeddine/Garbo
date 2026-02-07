import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetaData {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

interface PaginationProps {
    metaData: MetaData;
    onPageChange: (page: number) => void;
    className?: string;
    disabled?: boolean;
}

export function Pagination({ metaData, onPageChange, className, disabled }: PaginationProps) {
    const { currentPage, totalPages, hasPrevious, hasNext } = metaData;

    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // Show 2 pages before and after current page

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (
                i === currentPage - delta - 1 ||
                i === currentPage + delta + 1
            ) {
                pages.push('...');
            }
        }

        // Remove consecutive ellipses
        return pages.filter((page, index, arr) => {
            if (page === '...' && arr[index - 1] === '...') return false;
            return true;
        });
    };



    return (
        <div className={cn("flex items-center justify-between px-4 py-3 border-t bg-muted/20", className)}>
            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                Page <span className="text-foreground">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 pl-2"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={disabled || !hasPrevious}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden xs:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </span>
                        ) : (
                            <Button
                                key={`page-${page}`}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                    "h-8 w-8 p-0",
                                    (currentPage === page || disabled) && "pointer-events-none opacity-50"
                                )}
                                onClick={() => onPageChange(page as number)}
                                disabled={disabled}
                            >
                                {page}
                            </Button>
                        )
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 pr-2"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={disabled || !hasNext}
                >
                    <span className="hidden xs:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
