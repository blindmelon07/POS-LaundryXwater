import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SaleItem {
    id: number;
    product_name: string;
    product_type: string;
    unit_price: number;
    quantity: number;
    containers_returned: number;
    subtotal: number;
}

interface Sale {
    id: number;
    sale_number: string;
    customer_name: string | null;
    sale_date: string;
    subtotal: number;
    discount: number;
    total_amount: number;
    payment_method: string;
    amount_paid: number;
    change_amount: number;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    items: SaleItem[];
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const PAYMENT_STYLES: Record<string, string> = {
    cash: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    gcash: 'bg-blue-100 text-blue-700 border border-blue-200',
    card: 'bg-violet-100 text-violet-700 border border-violet-200',
};

export default function SaleShow({ sale }: { sale: Sale }) {
    return (
        <>
            <Head title={`Sale ${sale.sale_number}`} />
            <div className="mx-auto max-w-xl p-4 md:p-6">
                {/* Top bar */}
                <div className="mb-5 flex items-center gap-3">
                    <Link href="/sales">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <ArrowLeft className="size-4" /> Back
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold">{sale.sale_number}</h1>
                        <p className="text-xs text-muted-foreground">{sale.sale_date} · {sale.created_at}</p>
                    </div>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${PAYMENT_STYLES[sale.payment_method] ?? 'bg-muted text-muted-foreground'}`}
                    >
                        {sale.payment_method}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 print:hidden"
                        onClick={() => window.print()}
                    >
                        <Printer className="size-4" /> Print
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Receipt meta */}
                        <div className="grid grid-cols-2 gap-px bg-border">
                            {[
                                { label: 'Customer', value: sale.customer_name ?? 'Walk-in' },
                                { label: 'Date', value: sale.sale_date },
                                { label: 'Processed by', value: sale.created_by ?? '—' },
                                { label: 'Time', value: sale.created_at },
                            ].map((row) => (
                                <div key={row.label} className="bg-card px-5 py-3.5">
                                    <p className="text-xs text-muted-foreground">{row.label}</p>
                                    <p className="mt-0.5 text-sm font-semibold">{row.value}</p>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* Items table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <th className="px-5 py-3">Item</th>
                                        <th className="px-5 py-3 text-center">Qty</th>
                                        <th className="px-5 py-3 text-right">Unit Price</th>
                                        <th className="px-5 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sale.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/30">
                                            <td className="px-5 py-3 font-medium">
                                                {item.product_name}
                                                {item.containers_returned > 0 && (
                                                    <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                                        {item.containers_returned} returned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-center font-semibold tabular-nums">
                                                {item.quantity}
                                            </td>
                                            <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                                                {fmt(item.unit_price)}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold tabular-nums">
                                                {fmt(item.subtotal)}
                                            </td>
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
                                <span className="tabular-nums">{fmt(sale.subtotal)}</span>
                            </div>
                            {sale.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Discount</span>
                                    <span className="tabular-nums">−{fmt(sale.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between rounded-lg bg-blue-50 px-3 py-2 text-base font-bold text-blue-900">
                                <span>Total</span>
                                <span className="tabular-nums">{fmt(sale.total_amount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-muted-foreground">
                                <span>Amount Paid</span>
                                <span className="tabular-nums">{fmt(sale.amount_paid)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-emerald-700">
                                <span>Change</span>
                                <span className="tabular-nums">{fmt(sale.change_amount)}</span>
                            </div>
                        </div>

                        {sale.notes && (
                            <>
                                <Separator />
                                <div className="bg-muted/30 px-5 py-3">
                                    <p className="text-xs text-muted-foreground">Notes</p>
                                    <p className="mt-0.5 text-sm">{sale.notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SaleShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sales History', href: '/sales' },
        { title: 'Receipt', href: '#' },
    ],
};
