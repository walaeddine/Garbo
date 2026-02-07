"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/apiClient"
import { useCreateCategory } from "@/hooks/categories/useCreateCategory"
import { useUpdateCategory } from "@/hooks/categories/useUpdateCategory"
import { toast } from "@/components/ui/toaster"
import type { Category } from "@/types/category"

const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    description: z.string().optional().default(""),
    pictureUrl: z.string().optional().default(""),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSuccess?: () => void;
}

export function CategoryDialog({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isEdit = !!category

    const createCategoryMutation = useCreateCategory()
    const updateCategoryMutation = useUpdateCategory()

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema) as any,
        defaultValues: {
            name: "",
            description: "",
            pictureUrl: "",
        },
    })

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                description: category.description || "",
                pictureUrl: category.pictureUrl || "",
            })
        } else {
            form.reset({
                name: "",
                description: "",
                pictureUrl: "",
            })
        }
    }, [category, form, open])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await apiClient.post("/uploads/categories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            form.setValue("pictureUrl", response.data.url)
        } catch (error) {
            console.error("Upload failed:", error)
        } finally {
            setUploading(false)
        }
    }

    async function onSubmit(values: CategoryFormValues) {
        try {
            if (isEdit && category) {
                await updateCategoryMutation.mutateAsync({ id: category.id, category: values })
                toast.success(`Category "${values.name}" updated successfully.`)
            } else {
                await createCategoryMutation.mutateAsync(values)
                toast.success(`Category "${values.name}" created successfully.`)
            }
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            console.error("Failed to save category:", error)
            const fieldErrors = error.response?.data?.errors
            if (fieldErrors) {
                Object.keys(fieldErrors).forEach((key) => {
                    const field = key.toLowerCase() as keyof CategoryFormValues
                    form.setError(field, { message: fieldErrors[key][0] })
                })
            } else {
                const message = error.response?.data?.message || error.response?.data?.Message
                if (message) {
                    form.setError("name", { message })
                }
            }
        }
    }

    const isPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Commonly updated category details." : "Enter the details for the new category."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Short description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pictureUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Image</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-dashed border-muted-foreground/50 bg-muted/50 flex items-center justify-center">
                                                    {field.value ? (
                                                        <>
                                                            <img
                                                                src={field.value}
                                                                alt="Preview"
                                                                className="h-full w-full object-contain"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => form.setValue("pictureUrl", "")}
                                                                className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={uploading}
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        {uploading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="mr-2 h-4 w-4" />
                                                                Upload Image
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <Input type="hidden" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? "Save Changes" : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
