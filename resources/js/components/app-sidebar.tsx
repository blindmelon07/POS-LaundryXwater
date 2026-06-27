import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    ClipboardList,
    LayoutGrid,
    NotebookPen,
    Package,
    PackageSearch,
    Receipt,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Truck,
    UserSquare2,
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
        // ── Daily operations ──────────────────────────────
        { title: 'Dashboard',     href: '/dashboard', icon: LayoutGrid },
        ...(can('use pos')    ? [{ title: 'POS Terminal',   href: '/pos',    icon: ShoppingCart }] : []),
        ...(can('view sales') ? [{ title: 'Sales History',  href: '/sales',  icon: Receipt      }] : []),

        // ── Customers & Containers ────────────────────────
        ...(can('use pos') ? [
            { title: 'Customers',          href: '/customers',  icon: Users    },
            { title: 'Container Tracking', href: '/containers', icon: Package  },
        ] : []),

        // ── Delivery workflow ─────────────────────────────
        ...(can('view deliveries') ? [{ title: 'Deliveries',  href: '/deliveries',  icon: Truck       }] : []),
        ...(can('manage loading')  ? [{ title: 'Loading Log', href: '/loading-log', icon: NotebookPen }] : []),

        // ── Store management ──────────────────────────────
        ...(can('manage products')  ? [{ title: 'Products',        href: '/products',  icon: PackageSearch }] : []),
        ...(can('manage expenses')   ? [{ title: 'Expenses',        href: '/expenses',   icon: Wallet        }] : []),
        ...(can('manage employees')  ? [{ title: 'Employees',       href: '/employees',  icon: UserSquare2   }] : []),
        ...(can('manage inventory')  ? [{ title: 'Water Inventory', href: '/inventory',  icon: Boxes         }] : []),

        // ── Reports ───────────────────────────────────────
        ...(can('view reports') ? [
            { title: 'Reports',   href: '/reports',  icon: BarChart3   },
            { title: 'Z-Report',  href: '/z-report', icon: ClipboardList },
        ] : []),

        // ── Admin ─────────────────────────────────────────
        ...(can('manage users') ? [
            { title: 'Users & Roles',      href: '/users',             icon: Users    },
            { title: 'Business Settings',  href: '/business-settings', icon: Settings },
        ] : []),
    ];

    const laundryNavItems: NavItem[] = can('use pos') ? [
        { title: 'Laundry Orders', href: '/laundry/orders', icon: WashingMachine },
        { title: 'Services & Pricing', href: '/laundry/services', icon: ShoppingBag },
        { title: 'Laundry Inventory', href: '/laundry/inventory', icon: Boxes },
    ] : [];

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
                {laundryNavItems.length > 0 && (
                    <NavMain items={laundryNavItems} label="Laundry" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
