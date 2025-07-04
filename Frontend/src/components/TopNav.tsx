import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Rocket,
    Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { MainNav } from "../components/main-nav";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";


const TopNav = () => {
    return (
        <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg px-6">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link to="/" className="flex items-center space-x-2">
                        <Rocket className="h-6 w-6 text-purple-600" />
                        <span className="font-bold text-xl text-gray-900">Inpact</span>
                    </Link>
                    <MainNav />
                </div>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <div className="hidden md:flex gap-2">
                        <Button variant="ghost">
                            <Link to="/login" className="text-gray-900">
                                Login
                            </Link>
                        </Button>
                        <Button className="bg-purple-600 text-white hover:bg-purple-700">
                            <Link to="/signup">Sign Up</Link>
                        </Button>
                    </div>
                    <UserNav />
                </div>
            </div>
        </header>
    )
}

export default TopNav;