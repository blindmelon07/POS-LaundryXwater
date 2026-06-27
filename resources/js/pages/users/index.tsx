import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Shield, Trash2, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at: string;
}

interface Props {
    users: User[];
    roles: string[];
    available_permissions: string[];
}

const ROLE_STYLES: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 border border-red-200',
    cashier: 'bg-blue-100 text-blue-700 border border-blue-200',
};

const ROLE_ICON_STYLES: Record<string, string> = {
    admin: 'bg-red-50 text-red-600',
    cashier: 'bg-blue-50 text-blue-600',
};

const ROLE_PERMS: Record<string, string[]> = {
    admin: [
        'view dashboard',
        'use pos',
        'view sales',
        'delete sales',
        'manage products',
        'manage expenses',
        'manage inventory',
        'view reports',
        'manage users',
        'manage roles',
    ],
    cashier: ['view dashboard', 'use pos', 'view sales', 'manage expenses', 'view reports'],
};

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
function avatarColor(name: string) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function CreateUserForm({ roles, onClose }: { roles: string[]; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: roles[0] ?? 'cashier',
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                post('/users', { onSuccess: onClose });
            }}
            className="flex flex-col gap-4"
        >
            <div>
                <Label>Full Name</Label>
                <Input
                    className="mt-1"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Juan dela Cruz"
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
                <Label>Email Address</Label>
                <Input
                    className="mt-1"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="juan@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
                <Label>Password</Label>
                <Input
                    className="mt-1"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Min. 8 characters"
                />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>
            <div>
                <Label>Role</Label>
                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">
                                {r}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {data.role && ROLE_PERMS[data.role] && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {ROLE_PERMS[data.role].map((p) => (
                            <span
                                key={p}
                                className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {p}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Creating…' : 'Create User'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function EditUserForm({ user, onClose }: { user: User; onClose: () => void }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(`/users/${user.id}`, { onSuccess: onClose });
            }}
            className="flex flex-col gap-4"
        >
            <div>
                <Label>Full Name</Label>
                <Input
                    className="mt-1"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
                <Label>Email Address</Label>
                <Input
                    className="mt-1"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
                <Label>
                    New Password{' '}
                    <span className="text-muted-foreground">(leave blank to keep current)</span>
                </Label>
                <Input
                    className="mt-1"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="New password"
                />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function AssignRoleForm({
    user,
    roles,
    onClose,
}: {
    user: User;
    roles: string[];
    onClose: () => void;
}) {
    const { data, setData, put, processing } = useForm({ role: user.roles[0] ?? roles[0] });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(`/users/${user.id}/role`, { onSuccess: onClose });
            }}
            className="flex flex-col gap-4"
        >
            <p className="text-sm text-muted-foreground">
                Assign a role to <strong>{user.name}</strong>.
            </p>
            <div>
                <Label>Role</Label>
                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">
                                {r}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {data.role && ROLE_PERMS[data.role] && (
                <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                        Permissions included:
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {ROLE_PERMS[data.role].map((p) => (
                            <span
                                key={p}
                                className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Assigning…' : 'Assign Role'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function UsersIndex({ users, roles, available_permissions }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [roleUser, setRoleUser] = useState<User | null>(null);

    const deleteUser = (id: number, name: string) => {
        if (confirm(`Delete user "${name}"? This cannot be undone.`)) {
            router.delete(`/users/${id}`);
        }
    };

    return (
        <>
            <Head title="Users & Roles" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Users & Roles</h1>
                        <p className="text-sm text-muted-foreground">
                            {users.length} user{users.length !== 1 ? 's' : ''} · {roles.length} roles
                        </p>
                    </div>
                    <Button size="sm" className="ml-auto gap-1.5" onClick={() => setShowCreate(true)}>
                        <Plus className="size-4" /> Add User
                    </Button>
                </div>

                {/* Role Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {roles.map((role) => (
                        <Card key={role} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <div
                                        className={`flex size-7 items-center justify-center rounded-lg ${ROLE_ICON_STYLES[role] ?? 'bg-muted text-muted-foreground'}`}
                                    >
                                        <Shield className="size-3.5" />
                                    </div>
                                    <span className="capitalize font-semibold">{role}</span>
                                    <span
                                        className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[role] ?? 'bg-muted text-muted-foreground'}`}
                                    >
                                        {role}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {(ROLE_PERMS[role] ?? available_permissions).map((p) => (
                                        <span
                                            key={p}
                                            className="rounded border bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                        >
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Separator />

                {/* Users Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-1">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <Users className="size-4" /> Team Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                        {users.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <Users className="size-10 opacity-20" />
                                <p className="font-medium">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">User</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Joined</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(user.name)}`}
                                                        >
                                                            {initials(user.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.length > 0 ? (
                                                            user.roles.map((r) => (
                                                                <span
                                                                    key={r}
                                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[r] ?? 'bg-muted text-muted-foreground'}`}
                                                                >
                                                                    {r}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                No role
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.created_at}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            title="Edit user"
                                                            onClick={() => setEditUser(user)}
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            title="Assign role"
                                                            onClick={() => setRoleUser(user)}
                                                        >
                                                            <UserCheck className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            title="Delete user"
                                                            onClick={() => deleteUser(user.id, user.name)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                    </DialogHeader>
                    <CreateUserForm roles={roles} onClose={() => setShowCreate(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    {editUser && <EditUserForm user={editUser} onClose={() => setEditUser(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={!!roleUser} onOpenChange={(o) => !o && setRoleUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Role</DialogTitle>
                    </DialogHeader>
                    {roleUser && (
                        <AssignRoleForm user={roleUser} roles={roles} onClose={() => setRoleUser(null)} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users & Roles', href: '/users' },
    ],
};
