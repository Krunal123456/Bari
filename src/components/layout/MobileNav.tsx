"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Users, Star, User } from "lucide-react";
import clsx from "clsx";

export function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Matrimony", href: "/matrimony", icon: Heart },
        { name: "Community", href: "/community", icon: Users },
        { name: "Kundli", href: "/kundli", icon: Star },
        { name: "Profile", href: "/dashboard/profile", icon: User }, // Redirects to login if not auth
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-maroon-100 pb-safe z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive ? "text-maroon-900" : "text-maroon-400 hover:text-maroon-600"
                            )}
                        >
                            <item.icon
                                size={22}
                                className={clsx("transition-transform", isActive && "scale-110")}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
