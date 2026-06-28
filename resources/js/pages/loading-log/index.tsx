import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardList, Package, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogEntry {
    id: number;
    log_date: string;
    type: string;
    type_label: string;
    product_name: string;
    quantity: number;
    unit: string;
    rider_name: string | null;
    notes: string | null;
    logged_by: string | null;
    inventory_linked: boolean;
    delivery_order_number: string | null;
    created_at: string;
}

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
}

interface Product {
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

interface Props {
    logs: LogEntry[];
    summary: { total_out: number; total_in: number };
    date: string;
    inventory_items: InventoryItem[];
    products: Product[];
    customers: Customer[];
    type_labels: Record<string, string>;
}

function LogForm({
    inventoryItems,
    products,
    customers,
    date,
    onClose,
}: {
    inventoryItems: InventoryItem[];
    products: Product[];
    customers: Customer[];
    date: string;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        log_date:              date,
        type:                  'load_out',
        inventory_item_id:     '',
        product_name:          '',
        quantity:              '',
        unit:                  'jugs',
        rider_name:            '',
        notes:                 '',
        customer_id:           '',
        customer_name:         '',
        delivery_address:      '',
        delivery_phone:        '',
        delivery_product_id:   '',
        delivery_quantity:     '1',
        payment_method:        'unpaid',
    });

    const handleCustomerSelect = (id: string) => {
        if (id === 'manual') {
            setData((d) => ({ ...d, customer_id: '', customer_name: '', delivery_address: '', delivery_phone: '' }));
            return;
        }
        const c = customers.find((x) => x.id.toString() === id);
        if (c) {
            setData((d) => ({
                ...d,
                customer_id:      id,
                customer_name:    c.name,
                delivery_address: c.address ?? '',
                delivery_phone:   c.phone ?? '',
            }));
        }
    };

    const selectedItem = inventoryItems.find((i) => i.id.toString() === data.inventory_item_id) ?? null;

    const handleItemSelect = (id: string) => {
        if (id === 'manual') {
            setData((d) => ({ ...d, inventory_item_id: '', product_name: '', unit: 'jugs' }));
            return;
        }
        const item = inventoryItems.find((i) => i.id.toString() === id);
        if (item) {
            setData((d) => ({
                ...d,
                inventory_item_id: id,
                product_name:      item.name,
                unit:              item.unit,
            }));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const isPrepaid = data.payment_method === 'paid';
        router.post(
            '/loading-log',
            {
                ...data,
                payment_method: isPrepaid ? 'cash' : data.payment_method,
                is_prepaid: isPrepaid,
            },
            { onSuccess: onClose },
        );
    };

    const isOut = data.type === 'load_out';

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Date + Type */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Date</Label>
                    <Input className="mt-1" type="date" value={data.log_date}
                        onChange={(e) => setData('log_date', e.target.value)} />
                </div>
                <div>
                    <Label>Type</Label>
                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="load_out">
                                <span className="flex items-center gap-2">
                                    <ArrowUpFromLine className="size-3.5 text-red-500" /> Loaded Out
                                </span>
                            </SelectItem>
                            <SelectItem value="load_in">
                                <span className="flex items-center gap-2">
                                    <ArrowDownToLine className="size-3.5 text-emerald-500" /> Loaded In
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Inventory item picker */}
            <div>
                <Label>Item</Label>
                <Select
                    value={data.inventory_item_id || 'manual'}
                    onValueChange={handleItemSelect}
                >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select item…" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="manual">
                            <span className="italic text-muted-foreground">Type manually (no inventory link)</span>
                        </SelectItem>
                        {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                                <span className="flex items-center justify-between gap-3">
                                    <span>{item.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.quantity} {item.unit} in stock
                                    </span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Linked item — show current stock */}
                {selectedItem && (
                    <div className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isOut ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <Package className={`size-4 shrink-0 ${isOut ? 'text-red-500' : 'text-emerald-500'}`} />
                        <span className="text-muted-foreground">Current stock:</span>
                        <span className="font-bold">{selectedItem.quantity} {selectedItem.unit}</span>
                        {data.quantity && (
                            <>
                                <span className="text-muted-foreground">→</span>
                                <span className={`font-bold ${isOut ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {isOut
                                        ? Math.max(0, selectedItem.quantity - (parseFloat(data.quantity) || 0))
                                        : selectedItem.quantity + (parseFloat(data.quantity) || 0)
                                    } {selectedItem.unit}
                                </span>
                            </>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                            inventory will auto-update
                        </span>
                    </div>
                )}

                {/* Manual product name when no inventory item selected */}
                {!data.inventory_item_id && (
                    <Input className="mt-1.5" value={data.product_name}
                        onChange={(e) => setData('product_name', e.target.value)}
                        placeholder="Product name (no inventory link)" />
                )}
                {errors.product_name && <p className="mt-1 text-xs text-destructive">{errors.product_name}</p>}
            </div>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Quantity</Label>
                    <Input className="mt-1" type="number" min={0.5} step={0.5}
                        value={data.quantity}
                        onChange={(e) => setData('quantity', e.target.value)}
                        placeholder="0" />
                    {errors.quantity && <p className="mt-1 text-xs text-destructive">{errors.quantity}</p>}
                </div>
                <div>
                    <Label>Unit</Label>
                    <Input className="mt-1" value={data.unit}
                        onChange={(e) => setData('unit', e.target.value)}
                        placeholder="jugs, gallons, pcs…" />
                </div>
            </div>

            {/* Rider */}
            <div>
                <Label>Rider Name <span className="text-muted-foreground">(optional)</span></Label>
                <Input className="mt-1" value={data.rider_name}
                    onChange={(e) => setData('rider_name', e.target.value)}
                    placeholder="Who is this for?" />
            </div>

            {/* Notes */}
            <div>
                <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                <Input className="mt-1" value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Any additional details" />
            </div>

            {/* Delivery Order Section — only for Load Out */}
            {isOut && (
                <div className="flex flex-col gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-800">
                        Create Delivery Order for Rider{' '}
                        <span className="font-normal text-blue-600">(optional — fill to notify rider)</span>
                    </p>

                    {/* Customer picker */}
                    <div>
                        <Label>Customer</Label>
                        <Select
                            value={data.customer_id || 'manual'}
                            onValueChange={handleCustomerSelect}
                        >
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer…" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">
                                    <span className="italic text-muted-foreground">New / type manually</span>
                                </SelectItem>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        <span className="flex flex-col">
                                            <span>{c.name}</span>
                                            {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Customer Name</Label>
                            <Input
                                className="mt-1"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                placeholder="Full name"
                            />
                        </div>
                        <div>
                            <Label>Phone <span className="text-muted-foreground">(optional)</span></Label>
                            <Input
                                className="mt-1"
                                value={data.delivery_phone}
                                onChange={(e) => setData('delivery_phone', e.target.value)}
                                placeholder="09xx-xxx-xxxx"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <Label>Delivery Address</Label>
                        <Input
                            className="mt-1"
                            value={data.delivery_address}
                            onChange={(e) => setData('delivery_address', e.target.value)}
                            placeholder="Street, Barangay, City"
                        />
                    </div>

                    {/* Product + Qty + Payment */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <Label>Product Ordered</Label>
                            <Select
                                value={data.delivery_product_id || 'none'}
                                onValueChange={(v) => setData('delivery_product_id', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <span className="italic text-muted-foreground">No product</span>
                                    </SelectItem>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Qty</Label>
                            <Input
                                className="mt-1"
                                type="number"
                                min={1}
                                value={data.delivery_quantity}
                                onChange={(e) => setData('delivery_quantity', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Payment</Label>
                            <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="gcash">GCash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {data.customer_name && data.delivery_address && (
                        <p className="text-xs font-medium text-blue-700">
                            ✓ A delivery order will be created and the rider will see it in Deliveries.
                        </p>
                    )}
                </div>
            )}

            <Button
                type="submit"
                disabled={processing || (!data.inventory_item_id && !data.product_name)}
                size="lg"
                className={`w-full ${isOut ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
                {processing ? 'Saving…' : isOut ? 'Log Load Out' : 'Log Load In'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="-mt-2">Cancel</Button>
        </form>
    );
}

export default function LoadingLogIndex({ logs, summary, date, inventory_items, products, customers, type_labels }: Props) {
    const [showAdd, setShowAdd] = useState(false);

    return (
        <>
            <Head title="Loading Log" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Loading Log</h1>
                        <p className="text-sm text-muted-foreground">Track what goes out and comes back each day</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Input type="date" value={date}
                            onChange={(e) => router.get('/loading-log', { date: e.target.value }, { replace: true })}
                            className="h-8 w-auto text-sm" />
                        <Button size="sm" className="h-8 gap-1.5 bg-amber-600 hover:bg-amber-700"
                            onClick={() => setShowAdd(true)}>
                            <Plus className="size-4" /> Add Entry
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-red-100">
                                    <ArrowUpFromLine className="size-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-red-700">Total Loaded Out</p>
                                    <p className="text-2xl font-bold text-red-800">{summary.total_out}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-200 bg-emerald-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100">
                                    <ArrowDownToLine className="size-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-emerald-700">Total Loaded In</p>
                                    <p className="text-2xl font-bold text-emerald-800">{summary.total_in}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Log Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-1">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <ClipboardList className="size-4" />
                            Entries for {new Date(date + 'T00:00:00').toLocaleDateString('en-PH', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <ClipboardList className="size-10 opacity-20" />
                                <p className="font-medium">No entries for this date</p>
                                <p className="text-sm">Click "Add Entry" to start logging</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Time</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Product / Item</th>
                                            <th className="px-4 py-3 text-center">Qty</th>
                                            <th className="px-4 py-3">Rider</th>
                                            <th className="px-4 py-3">Notes</th>
                                            <th className="px-4 py-3">Logged by</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {logs.map((log) => (
                                            <tr key={log.id}
                                                className={`transition-colors hover:bg-muted/40 ${log.type === 'load_out' ? 'border-l-2 border-l-red-400' : 'border-l-2 border-l-emerald-400'}`}>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{log.created_at}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${log.type === 'load_out' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {log.type === 'load_out'
                                                            ? <ArrowUpFromLine className="size-3" />
                                                            : <ArrowDownToLine className="size-3" />}
                                                        {log.type_label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold">{log.product_name}</p>
                                                    {log.inventory_linked && (
                                                        <p className="text-[10px] text-emerald-600 font-medium">
                                                            inventory updated
                                                        </p>
                                                    )}
                                                    {log.delivery_order_number && (
                                                        <p className="text-[10px] text-blue-600 font-medium">
                                                            {log.delivery_order_number}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold tabular-nums">
                                                    {log.quantity} {log.unit}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{log.rider_name ?? '—'}</td>
                                                <td className="max-w-36 truncate px-4 py-3 text-xs text-muted-foreground">{log.notes ?? '—'}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{log.logged_by ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <Button variant="ghost" size="icon"
                                                        className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => {
                                                            if (confirm('Delete this log entry?'))
                                                                router.delete(`/loading-log/${log.id}`);
                                                        }}>
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
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
                        <DialogTitle>Add Loading Log Entry</DialogTitle>
                    </DialogHeader>
                    <LogForm
                        inventoryItems={inventory_items}
                        products={products}
                        customers={customers}
                        date={date}
                        onClose={() => setShowAdd(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

LoadingLogIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Loading Log', href: '/loading-log' },
    ],
};
