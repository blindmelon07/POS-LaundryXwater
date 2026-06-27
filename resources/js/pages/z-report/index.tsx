import { Head, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Summary {
    total_transactions: number;
    total_revenue: number;
    total_discount: number;
    total_expenses: number;
    net_profit: number;
    total_gallons: number;
}

interface Props {
    date: string;
    date_value: string;
    business: { name: string; address: string; phone: string };
    summary: Summary;
    by_payment: Record<string, { count: number; total: number }>;
    gallons_by_type: Record<string, number>;
    expenses: { label: string; total: number }[];
    transactions: {
        sale_number: string;
        customer_name: string;
        total_amount: number;
        payment_method: string;
        time: string;
    }[];
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const GALLON_LABELS: Record<string, string> = {
    slim_wholesale: 'Slim Wholesale',
    slim_regular: 'Slim Regular',
    slim_commercial: 'Slim Commercial',
};

const PAYMENT_STYLES: Record<string, string> = {
    cash: 'bg-emerald-100 text-emerald-700',
    gcash: 'bg-blue-100 text-blue-700',
    card: 'bg-violet-100 text-violet-700',
};

export default function ZReportIndex({
    date,
    date_value,
    business,
    summary,
    by_payment,
    gallons_by_type,
    expenses,
    transactions,
}: Props) {
    return (
        <>
            <Head title="Z-Report" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Daily Z-Report</h1>
                        <p className="text-sm text-muted-foreground">End-of-day sales summary</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 print:hidden">
                        <Input
                            type="date"
                            value={date_value}
                            onChange={(e) =>
                                router.get('/z-report', { date: e.target.value }, { replace: true })
                            }
                            className="h-8 w-auto text-sm"
                        />
                        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => window.print()}>
                            <Printer className="size-3.5" /> Print
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Business Header */}
                        <div className="border-b bg-muted/30 px-6 py-5 text-center">
                            <h2 className="text-xl font-bold">{business.name}</h2>
                            {business.address && (
                                <p className="mt-0.5 text-sm text-muted-foreground">{business.address}</p>
                            )}
                            {business.phone && (
                                <p className="text-sm text-muted-foreground">{business.phone}</p>
                            )}
                            <div className="mt-3">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">
                                    DAILY Z-REPORT · {date}
                                </span>
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
                            {[
                                {
                                    label: 'Transactions',
                                    value: summary.total_transactions.toString(),
                                    cls: 'text-foreground',
                                },
                                {
                                    label: 'Gallons Sold',
                                    value: `${summary.total_gallons} gal`,
                                    cls: 'text-cyan-700',
                                },
                                {
                                    label: 'Gross Revenue',
                                    value: fmt(summary.total_revenue),
                                    cls: 'text-blue-700',
                                },
                                {
                                    label: 'Total Discount',
                                    value: fmt(summary.total_discount),
                                    cls: 'text-amber-700',
                                },
                                {
                                    label: 'Total Expenses',
                                    value: fmt(summary.total_expenses),
                                    cls: 'text-red-600',
                                },
                                {
                                    label: 'Net Profit',
                                    value: fmt(summary.net_profit),
                                    cls: summary.net_profit >= 0 ? 'text-emerald-700' : 'text-red-600',
                                },
                            ].map((s) => (
                                <div key={s.label} className="bg-card px-4 py-3 text-center">
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className={`mt-1 text-lg font-bold tabular-nums ${s.cls}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* By Payment Method */}
                        <div className="px-6 py-4">
                            <h3 className="mb-3 text-sm font-semibold">Sales by Payment Method</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="pb-2">Method</th>
                                        <th className="pb-2 text-center">Count</th>
                                        <th className="pb-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {Object.entries(by_payment).map(([method, data]) => (
                                        <tr key={method}>
                                            <td className="py-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STYLES[method] ?? 'bg-muted text-muted-foreground'}`}
                                                >
                                                    {method}
                                                </span>
                                            </td>
                                            <td className="py-2 text-center text-muted-foreground">
                                                {data.count}
                                            </td>
                                            <td className="py-2 text-right font-semibold tabular-nums">
                                                {fmt(data.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t font-bold">
                                        <td className="pt-2">Total</td>
                                        <td className="pt-2 text-center">{summary.total_transactions}</td>
                                        <td className="pt-2 text-right tabular-nums">
                                            {fmt(summary.total_revenue)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Gallons by Type */}
                        {Object.keys(gallons_by_type).length > 0 && (
                            <>
                                <Separator />
                                <div className="px-6 py-4">
                                    <h3 className="mb-3 text-sm font-semibold">Gallons Sold by Type</h3>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y">
                                            {Object.entries(gallons_by_type).map(([type, qty]) => (
                                                <tr key={type}>
                                                    <td className="py-2 text-muted-foreground">
                                                        {GALLON_LABELS[type] ?? type}
                                                    </td>
                                                    <td className="py-2 text-right font-semibold tabular-nums">
                                                        {qty} gal
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Expenses */}
                        {expenses.length > 0 && (
                            <>
                                <Separator />
                                <div className="px-6 py-4">
                                    <h3 className="mb-3 text-sm font-semibold">Expenses</h3>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y">
                                            {expenses.map((e, i) => (
                                                <tr key={i}>
                                                    <td className="py-2 text-muted-foreground">{e.label}</td>
                                                    <td className="py-2 text-right font-semibold tabular-nums text-red-600">
                                                        {fmt(e.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t font-bold text-red-600">
                                                <td className="pt-2">Total Expenses</td>
                                                <td className="pt-2 text-right tabular-nums">
                                                    {fmt(summary.total_expenses)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Transaction Log */}
                        <div className="px-6 py-4">
                            <h3 className="mb-3 text-sm font-semibold">
                                Transaction Log{' '}
                                <span className="font-normal text-muted-foreground">
                                    ({transactions.length})
                                </span>
                            </h3>
                            {transactions.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    No transactions for this date.
                                </p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="pb-2">Time</th>
                                            <th className="pb-2">Sale #</th>
                                            <th className="pb-2">Customer</th>
                                            <th className="pb-2">Method</th>
                                            <th className="pb-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-xs">
                                        {transactions.map((t, i) => (
                                            <tr key={i}>
                                                <td className="py-2 text-muted-foreground">{t.time}</td>
                                                <td className="py-2 font-mono font-medium text-blue-700">
                                                    {t.sale_number}
                                                </td>
                                                <td className="py-2">{t.customer_name}</td>
                                                <td className="py-2 capitalize text-muted-foreground">
                                                    {t.payment_method}
                                                </td>
                                                <td className="py-2 text-right font-semibold tabular-nums">
                                                    {fmt(t.total_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="border-t bg-muted/20 px-6 py-3 text-center text-xs text-muted-foreground">
                            — End of Report —
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ZReportIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Z-Report', href: '/z-report' },
    ],
};
