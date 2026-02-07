import { useState } from "react"
import { useUsers } from "@/hooks/useUsers"
import { useDebounce } from "@/hooks/useDebounce"
import { useToggleUserLockout } from "@/hooks/useUserMutations"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Mail, Shield, MoreHorizontal, Lock, Unlock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { UserRolesDialog } from "@/components/users/UserRolesDialog"
import type { User } from "@/types/auth"

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

            <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-sm:max-w-xs max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search users..."
                                className="pl-8 bg-background"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>
                        {metaData && (
                            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                                Showing <span className="text-foreground">{users.length}</span> of {metaData.totalCount} results
                            </p>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">User</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Email</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Roles</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-in fade-in duration-500">
                                            <td className="p-4"><Skeleton className="h-10 w-32" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-16" /></td>
                                            <td className="p-4"><Skeleton className="h-5 w-20" /></td>
                                            <td className="p-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
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
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const displayName = `${user.firstName} ${user.lastName}`.trim() || "User"
                                        const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
                                        const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date()

                                        return (
                                            <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-primary/10">
                                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-semibold">{displayName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={isLocked ? "destructive" : "outline"} className={isLocked ? "" : "bg-green-500/10 text-green-500 border-green-500/20"}>
                                                        {isLocked ? "Locked" : "Active"}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles?.map((role) => (
                                                            <Badge key={role} variant="secondary" className="bg-primary/5 text-primary-foreground/70 border-primary/10">
                                                                <Shield className="mr-1 h-3 w-3" />
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
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
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {metaData && (
                    <Pagination
                        metaData={metaData}
                        onPageChange={setCurrentPage}
                        disabled={isLoading}
                    />
                )}
            </Card>
        </div>
    )
}
