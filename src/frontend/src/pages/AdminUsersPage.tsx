import { useState } from "react"
import { useUsers } from "@/hooks/users/useUsers"
import { useDebounce } from "@/hooks/useDebounce"
import { useToggleUserLockout } from "@/hooks/users/useUserMutations"
import { Button } from "@/components/ui/button"
import { Mail, Shield, MoreHorizontal, Lock, Unlock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { UserRolesDialog } from "@/components/users/UserRolesDialog"
import type { User } from "@/types/auth"

import { AdminDataTable } from "@/components/admin/AdminDataTable"

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)

    const debouncedSearch = useDebounce(searchTerm, 500)
    const { mutate: toggleLockout } = useToggleUserLockout()

    const { data, isLoading } = useUsers({
        pageNumber: currentPage,
        pageSize: 10,
        searchTerm: debouncedSearch
    })

    const users = data?.users || []
    const metaData = data?.metaData

    const handleEditRoles = (user: User) => {
        setSelectedUser(user)
        setIsRolesDialogOpen(true)
    }

    const handleToggleLockout = (user: User) => {
        const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date()
        toggleLockout({ userId: user.id, locked: !isLocked })
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const columns = [
        {
            header: "User",
            render: (user: User) => {
                const displayName = `${user.firstName} ${user.lastName}`.trim() || "User"
                const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-primary/10">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{displayName}</span>
                    </div>
                )
            }
        },
        {
            header: "Email",
            render: (user: User) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                </div>
            )
        },
        {
            header: "Status",
            render: (user: User) => {
                const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date()
                return (
                    <Badge variant={isLocked ? "destructive" : "outline"} className={isLocked ? "" : "bg-green-500/10 text-green-500 border-green-500/20"}>
                        {isLocked ? "Locked" : "Active"}
                    </Badge>
                )
            }
        },
        {
            header: "Roles",
            render: (user: User) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role) => (
                        <Badge key={role} variant="secondary" className="bg-primary/5 text-primary-foreground/70 border-primary/10">
                            <Shield className="mr-1 h-3 w-3" />
                            {role}
                        </Badge>
                    ))}
                </div>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            render: (user: User) => {
                const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date()
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditRoles(user)}>
                                <Shield className="mr-2 h-4 w-4" /> Edit Roles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleLockout(user)} className={isLocked ? "text-green-600" : "text-destructive"}>
                                {isLocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                                {isLocked ? "Unlock Account" : "Lock Account"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <UserRolesDialog
                user={selectedUser}
                open={isRolesDialogOpen}
                onOpenChange={setIsRolesDialogOpen}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground font-medium">View and manage registered users and their roles.</p>
                </div>
            </div>

            <AdminDataTable
                data={users}
                isLoading={isLoading}
                pagination={metaData}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search users..."
                columns={columns}
                onPageChange={setCurrentPage}
                emptyMessage={
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/40 mb-2">
                            <Mail className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">No users found</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px]">
                            We couldn't find any users matching your search.
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
        </div>
    )
}
