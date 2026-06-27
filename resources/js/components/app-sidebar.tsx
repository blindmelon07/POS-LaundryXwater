import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    ClipboardList,
    LayoutGrid,
    Package,
    PackageSearch,
    Receipt,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Truck,
    Users,
    Wallet,
    WashingMachine,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/use-permission';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { can } = usePermission();

    const waterNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        ...(can('use pos') ? [{ title: 'POS Terminal', href: '/pos', icon: ShoppingCart }] : []),
        ...(can('view sales') ? [{ title: 'Sales History', href: '/sales', icon: Receipt }] : []),
        { title: 'Customers', href: '/customers', icon: Users },
        { title: 'Deliveries', href: '/deliveries', icon: Truck },
        { title: 'Container Tracking', href: '/containers', icon: Package },
        ...(can('manage products') ? [{ title: 'Products', href: '/products', icon: PackageSearch }] : []),
        ...(can('manage expenses') ? [{ title: 'Expenses', href: '/expenses', icon: Wallet }] : []),
        ...(can('manage inventory') ? [{ title: 'Water Inventory', href: '/inventory', icon: Boxes }] : []),
        ...(can('view reports') ? [
            { title: 'Reports', href: '/reports', icon: BarChart3 },
            { title: 'Z-Report', href: '/z-report', icon: ClipboardList },
        ] : []),
        ...(can('manage users') ? [
            { title: 'Users & Roles', href: '/users', icon: Users },
            { title: 'Business Settings', href: '/business-settings', icon: Settings },
        ] : []),
    ];

    const laundryNavItems: NavItem[] = [
        { title: 'Laundry Orders', href: '/laundry/orders', icon: WashingMachine },
        { title: 'Services & Pricing', href: '/laundry/services', icon: ShoppingBag },
        { title: 'Laundry Inventory', href: '/laundry/inventory', icon: Boxes },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={waterNavItems} label="Water Refilling" />
                <NavMain items={laundryNavItems} label="Laundry" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
