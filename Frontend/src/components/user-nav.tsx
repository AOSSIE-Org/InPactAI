import React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

interface UserNavProps {
  showDashboard?: boolean;
}

export function UserNav({ showDashboard = true }: UserNavProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="md:hidden">
          <Link to="/login">Login</Link>
        </Button>
        <Button size="sm" className="md:hidden bg-purple-600 text-white hover:bg-purple-700">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={avatarError ? "https://via.placeholder.com/32" : (user.user_metadata?.avatar_url || "https://via.placeholder.com/32")} 
              alt="User" 
              onError={handleAvatarError}
            />
            <AvatarFallback>{user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {showDashboard && (
            <DropdownMenuItem asChild>
              <Link to="/brand/dashboard">Dashboard</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
