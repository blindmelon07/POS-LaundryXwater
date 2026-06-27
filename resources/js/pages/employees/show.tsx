import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface SalaryRecord {
    id: number;
    period_label: string;
    period_month: number;
    period_year: number;
    base_salary: number;
    bonus: number;
    deductions: number;
    net_salary: number;
    payment_date: string | null;
    payment_method: string;
    status: string;
    notes: string | null;
    processed_by: string | null;
}

interface EmployeeDetail {
    id: number;
    name: string;
    position: string;
    phone: string | null;
    address: string | null;
    hire_date: string | null;
    base_salary: number;
    is_active: boolean;
    notes: string | null;
}

interface Props {
    employee: EmployeeDetail;
    salary_records: SalaryRecord[];
    total_paid: number;
    months: Record<number, string>;
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const PAYMENT_STYLES: Record<string, string> = {
    cash: 'bg-emerald-100 text-emerald-700',
    gcash: 'bg-blue-100 text-blue-700',
    bank: 'bg-violet-100 text-violet-700',
};

function SalaryForm({
    employee,
    months,
    onClose,
}: {
    employee: EmployeeDetail;
    months: Record<number, string>;
    onClose: () => void;
}) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear  = new Date().getFullYear();

    const { data, setData, post, processing, errors } = useForm({
        period_month:   currentMonth.toString(),
        period_year:    currentYear.toString(),
        base_salary:    employee.base_salary.toString(),
        bonus:          '0',
        deductions:     '0',
        payment_date:   new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        status:         'paid',
        notes:          '',
    });

    const base       = parseFloat(data.base_salary) || 0;
    const bonus      = parseFloat(data.bonus) || 0;
    const deductions = parseFloat(data.deductions) || 0;
    const net        = base + bonus - deductions;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/employees/${employee.id}/salary`, { onSuccess: onClose });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Period */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Month</Label>
                    <Select value={data.period_month} onValueChange={(v) => setData('period_month', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(months).map(([num, name]) => (
                                <SelectItem key={num} value={num}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Year</Label>
                    <Input className="mt-1" type="number" min={2020} max={2099}
                        value={data.period_year} onChange={(e) => setData('period_year', e.target.value)} />
                </div>
            </div>

            {/* Salary breakdown */}
            <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Salary Breakdown</p>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <Label>Base Salary (₱)</Label>
                        <Input className="mt-1" type="number" min={0} step="0.01"
                            value={data.base_salary} onChange={(e) => setData('base_salary', e.target.value)} />
                        {errors.base_salary && <p className="mt-1 text-xs text-destructive">{errors.base_salary}</p>}
                    </div>
                    <div>
                        <Label>Bonus (₱)</Label>
                        <Input className="mt-1" type="number" min={0} step="0.01"
                            value={data.bonus} onChange={(e) => setData('bonus', e.target.value)}
                            placeholder="0.00" />
                    </div>
                    <div>
                        <Label>Deductions (₱)</Label>
                        <Input className="mt-1" type="number" min={0} step="0.01"
                            value={data.deductions} onChange={(e) => setData('deductions', e.target.value)}
                            placeholder="0.00" />
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-violet-50 px-4 py-2.5">
                    <span className="font-semibold text-violet-900">Net Salary</span>
                    <span className="text-xl font-black tabular-nums text-violet-700">{fmt(net)}</span>
                </div>
            </div>

            {/* Payment */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Payment Date</Label>
                    <Input className="mt-1" type="date" value={data.payment_date}
                        onChange={(e) => setData('payment_date', e.target.value)} />
                </div>
                <div>
                    <Label>Payment Method</Label>
                    <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="gcash">GCash</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Status</Label>
                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                    <Input className="mt-1" value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)} placeholder="e.g. Mid-month advance" />
                </div>
            </div>

            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    {processing ? 'Saving…' : 'Save Salary Record'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

export default function EmployeeShow({ employee, salary_records, total_paid, months }: Props) {
    const [showSalary, setShowSalary] = useState(false);

    const deleteSalary = (id: number, label: string) => {
        if (confirm(`Delete salary record for ${label}?`)) {
            router.delete(`/salary-records/${id}`);
        }
    };

    return (
        <>
            <Head title={employee.name} />
            <div className="mx-auto max-w-4xl p-4 md:p-6">
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                    <Link href="/employees">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <ArrowLeft className="size-4" /> Back
                        </Button>
                    </Link>
                    <div className="flex flex-1 items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                            {initials(employee.name)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{employee.name}</h1>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${employee.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => setShowSalary(true)}>
                        <Plus className="size-4" /> Add Salary
                    </Button>
                </div>

                {/* Info + Stats */}
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Employee Info</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 text-sm">
                            {employee.phone && <p className="text-muted-foreground">📞 {employee.phone}</p>}
                            {employee.address && <p className="text-muted-foreground">📍 {employee.address}</p>}
                            {employee.hire_date && <p className="text-muted-foreground">📅 Hired: {employee.hire_date}</p>}
                            {employee.notes && <><Separator /><p className="text-xs text-muted-foreground">{employee.notes}</p></>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Salary Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-xl bg-violet-50 p-3">
                                <p className="text-xs text-muted-foreground">Base Salary</p>
                                <p className="mt-1 text-lg font-bold text-violet-700 tabular-nums">{fmt(employee.base_salary)}</p>
                                <p className="text-[10px] text-muted-foreground">per month</p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3">
                                <p className="text-xs text-muted-foreground">Total Paid</p>
                                <p className="mt-1 text-lg font-bold text-emerald-700 tabular-nums">{fmt(total_paid)}</p>
                                <p className="text-[10px] text-muted-foreground">{salary_records.filter(r => r.status === 'paid').length} records</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Salary Records */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-semibold">Salary Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                        {salary_records.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                                <Clock className="size-8 opacity-20" />
                                <p className="text-sm font-medium">No salary records yet</p>
                                <Button size="sm" className="mt-1 gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => setShowSalary(true)}>
                                    <Plus className="size-4" /> Add First Record
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Period</th>
                                            <th className="px-4 py-3 text-right">Base</th>
                                            <th className="px-4 py-3 text-right">Bonus</th>
                                            <th className="px-4 py-3 text-right">Deductions</th>
                                            <th className="px-4 py-3 text-right">Net</th>
                                            <th className="px-4 py-3">Method</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Date Paid</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {salary_records.map((rec) => (
                                            <tr key={rec.id} className="transition-colors hover:bg-muted/40">
                                                <td className="px-4 py-3 font-semibold">{rec.period_label}</td>
                                                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{fmt(rec.base_salary)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums text-emerald-600">
                                                    {rec.bonus > 0 ? `+${fmt(rec.bonus)}` : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-red-600">
                                                    {rec.deductions > 0 ? `-${fmt(rec.deductions)}` : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums text-violet-700">
                                                    {fmt(rec.net_salary)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STYLES[rec.payment_method] ?? 'bg-muted text-muted-foreground'}`}>
                                                        {rec.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${rec.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {rec.status === 'paid' ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{rec.payment_date ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <Button variant="ghost" size="icon"
                                                        className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => deleteSalary(rec.id, rec.period_label)}>
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 bg-muted/40 font-bold">
                                            <td className="px-4 py-3">Total</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{fmt(salary_records.reduce((s, r) => s + r.base_salary, 0))}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{fmt(salary_records.reduce((s, r) => s + r.bonus, 0))}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-red-600">{fmt(salary_records.reduce((s, r) => s + r.deductions, 0))}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-violet-700">{fmt(salary_records.reduce((s, r) => s + r.net_salary, 0))}</td>
                                            <td colSpan={4} />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showSalary} onOpenChange={setShowSalary}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Salary Record — {employee.name}</DialogTitle></DialogHeader>
                    <SalaryForm employee={employee} months={months} onClose={() => setShowSalary(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
}

EmployeeShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: 'Salary Records', href: '#' },
    ],
};
