import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarDays, ClipboardList, Eye, Minus, Plus, Trash2, WashingMachine, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LaundryService {
    id: number;
    name: string;
    type: string;
    price: number;
    unit: string;
}

interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    phone: string | null;
    status: string;
    status_label: string;
    payment_method: string;
    total_amount: number;
    drop_off_date: string;
    pickup_date: string | null;
}

interface Paginated<T> {
    data: T[];
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    orders: Paginated<Order>;
    filters: { status?: string; date?: string };
    status_labels: Record<string, string>;
    services: LaundryService[];
    customers: Customer[];
    summary: { today: number; pending: number; ready: number };
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const STATUS_STYLES: Record<string, string> = {
    pending:         'bg-amber-100 text-amber-700 border border-amber-200',
    in_progress:     'bg-blue-100 text-blue-700 border border-blue-200',
    ready:           'bg-emerald-100 text-emerald-700 border border-emerald-200',
    completed:       'bg-slate-100 text-slate-600 border border-slate-200',
    cancelled:       'bg-red-100 text-red-700 border border-red-200',
};

const PAYMENT_STYLES: Record<string, string> = {
    cash:   'bg-emerald-100 text-emerald-700',
    gcash:  'bg-blue-100 text-blue-700',
    card:   'bg-violet-100 text-violet-700',
    unpaid: 'bg-red-100 text-red-700',
};

interface CartItem { service: LaundryService; quantity: number; }

function NewOrderForm({ services, customers, onClose }: { services: LaundryService[]; customers: Customer[]; onClose: () => void }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { data, setData, processing, errors } = useForm({
        customer_name:  '',
        customer_id:    '',
        phone:          '',
        payment_method: 'cash',
        drop_off_date:  new Date().toISOString().split('T')[0],
        pickup_date:    '',
        discount:       '',
        notes:          '',
    });

    const selectCustomer = (id: string) => {
        const c = customers.find((x) => x.id.toString() === id);
        setData((d) => ({ ...d, customer_id: id, customer_name: c?.name ?? '', phone: c?.phone ?? '' }));
    };

    const addService = (s: LaundryService) => {
        setCart((prev) => {
            const ex = prev.find((i) => i.service.id === s.id);
            return ex
                ? prev.map((i) => i.service.id === s.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { service: s, quantity: 1 }];
        });
    };

    const updateQty = (id: number, qty: number) => {
        setCart((prev) => prev.map((i) => i.service.id === id ? { ...i, quantity: Math.max(0.5, qty) } : i));
    };

    const subtotal  = cart.reduce((s, i) => s + i.service.price * i.quantity, 0);
    const discount  = parseFloat(data.discount) || 0;
    const total     = Math.max(0, subtotal - discount);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/laundry/orders', {
            ...data,
            items: cart.map((i) => ({
                service_name: i.service.name,
                service_type: i.service.type,
                unit_price:   i.service.price,
                quantity:     i.quantity,
                unit:         i.service.unit,
            })),
        }, { onSuccess: onClose });
    };

    return (
        <form onSubmit={submit} className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <Label>Customer <span className="text-muted-foreground">(optional)</span></Label>
                    <Select value={data.customer_id} onValueChange={selectCustomer}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select existing" /></SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2">
                    <Label>Customer Name *</Label>
                    <Input className="mt-1" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} placeholder="Full name" />
                    {errors.customer_name && <p className="mt-1 text-xs text-destructive">{errors.customer_name}</p>}
                </div>
                <div>
                    <Label>Phone</Label>
                    <Input className="mt-1" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="09xx-xxx-xxxx" />
                </div>
                <div>
                    <Label>Payment</Label>
                    <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="gcash">GCash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="unpaid">Unpaid (pay on pickup)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Drop-off Date *</Label>
                    <Input className="mt-1" type="date" value={data.drop_off_date} onChange={(e) => setData('drop_off_date', e.target.value)} />
                </div>
                <div>
                    <Label>Expected Pickup <span className="text-muted-foreground">(optional)</span></Label>
                    <Input className="mt-1" type="date" value={data.pickup_date} onChange={(e) => setData('pickup_date', e.target.value)} />
                </div>
            </div>

            {/* Service picker */}
            <div>
                <Label className="mb-2 block">Services</Label>
                <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                        <button key={s.id} type="button" onClick={() => addService(s)}
                            className="rounded-lg border-2 border-violet-200 bg-violet-50 px-3 py-1.5 text-left text-xs transition-colors hover:bg-violet-100">
                            <span className="font-semibold">{s.name}</span>{' '}
                            <span className="text-violet-700">{fmt(s.price)}/{s.unit.replace('per ', '')}</span>
                        </button>
                    ))}
                </div>
                {errors.items && <p className="mt-1 text-xs text-destructive">{errors.items}</p>}

                {cart.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                        {cart.map((item) => (
                            <div key={item.service.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                                <span className="flex-1 text-sm font-medium">{item.service.name}</span>
                                <span className="text-xs text-muted-foreground">{fmt(item.service.price)}/{item.service.unit.replace('per ', '')}</span>
                                <div className="flex items-center rounded-lg border bg-background">
                                    <button type="button" onClick={() => updateQty(item.service.id, item.quantity - 0.5)}
                                        className="flex size-6 items-center justify-center rounded-l-lg hover:bg-muted">
                                        <Minus className="size-3" />
                                    </button>
                                    <input type="number" min={0.5} step={0.5} value={item.quantity}
                                        onChange={(e) => updateQty(item.service.id, parseFloat(e.target.value) || 0.5)}
                                        className="w-12 border-x bg-transparent py-0.5 text-center text-sm font-semibold" />
                                    <button type="button" onClick={() => updateQty(item.service.id, item.quantity + 0.5)}
                                        className="flex size-6 items-center justify-center rounded-r-lg hover:bg-muted">
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                                <span className="w-20 text-right text-sm font-bold tabular-nums">{fmt(item.service.price * item.quantity)}</span>
                                <button type="button" onClick={() => setCart((p) => p.filter((i) => i.service.id !== item.service.id))}
                                    className="text-muted-foreground hover:text-destructive">
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex flex-col gap-1 rounded-lg bg-violet-50 px-3 py-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <Input type="number" min={0} step="0.01" value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    placeholder="0.00" className="h-6 w-20 text-right text-xs" />
                            </div>
                            <div className="flex justify-between font-bold text-violet-900">
                                <span>Total</span><span className="tabular-nums">{fmt(total)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                <Input className="mt-1" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Special instructions" />
            </div>

            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing || cart.length === 0} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    {processing ? 'Creating…' : 'Create Order'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

function UpdateStatusForm({ order, statusLabels, onClose }: { order: Order; statusLabels: Record<string, string>; onClose: () => void }) {
    const { data, setData, patch, processing } = useForm({ status: order.status, amount_paid: '' });
    return (
        <form onSubmit={(e) => { e.preventDefault(); patch(`/laundry/orders/${order.id}/status`, { onSuccess: onClose }); }}
            className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Update status for <strong>{order.order_number}</strong></p>
            <div>
                <Label>Status</Label>
                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {(data.status === 'completed') && (
                <div>
                    <Label>Amount Paid (₱)</Label>
                    <Input className="mt-1" type="number" min={0} step="0.01" value={data.amount_paid}
                        onChange={(e) => setData('amount_paid', e.target.value)}
                        placeholder={order.total_amount.toString()} />
                </div>
            )}
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">{processing ? 'Updating…' : 'Update Status'}</Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

export default function LaundryOrdersIndex({ orders, filters, status_labels, services, customers, summary }: Props) {
    const [showNew, setShowNew] = useState(false);
    const [statusOrder, setStatusOrder] = useState<Order | null>(null);

    const applyFilter = (key: string, value: string) => {
        router.get('/laundry/orders', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Laundry Orders" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Today's Orders",  value: summary.today,   icon: WashingMachine, iconClass: 'text-violet-600', bgClass: 'bg-violet-50' },
                        { label: 'In Progress',      value: summary.pending, icon: ClipboardList,  iconClass: 'text-amber-600',  bgClass: 'bg-amber-50'  },
                        { label: 'Ready for Pickup', value: summary.ready,   icon: CalendarDays,   iconClass: 'text-emerald-600',bgClass: 'bg-emerald-50'},
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

                {/* Header */}
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Laundry Orders</h1>
                    <div className="ml-auto flex flex-wrap gap-2">
                        <Input type="date" value={filters.date ?? ''} onChange={(e) => applyFilter('date', e.target.value)} className="h-8 w-auto text-sm" />
                        <Select value={filters.status ?? 'all'} onValueChange={(v) => applyFilter('status', v === 'all' ? '' : v)}>
                            <SelectTrigger className="h-8 w-44 text-sm"><SelectValue placeholder="All Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {Object.entries(status_labels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button size="sm" className="h-8 gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => setShowNew(true)}>
                            <Plus className="size-4" /> New Order
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {orders.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <WashingMachine className="size-10 opacity-20" />
                                <p className="font-medium">No laundry orders found</p>
                                <p className="text-sm">Create a new order to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Order #</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Drop-off</th>
                                            <th className="px-4 py-3">Pickup</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Payment</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.data.map((o) => (
                                            <tr key={o.id} className="transition-colors hover:bg-muted/40">
                                                <td className="px-4 py-3 font-mono text-xs font-semibold text-violet-700">{o.order_number}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold">{o.customer_name}</p>
                                                    {o.phone && <p className="text-xs text-muted-foreground">{o.phone}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{o.drop_off_date}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{o.pickup_date ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status] ?? ''}`}>
                                                        {o.status_label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STYLES[o.payment_method] ?? ''}`}>
                                                        {o.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums">{fmt(o.total_amount)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/laundry/orders/${o.id}`}>
                                                            <Button variant="ghost" size="icon" className="size-7"><Eye className="size-3.5" /></Button>
                                                        </Link>
                                                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setStatusOrder(o)}>
                                                            Update
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => { if (confirm(`Delete ${o.order_number}?`)) router.delete(`/laundry/orders/${o.id}`); }}>
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

                {orders.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {orders.links.map((link, i) => (
                            <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm"
                                disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }} className="h-8 min-w-8 text-xs" />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>New Laundry Order</DialogTitle></DialogHeader>
                    <NewOrderForm services={services} customers={customers} onClose={() => setShowNew(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!statusOrder} onOpenChange={(o) => !o && setStatusOrder(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
                    {statusOrder && <UpdateStatusForm order={statusOrder} statusLabels={status_labels} onClose={() => setStatusOrder(null)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}

LaundryOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laundry Orders', href: '/laundry/orders' },
    ],
};
