import { Head, useForm, router } from '@inertiajs/react';
import { FileDown, Pencil, Plus, Receipt, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Expense {
    id: number;
    date: string;
    description: string;
    category: string;
    category_label: string;
    amount: number;
    receipt_number: string | null;
    notes: string | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    expenses: Paginated<Expense>;
    filters: { month?: string; category?: string };
    category_labels: Record<string, string>;
    total_this_month: number;
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const CATEGORY_COLORS: Record<string, string> = {
    round_gallons:  'bg-orange-100 text-orange-700 border border-orange-200',
    slim_gallons:   'bg-cyan-100 text-cyan-700 border border-cyan-200',
    dispenser:      'bg-blue-100 text-blue-700 border border-blue-200',
    electricity:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
    water_bill:     'bg-sky-100 text-sky-700 border border-sky-200',
    salt:           'bg-slate-100 text-slate-600 border border-slate-200',
    filter:         'bg-teal-100 text-teal-700 border border-teal-200',
    salaries:       'bg-violet-100 text-violet-700 border border-violet-200',
    miscellaneous:  'bg-pink-100 text-pink-700 border border-pink-200',
    other_supplies: 'bg-amber-100 text-amber-700 border border-amber-200',
    transportation: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

function ExpenseForm({
    expense,
    categoryLabels,
    onClose,
}: {
    expense?: Expense;
    categoryLabels: Record<string, string>;
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        date: expense?.date
            ? new Date(expense.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        description: expense?.description ?? '',
        category: expense?.category ?? 'miscellaneous',
        amount: expense?.amount?.toString() ?? '',
        receipt_number: expense?.receipt_number ?? '',
        notes: expense?.notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (expense) {
            put(`/expenses/${expense.id}`, { onSuccess: onClose });
        } else {
            post('/expenses', { onSuccess: onClose });
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Date</Label>
                    <Input
                        className="mt-1"
                        type="date"
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                    />
                    {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
                </div>
                <div>
                    <Label>Amount (₱)</Label>
                    <Input
                        className="mt-1"
                        type="number"
                        min={0}
                        step="0.01"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        placeholder="0.00"
                    />
                    {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
                </div>
            </div>
            <div>
                <Label>Description</Label>
                <Input
                    className="mt-1"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="What was this expense for?"
                />
                {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
            </div>
            <div>
                <Label>Category</Label>
                <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Receipt # <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                    className="mt-1"
                    value={data.receipt_number}
                    onChange={(e) => setData('receipt_number', e.target.value)}
                    placeholder="OR-XXXXX"
                />
            </div>
            <div>
                <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                    className="mt-1"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Additional details"
                />
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Saving…' : expense ? 'Update Expense' : 'Add Expense'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function ExpensesIndex({
    expenses,
    filters,
    category_labels,
    total_this_month,
}: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editExpense, setEditExpense] = useState<Expense | null>(null);

    const applyFilter = (key: string, value: string) => {
        router.get(
            '/expenses',
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const deleteExpense = (id: number) => {
        if (confirm('Delete this expense? This cannot be undone.')) {
            router.delete(`/expenses/${id}`);
        }
    };

    return (
        <>
            <Head title="Expenses" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Expenses Tracker</h1>
                        <div className="mt-1 flex items-center gap-2">
                            <Wallet className="size-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">
                                This month total:{' '}
                                <span className="font-bold text-red-600">{fmt(total_this_month)}</span>
                            </span>
                        </div>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                        <Input
                            type="month"
                            value={filters.month ?? ''}
                            onChange={(e) => applyFilter('month', e.target.value)}
                            className="h-8 w-auto text-sm"
                        />
                        <Select
                            value={filters.category ?? 'all'}
                            onValueChange={(v) => applyFilter('category', v === 'all' ? '' : v)}
                        >
                            <SelectTrigger className="h-8 w-44 text-sm">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {Object.entries(category_labels).map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                        {l}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <a href={`/export/expenses${filters.month ? `?month=${filters.month}` : ''}`}>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                <FileDown className="size-3.5" /> Export
                            </Button>
                        </a>
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowAdd(true)}>
                            <Plus className="size-4" /> Add Expense
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {expenses.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <Receipt className="size-10 opacity-20" />
                                <p className="font-medium">No expenses found</p>
                                <p className="text-sm">Try changing your filters or add a new expense</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Receipt #</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {expenses.data.map((e) => (
                                            <tr
                                                key={e.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                                                <td className="px-4 py-3 font-medium">{e.description}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[e.category] ?? 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {e.category_label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                    {e.receipt_number ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums text-red-600">
                                                    {fmt(e.amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            onClick={() => setEditExpense(e)}
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => deleteExpense(e.id)}
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
                {expenses.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {expenses.links.map((link, i) => (
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

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <ExpenseForm categoryLabels={category_labels} onClose={() => setShowAdd(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editExpense} onOpenChange={(o) => !o && setEditExpense(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                    </DialogHeader>
                    {editExpense && (
                        <ExpenseForm
                            expense={editExpense}
                            categoryLabels={category_labels}
                            onClose={() => setEditExpense(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ExpensesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Expenses', href: '/expenses' },
    ],
};
