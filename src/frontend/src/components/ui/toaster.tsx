import { Toaster as Sonner } from "sonner"

export function Toaster() {
    return (
        <Sonner
            position="bottom-right"
            toastOptions={{
                style: {
                    background: "var(--background)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                },
                className: "font-sans",
            }}
        />
    )
}

export { toast } from "sonner"
