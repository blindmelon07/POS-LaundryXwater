import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

export function usePermission() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const can = (permission: string): boolean => {
        return auth.permissions?.includes(permission) ?? false;
    };

    const hasRole = (role: string): boolean => {
        return auth.roles?.includes(role) ?? false;
    };

    const isAdmin = (): boolean => hasRole('admin');

    return { can, hasRole, isAdmin, roles: auth.roles ?? [], permissions: auth.permissions ?? [] };
}
