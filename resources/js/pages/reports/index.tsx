import { Head, router } from '@inertiajs/react';
import { BarChart3, Droplets, FileDown, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface MonthData {
    month: string;
    month_num: number;
    revenue: number;
    expenses: number;
    gross_profit: number;
    margin: number;
    gallons: number;
    transactions: number;
}

interface Totals {
    revenue: number;
    expenses: number;
    profit: number;
    gallons: number;
    margin: number;
}

interface Props {
    months: MonthData[];
    year: number;
    available_years: number[];
    totals: Totals;
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function pct(n: number) {
    return n.toFixed(1) + '%';
}

export default function ReportsIndex({ months, year, available_years, totals }: Props) {
    const maxValue = Math.max(...months.map((m) => Math.max(m.revenue, m.expenses)), 1);

    const summaryCards = [
        {
            label: 'Full Year Revenue',
            value: fmt(totals.revenue),
            icon: Wallet,
            iconClass: 'text-blue-600',
            bgClass: 'bg-blue-50',
        },
        {
            label: 'Full Year Expenses',
            value: fmt(totals.expenses),
            icon: Wallet,
            iconClass: 'text-red-600',
            bgClass: 'bg-red-50',
        },
        {
            label: 'Full Year Profit',
            value: fmt(totals.profit),
            icon: totals.profit >= 0 ? TrendingUp : TrendingDown,
            iconClass: totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600',
            bgClass: totals.profit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
        },
        {
            label: 'Profit Margin',
            value: pct(totals.margin),
            icon: BarChart3,
            iconClass: 'text-violet-600',
            bgClass: 'bg-violet-50',
        },
        {
            label: 'Total Gallons',
            value: `${totals.gallons} gal`,
            icon: Droplets,
            iconClass: 'text-cyan-600',
            bgClass: 'bg-cyan-50',
        },
    ];

    return (
        <>
            <Head title="Reports" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Performance Report</h1>
                        <p className="text-sm text-muted-foreground">Annual financial overview</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <a href={`/export/report?year=${year}`}>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                <FileDown className="size-3.5" /> Export CSV
                            </Button>
                        </a>
                        <Select
                            value={year.toString()}
                            onValueChange={(v) =>
                                router.get('/reports', { year: v }, { replace: true })
                            }
                        >
                            <SelectTrigger className="h-8 w-28 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {available_years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Annual Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {summaryCards.map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                        <p className="mt-1.5 text-lg font-bold tracking-tight">{s.value}</p>
                                    </div>
                                    <div
                                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${s.bgClass}`}
                                    >
                                        <s.icon className={`size-4 ${s.iconClass}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bar Chart */}
                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold">
                            Monthly Revenue vs Expenses — {year}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                        <div className="flex items-end gap-1" style={{ height: 180 }}>
                            {months.map((m) => (
                                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                                    <div
                                        className="flex w-full items-end justify-center gap-0.5"
                                        style={{ height: 150 }}
                                    >
                                        <div
                                            className="w-5 rounded-t-sm bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                                            style={{
                                                height: `${(m.revenue / maxValue) * 100}%`,
                                                minHeight: m.revenue > 0 ? 4 : 0,
                                            }}
                                            title={`${m.month} Revenue: ${fmt(m.revenue)}`}
                                        />
                                        <div
                                            className="w-5 rounded-t-sm bg-red-400 transition-all duration-300 hover:bg-red-500"
                                            style={{
                                                height: `${(m.expenses / maxValue) * 100}%`,
                                                minHeight: m.expenses > 0 ? 4 : 0,
                                            }}
                                            title={`${m.month} Expenses: ${fmt(m.expenses)}`}
                                        />
                                    </div>
                                    <span className="text-[9px] font-medium text-muted-foreground">
                                        {m.month.slice(0, 3)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block size-2.5 rounded-sm bg-blue-500" /> Revenue
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block size-2.5 rounded-sm bg-red-400" /> Expenses
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Breakdown Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold">Monthly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <th className="px-4 py-3 text-left">Month</th>
                                        <th className="px-4 py-3">Revenue</th>
                                        <th className="px-4 py-3">Expenses</th>
                                        <th className="px-4 py-3">Gross Profit</th>
                                        <th className="px-4 py-3">Margin</th>
                                        <th className="px-4 py-3">Gallons</th>
                                        <th className="px-4 py-3">Transactions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {months.map((m) => (
                                        <tr key={m.month} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3 font-semibold">{m.month}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-blue-700">
                                                {m.revenue > 0 ? fmt(m.revenue) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-red-600">
                                                {m.expenses > 0 ? fmt(m.expenses) : '—'}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right font-semibold tabular-nums ${m.gross_profit < 0 ? 'text-red-600' : m.gross_profit > 0 ? 'text-emerald-700' : 'text-muted-foreground'}`}
                                            >
                                                {m.revenue > 0 || m.expenses > 0 ? fmt(m.gross_profit) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                {m.revenue > 0 ? pct(m.margin) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {m.gallons > 0 ? `${m.gallons} gal` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                {m.transactions > 0 ? m.transactions : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 bg-muted/40 font-bold">
                                        <td className="px-4 py-3">Full Year</td>
                                        <td className="px-4 py-3 text-right tabular-nums text-blue-700">
                                            {fmt(totals.revenue)}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-red-600">
                                            {fmt(totals.expenses)}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right tabular-nums ${totals.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}
                                        >
                                            {fmt(totals.profit)}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                            {pct(totals.margin)}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {totals.gallons} gal
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/reports' },
    ],
};
