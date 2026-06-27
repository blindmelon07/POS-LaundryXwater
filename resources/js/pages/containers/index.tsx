import { Head, useForm } from '@inertiajs/react';
import { Package, Package2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerContainers {
    id: number;
    name: string;
    phone: string | null;
    slim_containers: number;
    round_containers: number;
    total: number;
}

interface Summary {
    slim_out: number;
    round_out: number;
    total_out: number;
    slim_sold: number;
    round_sold: number;
    slim_returned: number;
    round_returned: number;
}

interface Props {
    summary: Summary;
    customers: CustomerContainers[];
}

function UpdateContainerForm({
    customer,
    onClose,
}: {
    customer: CustomerContainers;
    onClose: () => void;
}) {
    const { data, setData, put, processing } = useForm({
        slim_containers: customer.slim_containers,
        round_containers: customer.round_containers,
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(`/containers/${customer.id}`, { onSuccess: onClose });
            }}
            className="flex flex-col gap-4"
        >
            <p className="text-sm text-muted-foreground">
                Update containers currently held by <strong>{customer.name}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Saving…' : 'Update'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function ContainersIndex({ summary, customers }: Props) {
    const [editCustomer, setEditCustomer] = useState<CustomerContainers | null>(null);

    return (
        <>
            <Head title="Container Tracking" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Container Tracking</h1>
                    <p className="text-sm text-muted-foreground">Monitor containers currently with customers</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-medium text-amber-700">Slim Containers Out</p>
                                    <p className="mt-1.5 text-3xl font-bold text-amber-800">
                                        {summary.slim_out}
                                    </p>
                                    <p className="mt-1 text-xs text-amber-600">
                                        {summary.slim_sold} sold · {summary.slim_returned} returned
                                    </p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-200/60">
                                    <Package className="size-5 text-amber-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-medium text-orange-700">Round Containers Out</p>
                                    <p className="mt-1.5 text-3xl font-bold text-orange-800">
                                        {summary.round_out}
                                    </p>
                                    <p className="mt-1 text-xs text-orange-600">
                                        {summary.round_sold} sold · {summary.round_returned} returned
                                    </p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-orange-200/60">
                                    <Package2 className="size-5 text-orange-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Containers Out
                                    </p>
                                    <p className="mt-1.5 text-3xl font-bold">{summary.total_out}</p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
                                    <Package className="size-5 text-slate-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Customers with Containers
                                    </p>
                                    <p className="mt-1.5 text-3xl font-bold">{customers.length}</p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
                                    <Package className="size-5 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-1">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <Package className="size-4" /> Containers by Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                        {customers.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <Package className="size-10 opacity-20" />
                                <p className="font-medium">No containers currently out</p>
                                <p className="text-sm">All containers have been returned</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3 text-center">Slim (19L)</th>
                                            <th className="px-4 py-3 text-center">Round (5gal)</th>
                                            <th className="px-4 py-3 text-center">Total</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {customers.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                                            {initials(c.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{c.name}</p>
                                                            {c.phone && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {c.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {c.slim_containers > 0 ? (
                                                        <span className="inline-block min-w-8 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold text-amber-700">
                                                            {c.slim_containers}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {c.round_containers > 0 ? (
                                                        <span className="inline-block min-w-8 rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-bold text-orange-700">
                                                            {c.round_containers}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center text-base font-bold">
                                                    {c.total}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                        onClick={() => setEditCustomer(c)}
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 bg-muted/40 font-bold">
                                            <td className="px-4 py-3">Total</td>
                                            <td className="px-4 py-3 text-center text-amber-700">
                                                {summary.slim_out}
                                            </td>
                                            <td className="px-4 py-3 text-center text-orange-700">
                                                {summary.round_out}
                                            </td>
                                            <td className="px-4 py-3 text-center">{summary.total_out}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Containers</DialogTitle>
                    </DialogHeader>
                    {editCustomer && (
                        <UpdateContainerForm
                            customer={editCustomer}
                            onClose={() => setEditCustomer(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ContainersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Container Tracking', href: '/containers' },
    ],
};
