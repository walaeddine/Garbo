import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useUpdateUserRoles } from "@/hooks/useUserMutations"
import type { User } from "@/types/auth"

interface UserRolesDialogProps {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const AVAILABLE_ROLES = ["Administrator", "Manager", "User"]

export function UserRolesDialog({ user, open, onOpenChange }: UserRolesDialogProps) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const { mutate: updateRoles, isPending } = useUpdateUserRoles()

    useEffect(() => {
        if (user) {
            setSelectedRoles(user.roles || [])
        }
    }, [user])

    const handleRoleToggle = (role: string) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        )
    }

    const handleSave = () => {
        if (!user) return
        updateRoles(
            { userId: user.id, roles: selectedRoles },
            { onSuccess: () => onOpenChange(false) }
        )
    }

    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User Roles</DialogTitle>
                    <DialogDescription>
                        Manage access levels for {user.firstName} {user.lastName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {AVAILABLE_ROLES.map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                                id={role}
                                checked={selectedRoles.includes(role)}
                                onCheckedChange={() => handleRoleToggle(role)}
                            />
                            <Label htmlFor={role}>{role}</Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
