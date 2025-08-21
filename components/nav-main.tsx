'use client';

import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavMainProps {
  items: {
    label: string;
    href: string;
    Icon: LucideIcon;
    match: RegExp;
  }[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();
  const isActive = (match: RegExp) => match.test(pathname);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild tooltip={item.label}>
              <Link
                href={item.href}
                className={cn(isActive(item.match) && 'bg-sidebar-accent text-sidebar-accent-foreground')}
              >
                <item.Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
