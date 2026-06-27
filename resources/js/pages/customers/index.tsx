import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, Package, Pencil, Phone, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    email: string | null;
    type: string;
    slim_containers: number;
    round_containers: number;
    total_containers: number;
    balance: number;
    is_active: boolean;
    sales_count: number;
    notes: string | null;
}

interface Props {
    customers: Customer[];
    filters: { search?: string; type?: string };
    type_labels: Record<string, string>;
    summary: { total: number; slim_out: number; round_out: number };
}

const TYPE_STYLES: Record<string, string> = {
    wholesale: 'bg-blue-100 text-blue-700 border border-blue-200',
    regular: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    commercial: 'bg-violet-100 text-violet-700 border border-violet-200',
};

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-rose-500',
    'bg-indigo-500',
];

function avatarColor(name: string) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function CustomerForm({
    customer,
    typeLabels,
    onClose,
}: {
    customer?: Customer;
    typeLabels: Record<string, string>;
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: customer?.name ?? '',
        phone: customer?.phone ?? '',
        address: customer?.address ?? '',
        email: customer?.email ?? '',
        type: customer?.type ?? 'regular',
        slim_containers: customer?.slim_containers ?? 0,
        round_containers: customer?.round_containers ?? 0,
        notes: customer?.notes ?? '',
        is_active: customer?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customer) {
            put(`/customers/${customer.id}`, { onSuccess: onClose });
        } else {
            post('/customers', { onSuccess: onClose });
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
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
                    <Label>Phone</Label>
                    <Input
                        className="mt-1"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="09xx-xxx-xxxx"
                    />
                </div>
                <div>
                    <Label>Customer Type</Label>
                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(typeLabels).map(([v, l]) => (
                                <SelectItem key={v} value={v}>
                                    {l}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2">
                    <Label>Address</Label>
                    <Input
                        className="mt-1"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Street, Barangay, City"
                    />
                </div>
                <div>
                    <Label>Slim Containers Out</Label>
                    <Input
                        className="mt-1"
                        type="number"
                        min={0}
                        value={data.slim_containers}
                        onChange={(e) => setData('slim_containers', parseInt(e.target.value) || 0)}
                    />
                </div>
                <div>
                    <Label>Round Containers Out</Label>
                    <Input
                        className="mt-1"
                        type="number"
                        min={0}
                        value={data.round_containers}
                        onChange={(e) => setData('round_containers', parseInt(e.target.value) || 0)}
                    />
                </div>
                <div className="col-span-2">
                    <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                    <Input
                        className="mt-1"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Any notes about this customer"
                    />
                </div>
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Saving…' : customer ? 'Update Customer' : 'Add Customer'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function CustomersIndex({ customers, filters, type_labels, summary }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        router.get(
            '/customers',
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const deleteCustomer = (id: number, name: string) => {
        if (confirm(`Delete customer "${name}"? This cannot be undone.`)) {
            router.delete(`/customers/${id}`);
        }
    };

    return (
        <>
            <Head title="Customers" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Customers', value: summary.total, icon: Users, iconClass: 'text-blue-600', bgClass: 'bg-blue-50' },
                        { label: 'Slim Containers Out', value: summary.slim_out, icon: Package, iconClass: 'text-amber-600', bgClass: 'bg-amber-50' },
                        { label: 'Round Containers Out', value: summary.round_out, icon: Package, iconClass: 'text-orange-600', bgClass: 'bg-orange-50' },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                        <p className="mt-1.5 text-2xl font-bold">{s.value}</p>
                                    </div>
                                    <div className={`flex size-9 items-center justify-center rounded-xl ${s.bgClass}`}>
                                        <s.icon className={`size-4 ${s.iconClass}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters + Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Customers</h1>
                    <div className="ml-auto flex flex-wrap gap-2">
                        <Input
                            placeholder="Search name or phone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter('search', search)}
                            className="h-8 w-48 text-sm"
                        />
                        <Select
                            value={filters.type ?? 'all'}
                            onValueChange={(v) => applyFilter('type', v === 'all' ? '' : v)}
                        >
                            <SelectTrigger className="h-8 w-36 text-sm">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {Object.entries(type_labels).map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                        {l}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowAdd(true)}>
                            <Plus className="size-4" /> Add Customer
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {customers.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <Users className="size-10 opacity-20" />
                                <p className="font-medium">No customers found</p>
                                <p className="text-sm">Add your first customer or adjust the search</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Address</th>
                                            <th className="px-4 py-3 text-center">Containers</th>
                                            <th className="px-4 py-3 text-right">Purchases</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {customers.map((c) => (
                                            <tr
                                                key={c.id}
                                                className={`transition-colors hover:bg-muted/40 ${!c.is_active ? 'opacity-50' : ''}`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(c.name)}`}
                                                        >
                                                            {initials(c.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{c.name}</p>
                                                            {c.email && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {c.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[c.type] ?? 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {type_labels[c.type] ?? c.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {c.phone ? (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="size-3" /> {c.phone}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="max-w-36 truncate px-4 py-3 text-xs text-muted-foreground">
                                                    {c.address ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {c.total_containers > 0 ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            {c.slim_containers > 0 && (
                                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                                    {c.slim_containers}S
                                                                </span>
                                                            )}
                                                            {c.round_containers > 0 && (
                                                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                                                                    {c.round_containers}R
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                                    {c.sales_count}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/customers/${c.id}`}>
                                                            <Button variant="ghost" size="icon" className="size-7">
                                                                <Eye className="size-3.5" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            onClick={() => setEditCustomer(c)}
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => deleteCustomer(c.id, c.name)}
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

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Customer</DialogTitle>
                    </DialogHeader>
                    <CustomerForm typeLabels={type_labels} onClose={() => setShowAdd(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                    </DialogHeader>
                    {editCustomer && (
                        <CustomerForm
                            customer={editCustomer}
                            typeLabels={type_labels}
                            onClose={() => setEditCustomer(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/customers' },
    ],
};
