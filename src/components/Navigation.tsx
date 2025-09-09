"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "🏠" },
  { name: "All Sheets", href: "/sheets", icon: "📋" },
  { name: "Manage", href: "/manage", icon: "➕" },
  { name: "Search", href: "/search", icon: "🔍" },
  { name: "AI Extraction", href: "/admin/extraction", icon: "🤖" },
  { name: "Monitoring", href: "/admin/monitoring", icon: "📊" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              🏛️ Auction System
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href={item.href}>
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export Data
            </Button>
            <Button variant="ghost" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}