import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Home } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const displayName = user?.displayName || 'User';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="min-h-svh flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-6 md:gap-10">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="font-bold text-xl text-primary">Garbo</span>
                        </Link>
                        <nav className="hidden md:flex gap-6">
                            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2">
                                <Home className="h-4 w-4" /> Home
                            </Link>
                            {user && (
                                <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2">
                                    <User className="h-4 w-4" /> Profile
                                </Link>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{displayName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.roles?.join(', ')}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    {user?.roles?.includes('Administrator') && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate('/admin')}>
                                                <Home className="mr-2 h-4 w-4" />
                                                <span>Admin Area</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <Link to="/login">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/register">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <Outlet />
            </main>
            <footer className="border-t py-6 md:px-8 md:py-0">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Garbo Team. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
