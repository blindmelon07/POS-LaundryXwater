import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, Minus, Plus, Trash2, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeliveryOrder {
    id: number;
    order_number: string;
    customer_name: string;
    address: string;
    phone: string | null;
    scheduled_date: string;
    scheduled_time: string | null;
    status: string;
    status_label: string;
    total_amount: number;
    payment_method: string;
}

interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    type: string;
}

interface Product {
    id: number;
    name: string;
    type: string;
    price: number;
    unit: string;
}

interface Paginated<T> {
    data: T[];
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    orders: Paginated<DeliveryOrder>;
    filters: { status?: string; date?: string };
    status_labels: Record<string, string>;
    customers: Customer[];
    products: Product[];
    summary: { today: number; pending: number };
    can_manage: boolean;
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    out_for_delivery: 'bg-blue-100 text-blue-700 border border-blue-200',
    delivered: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border border-red-200',
};

interface CartItem {
    product: Product;
    quantity: number;
}

function NewDeliveryForm({
    customers,
    products,
    onClose,
}: {
    customers: Customer[];
    products: Product[];
    onClose: () => void;
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { data, setData, processing, errors } = useForm({
        customer_id: '',
        customer_name: '',
        address: '',
        phone: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '',
        payment_method: 'cash',
        notes: '',
        items: [] as { product_id: number; quantity: number }[],
    });

    const selectCustomer = (id: string) => {
        const c = customers.find((x) => x.id.toString() === id);
        setData((d) => ({
            ...d,
            customer_id: id,
            customer_name: c?.name ?? '',
            address: c?.address ?? '',
            phone: c?.phone ?? '',
        }));
    };

    const addProduct = (p: Product) => {
        setCart((prev) => {
            const ex = prev.find((i) => i.product.id === p.id);
            return ex
                ? prev.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
                : [...prev, { product: p, quantity: 1 }];
        });
    };

    const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/deliveries',
            { ...data, items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })) },
            { onSuccess: onClose },
        );
    };

    return (
        <form onSubmit={submit} className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <Label>Customer <span className="text-muted-foreground">(optional)</span></Label>
                    <Select value={data.customer_id} onValueChange={selectCustomer}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select existing customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2">
                    <Label>Customer Name *</Label>
                    <Input
                        className="mt-1"
                        value={data.customer_name}
                        onChange={(e) => setData('customer_name', e.target.value)}
                        placeholder="Full name"
                    />
                    {errors.customer_name && (
                        <p className="mt-1 text-xs text-destructive">{errors.customer_name}</p>
                    )}
                </div>
                <div className="col-span-2">
                    <Label>Delivery Address *</Label>
                    <Input
                        className="mt-1"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Street, Barangay, City"
                    />
                    {errors.address && (
                        <p className="mt-1 text-xs text-destructive">{errors.address}</p>
                    )}
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
                    <Label>Payment</Label>
                    <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="gcash">GCash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Scheduled Date *</Label>
                    <Input
                        className="mt-1"
                        type="date"
                        value={data.scheduled_date}
                        onChange={(e) => setData('scheduled_date', e.target.value)}
                    />
                </div>
                <div>
                    <Label>Time <span className="text-muted-foreground">(optional)</span></Label>
                    <Input
                        className="mt-1"
                        type="time"
                        value={data.scheduled_time}
                        onChange={(e) => setData('scheduled_time', e.target.value)}
                    />
                </div>
            </div>

            <div>
                <Label className="mb-2 block">Items</Label>
                <div className="flex flex-wrap gap-2">
                    {products
                        .filter((p) => ['slim_wholesale', 'slim_regular', 'slim_commercial'].includes(p.type))
                        .map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => addProduct(p)}
                                className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1.5 text-left text-xs transition-colors hover:bg-blue-100"
                            >
                                <span className="font-semibold">{p.name}</span>{' '}
                                <span className="text-blue-700">{fmt(p.price)}</span>
                            </button>
                        ))}
                </div>
                {cart.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                        {cart.map((item) => (
                            <div
                                key={item.product.id}
                                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                            >
                                <span className="flex-1 text-sm font-medium">{item.product.name}</span>
                                <div className="flex items-center rounded-lg border bg-background">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCart((p) =>
                                                p.map((i) =>
                                                    i.product.id === item.product.id
                                                        ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                                        : i,
                                                ),
                                            )
                                        }
                                        className="flex size-6 items-center justify-center rounded-l-lg hover:bg-muted"
                                    >
                                        <Minus className="size-3" />
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCart((p) =>
                                                p.map((i) =>
                                                    i.product.id === item.product.id
                                                        ? { ...i, quantity: i.quantity + 1 }
                                                        : i,
                                                ),
                                            )
                                        }
                                        className="flex size-6 items-center justify-center rounded-r-lg hover:bg-muted"
                                    >
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                                <span className="w-20 text-right text-sm font-bold tabular-nums">
                                    {fmt(item.product.price * item.quantity)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCart((p) => p.filter((i) => i.product.id !== item.product.id))
                                    }
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">
                            <span>Total</span>
                            <span className="tabular-nums">{fmt(total)}</span>
                        </div>
                    </div>
                )}
                {errors.items && <p className="mt-1 text-xs text-destructive">{errors.items}</p>}
            </div>

            <div>
                <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                    className="mt-1"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Special instructions"
                />
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing || cart.length === 0} className="flex-1">
                    {processing ? 'Scheduling…' : 'Schedule Delivery'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function UpdateStatusForm({
    order,
    statusLabels,
    onClose,
}: {
    order: DeliveryOrder;
    statusLabels: Record<string, string>;
    onClose: () => void;
}) {
    const { data, setData, patch, processing } = useForm({
        status: order.status,
        amount_paid: '',
        payment_method: order.payment_method,
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                patch(`/deliveries/${order.id}/status`, { onSuccess: onClose });
            }}
            className="flex flex-col gap-4"
        >
            <p className="text-sm text-muted-foreground">
                Update status for <strong>{order.order_number}</strong>
            </p>
            <p className="text-sm font-medium">
                Customer: <span className="text-foreground">{order.customer_name}</span>
                {' · '}Total: <span className="font-bold text-foreground">₱{order.total_amount.toFixed(2)}</span>
            </p>
            <div>
                <Label>Status</Label>
                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusLabels).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {data.status === 'delivered' && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Amount Paid (₱)</Label>
                            <Input
                                className="mt-1"
                                type="number"
                                min={0}
                                step="0.01"
                                value={data.amount_paid}
                                onChange={(e) => setData('amount_paid', e.target.value)}
                                placeholder={order.total_amount.toString()}
                            />
                        </div>
                        <div>
                            <Label>Payment Method</Label>
                            <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="gcash">GCash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                        ✓ A sale record will be created automatically in POS transactions.
                    </div>
                </>
            )}

            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Updating…' : 'Update Status'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function DeliveriesIndex({
    orders,
    filters,
    status_labels,
    customers,
    products,
    summary,
    can_manage,
}: Props) {
    const [showNew, setShowNew] = useState(false);
    const [statusOrder, setStatusOrder] = useState<DeliveryOrder | null>(null);

    const applyFilter = (key: string, value: string) => {
        router.get(
            '/deliveries',
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Deliveries" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Today's Deliveries</p>
                                    <p className="mt-1.5 text-2xl font-bold text-blue-700">{summary.today}</p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50">
                                    <Truck className="size-4 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Pending Orders</p>
                                    <p className="mt-1.5 text-2xl font-bold text-amber-700">{summary.pending}</p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50">
                                    <CalendarDays className="size-4 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Header + Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Delivery Orders</h1>
                    <div className="ml-auto flex flex-wrap gap-2">
                        <Input
                            type="date"
                            value={filters.date ?? ''}
                            onChange={(e) => applyFilter('date', e.target.value)}
                            className="h-8 w-auto text-sm"
                        />
                        <Select
                            value={filters.status ?? 'all'}
                            onValueChange={(v) => applyFilter('status', v === 'all' ? '' : v)}
                        >
                            <SelectTrigger className="h-8 w-40 text-sm">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {Object.entries(status_labels).map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                        {l}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {can_manage && (
                            <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowNew(true)}>
                                <Plus className="size-4" /> New Delivery
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {orders.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <Truck className="size-10 opacity-20" />
                                <p className="font-medium">No delivery orders found</p>
                                <p className="text-sm">Create a new delivery order to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Order #</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Address</th>
                                            <th className="px-4 py-3">Schedule</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.data.map((o) => (
                                            <tr
                                                key={o.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                                                    {o.order_number}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold">{o.customer_name}</p>
                                                    {o.phone && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {o.phone}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="max-w-36 truncate px-4 py-3 text-xs text-muted-foreground">
                                                    {o.address}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    <p className="text-sm">{o.scheduled_date}</p>
                                                    {o.scheduled_time && (
                                                        <p className="text-xs">{o.scheduled_time}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status] ?? 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {o.status_label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums">
                                                    {fmt(o.total_amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1 text-xs"
                                                            onClick={() => setStatusOrder(o)}
                                                        >
                                                            <Truck className="size-3" /> Update
                                                        </Button>
                                                        {can_manage && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => {
                                                                    if (confirm(`Delete ${o.order_number}?`))
                                                                        router.delete(`/deliveries/${o.id}`);
                                                                }}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        )}
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

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {orders.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="h-8 min-w-8 text-xs"
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={can_manage && showNew} onOpenChange={setShowNew}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Delivery Order</DialogTitle>
                    </DialogHeader>
                    <NewDeliveryForm
                        customers={customers}
                        products={products}
                        onClose={() => setShowNew(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={!!statusOrder} onOpenChange={(o) => !o && setStatusOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Delivery Status</DialogTitle>
                    </DialogHeader>
                    {statusOrder && (
                        <UpdateStatusForm
                            order={statusOrder}
                            statusLabels={status_labels}
                            onClose={() => setStatusOrder(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

DeliveriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Deliveries', href: '/deliveries' },
    ],
};
