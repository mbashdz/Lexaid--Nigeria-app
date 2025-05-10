'use client';
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Save, HelpCircle, Settings, LogOut, BookLock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation'; 
import Image from 'next/image';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayoutComponent({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter(); 

  const handleSignOut = () => {
    // TODO: Implement actual sign out logic
    router.push('/'); // Redirect to login page
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, tooltip: 'Dashboard' },
    { href: '/drafts', label: 'Saved Drafts', icon: Save, tooltip: 'View your saved drafts' },
    { href: '/clauses', label: 'Clause Bank', icon: BookLock, tooltip: 'Manage custom clauses' },
    { href: '/billing', label: 'Billing', icon: CreditCard, tooltip: 'Manage your subscription' },
    { href: '/help', label: 'Help & FAQs', icon: HelpCircle, tooltip: 'Get help and support' },
    { href: '/settings', label: 'Settings', icon: Settings, tooltip: 'Account settings' },
  ];

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-md">
            <Image src="https://picsum.photos/seed/lexaidicon/60/60" alt="LexAid Icon" width={40} height={40} className="rounded-lg border border-sidebar-primary" data-ai-hint="legal balance scale"/>
            <h1 className="text-2xl font-semibold text-sidebar-primary">LexAid</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton 
                    isActive={pathname === item.href} 
                    tooltip={item.tooltip}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src="https://picsum.photos/id/433/40/40" data-ai-hint="professional lawyer" alt="User Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground">BD</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm text-sidebar-foreground">Barrister Doe</p>
                    <p className="text-xs text-sidebar-foreground/80">b.doe@lexmail.ng</p>
                </div>
            </div>
            <Button variant="outline" className="w-full border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-sm md:justify-end">
            <SidebarTrigger className="md:hidden text-foreground" />
            {/* Future header content can go here, e.g., global search, notifications */}
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-secondary/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
