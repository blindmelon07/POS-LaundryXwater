import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Droplets, MapPin, Phone, Receipt, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Sale {
    id: number;
    sale_number: string;
    sale_date: string;
    total_amount: number;
    payment_method: string;
    total_gallons: number;
}

interface CustomerDetail {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    email: string | null;
    type: string;
    slim_containers: number;
    round_containers: number;
    balance: number;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    total_spent: number;
    total_transactions: number;
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const TYPE_LABELS: Record<string, string> = {
    wholesale: 'Wholesale',
    regular: 'Regular',
    commercial: 'Commercial',
};

const TYPE_STYLES: Record<string, string> = {
    wholesale: 'bg-blue-100 text-blue-700 border border-blue-200',
    regular: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    commercial: 'bg-violet-100 text-violet-700 border border-violet-200',
};

const PAYMENT_STYLES: Record<string, string> = {
    cash: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    gcash: 'bg-blue-100 text-blue-700 border border-blue-200',
    card: 'bg-violet-100 text-violet-700 border border-violet-200',
};

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function CustomerShow({ customer, sales }: { customer: CustomerDetail; sales: Sale[] }) {
    return (
        <>
            <Head title={customer.name} />
            <div className="mx-auto max-w-3xl p-4 md:p-6">
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                    <Link href="/customers">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <ArrowLeft className="size-4" /> Back
                        </Button>
                    </Link>
                    <div className="flex flex-1 items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {initials(customer.name)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{customer.name}</h1>
                            <p className="text-xs text-muted-foreground">
                                Customer since {customer.created_at}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${customer.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}
                    >
                        {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TYPE_STYLES[customer.type] ?? 'bg-muted text-muted-foreground'}`}
                    >
                        {TYPE_LABELS[customer.type] ?? customer.type}
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Contact Info</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2.5 text-sm">
                            {customer.phone && (
                                <p className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="size-4 shrink-0 text-muted-foreground/60" />
                                    {customer.phone}
                                </p>
                            )}
                            {customer.address && (
                                <p className="flex items-start gap-2 text-muted-foreground">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                                    {customer.address}
                                </p>
                            )}
                            {customer.email && (
                                <p className="text-muted-foreground">{customer.email}</p>
                            )}
                            {!customer.phone && !customer.address && !customer.email && (
                                <p className="text-muted-foreground italic">No contact info recorded</p>
                            )}
                            {customer.notes && (
                                <>
                                    <Separator />
                                    <p className="text-xs text-muted-foreground">{customer.notes}</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Summary */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Account Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-xl bg-blue-50 p-3">
                                <p className="text-xs text-muted-foreground">Total Spent</p>
                                <p className="mt-1 text-lg font-bold text-blue-700 tabular-nums">
                                    {fmt(customer.total_spent)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Transactions</p>
                                <p className="mt-1 text-lg font-bold tabular-nums">
                                    {customer.total_transactions}
                                </p>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-3">
                                <p className="text-xs text-muted-foreground">Slim Containers Out</p>
                                <p className="mt-1 text-lg font-bold text-amber-700">
                                    {customer.slim_containers}
                                </p>
                            </div>
                            <div className="rounded-xl bg-orange-50 p-3">
                                <p className="text-xs text-muted-foreground">Round Containers Out</p>
                                <p className="mt-1 text-lg font-bold text-orange-700">
                                    {customer.round_containers}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Purchase History */}
                <Card className="mt-4 overflow-hidden">
                    <CardHeader className="pb-1">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <ShoppingBag className="size-4" /> Purchase History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                        {sales.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                                <ShoppingBag className="size-8 opacity-20" />
                                <p className="text-sm font-medium">No purchases yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Sale #</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Gallons</th>
                                            <th className="px-4 py-3">Payment</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {sales.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                                                    {s.sale_number}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {s.sale_date}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-1">
                                                        <Droplets className="size-3 text-cyan-500" />
                                                        {s.total_gallons} gal
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STYLES[s.payment_method] ?? 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {s.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums">
                                                    {fmt(s.total_amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link href={`/sales/${s.id}`}>
                                                        <Button variant="ghost" size="icon" className="size-7">
                                                            <Receipt className="size-3.5" />
                                                        </Button>
                                                    </Link>
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
        </>
    );
}

CustomerShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/customers' },
        { title: 'Profile', href: '#' },
    ],
};
