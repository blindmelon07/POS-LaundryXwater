import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
    id: number;
    service_name: string;
    service_type: string;
    unit_price: number;
    quantity: number;
    unit: string;
    subtotal: number;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    phone: string | null;
    status: string;
    status_label: string;
    payment_method: string;
    subtotal: number;
    discount: number;
    total_amount: number;
    amount_paid: number;
    change_amount: number;
    drop_off_date: string;
    pickup_date: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    items: OrderItem[];
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const STATUS_STYLES: Record<string, string> = {
    pending:     'bg-amber-100 text-amber-700 border border-amber-200',
    in_progress: 'bg-blue-100 text-blue-700 border border-blue-200',
    ready:       'bg-emerald-100 text-emerald-700 border border-emerald-200',
    completed:   'bg-slate-100 text-slate-600 border border-slate-200',
    cancelled:   'bg-red-100 text-red-700 border border-red-200',
};

const PAYMENT_STYLES: Record<string, string> = {
    cash:   'bg-emerald-100 text-emerald-700 border border-emerald-200',
    gcash:  'bg-blue-100 text-blue-700 border border-blue-200',
    card:   'bg-violet-100 text-violet-700 border border-violet-200',
    unpaid: 'bg-red-100 text-red-700 border border-red-200',
};

export default function LaundryOrderShow({ order }: { order: Order }) {
    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <div className="mx-auto max-w-xl p-4 md:p-6">
                {/* Top bar */}
                <div className="mb-5 flex items-center gap-3">
                    <Link href="/laundry/orders">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <ArrowLeft className="size-4" /> Back
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold">{order.order_number}</h1>
                        <p className="text-xs text-muted-foreground">Created {order.created_at}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] ?? ''}`}>
                        {order.status_label}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${PAYMENT_STYLES[order.payment_method] ?? ''}`}>
                        {order.payment_method}
                    </span>
                    <Button variant="outline" size="sm" className="gap-1.5 print:hidden" onClick={() => window.print()}>
                        <Printer className="size-4" /> Print
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-px bg-border">
                            {[
                                { label: 'Customer',     value: order.customer_name },
                                { label: 'Phone',        value: order.phone ?? '—' },
                                { label: 'Drop-off',     value: order.drop_off_date },
                                { label: 'Pickup',       value: order.pickup_date ?? 'TBD' },
                                { label: 'Processed by', value: order.created_by ?? '—' },
                                { label: 'Created',      value: order.created_at },
                            ].map((row) => (
                                <div key={row.label} className="bg-card px-5 py-3.5">
                                    <p className="text-xs text-muted-foreground">{row.label}</p>
                                    <p className="mt-0.5 text-sm font-semibold">{row.value}</p>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* Items */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <th className="px-5 py-3">Service</th>
                                        <th className="px-5 py-3 text-center">Qty</th>
                                        <th className="px-5 py-3 text-right">Unit Price</th>
                                        <th className="px-5 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/30">
                                            <td className="px-5 py-3 font-medium">
                                                {item.service_name}
                                                <span className="ml-1.5 text-xs text-muted-foreground">({item.unit})</span>
                                            </td>
                                            <td className="px-5 py-3 text-center font-semibold tabular-nums">{item.quantity}</td>
                                            <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{fmt(item.unit_price)}</td>
                                            <td className="px-5 py-3 text-right font-semibold tabular-nums">{fmt(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Separator />

                        {/* Totals */}
                        <div className="flex flex-col gap-2 px-5 py-4 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="tabular-nums">{fmt(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Discount</span>
                                    <span className="tabular-nums">−{fmt(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between rounded-lg bg-violet-50 px-3 py-2 text-base font-bold text-violet-900">
                                <span>Total</span>
                                <span className="tabular-nums">{fmt(order.total_amount)}</span>
                            </div>
                            {order.amount_paid > 0 && (
                                <>
                                    <Separator />
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Amount Paid</span>
                                        <span className="tabular-nums">{fmt(order.amount_paid)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-emerald-700">
                                        <span>Change</span>
                                        <span className="tabular-nums">{fmt(order.change_amount)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {order.notes && (
                            <>
                                <Separator />
                                <div className="bg-muted/30 px-5 py-3">
                                    <p className="text-xs text-muted-foreground">Notes</p>
                                    <p className="mt-0.5 text-sm">{order.notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LaundryOrderShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laundry Orders', href: '/laundry/orders' },
        { title: 'Order Detail', href: '#' },
    ],
};
