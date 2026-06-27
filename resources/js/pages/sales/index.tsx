import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileDown, Receipt, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Sale {
    id: number;
    sale_number: string;
    customer_name: string | null;
    sale_date: string;
    total_amount: number;
    payment_method: string;
    total_gallons: number;
    items_count: number;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    sales: Paginated<Sale>;
    filters: { date?: string; month?: string; payment_method?: string };
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const PAYMENT_STYLES: Record<string, string> = {
    cash: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    gcash: 'bg-blue-100 text-blue-700 border border-blue-200',
    card: 'bg-violet-100 text-violet-700 border border-violet-200',
};

export default function SalesIndex({ sales, filters }: Props) {
    const applyFilter = (key: string, value: string) => {
        router.get('/sales', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    const deleteSale = (id: number, saleNum: string) => {
        if (confirm(`Delete sale ${saleNum}? This cannot be undone.`)) {
            router.delete(`/sales/${id}`);
        }
    };

    const exportParams = new URLSearchParams();
    if (filters.date) exportParams.set('date', filters.date);
    if (filters.month) exportParams.set('month', filters.month);
    if (filters.payment_method) exportParams.set('payment_method', filters.payment_method);

    return (
        <>
            <Head title="Sales History" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Sales History</h1>
                        <p className="text-sm text-muted-foreground">
                            {sales.total} total record{sales.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                        <Input
                            type="date"
                            value={filters.date ?? ''}
                            onChange={(e) => applyFilter('date', e.target.value)}
                            className="h-8 w-auto text-sm"
                        />
                        <Input
                            type="month"
                            value={filters.month ?? ''}
                            onChange={(e) => applyFilter('month', e.target.value)}
                            className="h-8 w-auto text-sm"
                        />
                        <Select
                            value={filters.payment_method ?? 'all'}
                            onValueChange={(v) => applyFilter('payment_method', v === 'all' ? '' : v)}
                        >
                            <SelectTrigger className="h-8 w-32 text-sm">
                                <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="gcash">GCash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                            </SelectContent>
                        </Select>
                        <a href={`/export/sales?${exportParams.toString()}`}>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                <FileDown className="size-3.5" /> Export
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {sales.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <Receipt className="size-10 opacity-20" />
                                <p className="font-medium">No sales found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Sale #</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Items</th>
                                            <th className="px-4 py-3">Gallons</th>
                                            <th className="px-4 py-3">Payment</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {sales.data.map((sale) => (
                                            <tr
                                                key={sale.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                                                    {sale.sale_number}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {sale.customer_name ?? (
                                                        <span className="text-muted-foreground italic">Walk-in</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{sale.sale_date}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{sale.items_count}</td>
                                                <td className="px-4 py-3 font-medium">{sale.total_gallons} gal</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STYLES[sale.payment_method] ?? 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {sale.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums">
                                                    {fmt(sale.total_amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/sales/${sale.id}`}>
                                                            <Button variant="ghost" size="icon" className="size-7">
                                                                <Eye className="size-3.5" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => deleteSale(sale.id, sale.sale_number)}
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

                {/* Pagination */}
                {sales.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {sales.links.map((link, i) => (
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
        </>
    );
}

SalesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sales History', href: '/sales' },
    ],
};
