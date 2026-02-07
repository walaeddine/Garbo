import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Users, ChevronLeft, Menu, LogOut, X, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout() {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile sidebar on navigation
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const displayName = user?.displayName || 'Admin';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    const navItems = [
        {
            title: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            title: "Brands",
            href: "/admin/brands",
            icon: ShoppingBag,
        },
        {
            title: "Categories",
            href: "/admin/categories",
            icon: Tags,
        },
        {
            title: "Users",
            href: "/admin/users",
            icon: Users,
        }
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen border-r bg-muted/30 transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex h-16 items-center justify-between px-4 border-b">
                        <Link to="/admin" className={cn("flex items-center gap-2 font-bold text-xl text-primary", isCollapsed && "justify-center")}>
                            <span className={cn("transition-opacity duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>Garbo</span>
                            {!isCollapsed && <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase tracking-tighter">Admin</span>}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex"
                        >
                            <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.title}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted group",
                                        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground",
                                        isCollapsed && "justify-center"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                    {(!isCollapsed || isMobileOpen) && <span>{item.title}</span>}
                                    {isActive && (!isCollapsed || isMobileOpen) && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/50" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User Profile */}
                    <div className="border-t p-4 space-y-4">
                        <div className={cn("flex items-center gap-3", isCollapsed && !isMobileOpen && "justify-center")}>
                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            {(!isCollapsed || isMobileOpen) && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold truncate">{displayName}</span>
                                    <span className="text-xs text-muted-foreground truncate">{user?.roles?.[0] || 'Administrator'}</span>
                                </div>
                            )}
                        </div>

                        <div className={cn("flex items-center gap-2", isCollapsed && !isMobileOpen ? "flex-col" : "justify-between")}>
                            <ModeToggle />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Log out"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out",
                isCollapsed ? "lg:ml-20" : "lg:ml-64"
            )}>
                <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h2 className="text-lg font-semibold tracking-tight">Management Console</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="hidden sm:inline">Back to Site</span>
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </div>
            </main>
            <Toaster />
        </div>
    );
}
