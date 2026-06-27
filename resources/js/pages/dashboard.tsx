import { Head, Link } from '@inertiajs/react';
import { BarChart3, Droplets, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

interface Stats {
    today_revenue: number;
    today_transactions: number;
    today_gallons: number;
    today_net_profit: number;
    month_revenue: number;
    month_expenses: number;
    month_net_profit: number;
    month_gallons: number;
}

interface RecentSale {
    id: number;
    sale_number: string;
    customer_name: string | null;
    sale_date: string;
    total_amount: number;
    payment_method: string;
    total_gallons: number;
}

interface ChartDay {
    date: string;
    revenue: number;
    expenses: number;
}

interface Props {
    stats: Stats;
    recent_sales: RecentSale[];
    chart_data: ChartDay[];
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    iconClass,
    bgClass,
}: {
    title: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    iconClass: string;
    bgClass: string;
}) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
                        <p className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
                        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
                    </div>
                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
                        <Icon className={`size-5 ${iconClass}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const PAYMENT_STYLES: Record<string, string> = {
    cash: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    gcash: 'bg-blue-100 text-blue-700 border border-blue-200',
    card: 'bg-violet-100 text-violet-700 border border-violet-200',
};

function SectionHeader({ label, color }: { label: string; color: string }) {
    return (
        <div className="mb-4 flex items-center gap-2.5">
            <div className={`h-4 w-1 rounded-full ${color}`} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h2>
        </div>
    );
}

export default function Dashboard({ stats, recent_sales, chart_data }: Props) {
    const maxRevenue = Math.max(...chart_data.map((d) => Math.max(d.revenue, d.expenses)), 1);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-8 p-4 md:p-6">
                {/* Today's Stats */}
                <div>
                    <SectionHeader label="Today's Performance" color="bg-blue-600" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Revenue"
                            value={fmt(stats.today_revenue)}
                            sub={`${stats.today_transactions} transactions`}
                            icon={Receipt}
                            iconClass="text-blue-600"
                            bgClass="bg-blue-50"
                        />
                        <StatCard
                            title="Gallons Sold"
                            value={`${stats.today_gallons} gal`}
                            sub="Water refills"
                            icon={Droplets}
                            iconClass="text-cyan-600"
                            bgClass="bg-cyan-50"
                        />
                        <StatCard
                            title="Net Profit"
                            value={fmt(stats.today_net_profit)}
                            sub="After all expenses"
                            icon={stats.today_net_profit >= 0 ? TrendingUp : TrendingDown}
                            iconClass={stats.today_net_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}
                            bgClass={stats.today_net_profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
                        />
                        <StatCard
                            title="Month Gallons"
                            value={`${stats.month_gallons} gal`}
                            sub="This month total"
                            icon={Droplets}
                            iconClass="text-indigo-600"
                            bgClass="bg-indigo-50"
                        />
                    </div>
                </div>

                {/* Monthly Stats */}
                <div>
                    <SectionHeader label="This Month" color="bg-violet-600" />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard
                            title="Month Revenue"
                            value={fmt(stats.month_revenue)}
                            icon={Wallet}
                            iconClass="text-violet-600"
                            bgClass="bg-violet-50"
                        />
                        <StatCard
                            title="Month Expenses"
                            value={fmt(stats.month_expenses)}
                            icon={Wallet}
                            iconClass="text-red-600"
                            bgClass="bg-red-50"
                        />
                        <StatCard
                            title="Month Net Profit"
                            value={fmt(stats.month_net_profit)}
                            icon={BarChart3}
                            iconClass={stats.month_net_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}
                            bgClass={stats.month_net_profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
                        />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 7-Day Revenue Chart */}
                    <Card>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold text-foreground">Last 7 Days — Revenue vs Expenses</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                            <div className="flex items-end gap-1" style={{ height: 160 }}>
                                {chart_data.map((day) => (
                                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                                        <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 130 }}>
                                            <div
                                                className="group relative w-5 min-w-0 rounded-t-sm bg-blue-500 transition-all duration-200 hover:bg-blue-600"
                                                style={{
                                                    height: `${(day.revenue / maxRevenue) * 100}%`,
                                                    minHeight: day.revenue > 0 ? 4 : 0,
                                                }}
                                                title={`Revenue: ${fmt(day.revenue)}`}
                                            />
                                            <div
                                                className="group relative w-5 min-w-0 rounded-t-sm bg-red-400 transition-all duration-200 hover:bg-red-500"
                                                style={{
                                                    height: `${(day.expenses / maxRevenue) * 100}%`,
                                                    minHeight: day.expenses > 0 ? 4 : 0,
                                                }}
                                                title={`Expenses: ${fmt(day.expenses)}`}
                                            />
                                        </div>
                                        <span className="text-[9px] font-medium text-muted-foreground">{day.date}</span>
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

                    {/* Recent Sales */}
                    <Card>
                        <CardHeader className="pb-1">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground">Recent Sales</CardTitle>
                                <Link href="/sales" className="text-xs text-blue-600 hover:underline">
                                    View all
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 pt-2">
                            {recent_sales.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                                    <Receipt className="size-8 opacity-25" />
                                    <p className="text-sm font-medium">No sales today yet</p>
                                    <p className="text-xs">Sales will appear here once processed</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recent_sales.map((sale) => (
                                        <div
                                            key={sale.id}
                                            className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/40"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">{sale.sale_number}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sale.customer_name ?? 'Walk-in'} · {sale.total_gallons} gal
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STYLES[sale.payment_method] ?? 'bg-muted text-muted-foreground'}`}
                                                >
                                                    {sale.payment_method}
                                                </span>
                                                <span className="text-sm font-bold tabular-nums">
                                                    {fmt(sale.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
