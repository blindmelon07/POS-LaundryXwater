import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, Pencil, Phone, Plus, Trash2, UserCheck, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Employee {
    id: number;
    user_id: number | null;
    user_name: string | null;
    name: string;
    position: string;
    phone: string | null;
    base_salary: number;
    hire_date: string | null;
    is_active: boolean;
    salary_records_count: number;
}

interface AvailableUser { id: number; name: string; email: string; }

interface Props {
    employees: Employee[];
    summary: { total: number; active: number; monthly: number };
    available_users: AvailableUser[];
}

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
function avatarColor(name: string) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function EmployeeForm({
    employee,
    availableUsers,
    onClose,
}: {
    employee?: Employee;
    availableUsers: AvailableUser[];
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        user_id:     employee?.user_id?.toString() ?? '',
        name:        employee?.name ?? '',
        position:    employee?.position ?? '',
        phone:       employee?.phone ?? '',
        address:     '',
        hire_date:   '',
        base_salary: employee?.base_salary?.toString() ?? '',
        is_active:   employee?.is_active ?? true,
        notes:       '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (employee) {
            put(`/employees/${employee.id}`, { onSuccess: onClose });
        } else {
            post('/employees', { onSuccess: onClose });
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Link to system user account */}
            <div className="rounded-lg border bg-blue-50 p-3">
                <p className="mb-1.5 text-xs font-semibold text-blue-800">
                    Link to System Account <span className="font-normal text-muted-foreground">(optional)</span>
                </p>
                <Select
                    value={data.user_id || 'none'}
                    onValueChange={(v) => setData('user_id', v === 'none' ? '' : v)}
                >
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select user account…" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">
                            <span className="italic text-muted-foreground">No linked account</span>
                        </SelectItem>
                        {/* Show current linked user even if not in available_users */}
                        {employee?.user_id && employee?.user_name && !availableUsers.find(u => u.id === employee.user_id) && (
                            <SelectItem value={employee.user_id.toString()}>
                                {employee.user_name} (current)
                            </SelectItem>
                        )}
                        {availableUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id.toString()}>
                                {u.name}
                                <span className="ml-1.5 text-xs text-muted-foreground">{u.email}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {data.user_id && (
                    <p className="mt-1 text-[11px] text-blue-700">
                        This employee will be linked to that user account — salary info will show on the Users page.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <Label>Full Name</Label>
                    <Input className="mt-1" value={data.name}
                        onChange={(e) => setData('name', e.target.value)} placeholder="Juan dela Cruz" />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                    <Label>Position / Role</Label>
                    <Input className="mt-1" value={data.position}
                        onChange={(e) => setData('position', e.target.value)} placeholder="e.g. Cashier, Rider" />
                    {errors.position && <p className="mt-1 text-xs text-destructive">{errors.position}</p>}
                </div>
                <div>
                    <Label>Phone</Label>
                    <Input className="mt-1" value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)} placeholder="09xx-xxx-xxxx" />
                </div>
                <div>
                    <Label>Base Salary (₱ / month)</Label>
                    <Input className="mt-1" type="number" min={0} step="0.01"
                        value={data.base_salary}
                        onChange={(e) => setData('base_salary', e.target.value)} placeholder="0.00" />
                    {errors.base_salary && <p className="mt-1 text-xs text-destructive">{errors.base_salary}</p>}
                </div>
                <div>
                    <Label>Hire Date <span className="text-muted-foreground">(optional)</span></Label>
                    <Input className="mt-1" type="date" value={data.hire_date}
                        onChange={(e) => setData('hire_date', e.target.value)} />
                </div>
                <div className="col-span-2">
                    <Label>Address <span className="text-muted-foreground">(optional)</span></Label>
                    <Input className="mt-1" value={data.address}
                        onChange={(e) => setData('address', e.target.value)} placeholder="Street, Barangay, City" />
                </div>
                <div className="col-span-2">
                    <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                    <Input className="mt-1" value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)} placeholder="Additional notes" />
                </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <input type="checkbox" id="is_active" checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)} className="size-4 accent-blue-600" />
                <Label htmlFor="is_active" className="cursor-pointer font-normal">Active employee</Label>
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Saving…' : employee ? 'Update Employee' : 'Add Employee'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

export default function EmployeesIndex({ employees, summary, available_users }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

    const deleteEmployee = (id: number, name: string) => {
        if (confirm(`Delete employee "${name}"? This will also delete all salary records.`)) {
            router.delete(`/employees/${id}`);
        }
    };

    return (
        <>
            <Head title="Employees" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Employees', value: summary.total,           icon: Users,     iconClass: 'text-blue-600',    bgClass: 'bg-blue-50'    },
                        { label: 'Active',           value: summary.active,          icon: UserCheck, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
                        { label: 'Monthly Payroll',  value: fmt(summary.monthly),    icon: Wallet,    iconClass: 'text-violet-600',  bgClass: 'bg-violet-50'  },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                        <p className="mt-1.5 text-2xl font-bold">{s.value}</p>
                                    </div>
                                    <div className={`flex size-9 items-center justify-center rounded-xl ${s.bgClass}`}>
                                        <s.icon className={`size-4 ${s.iconClass}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">Employees</h1>
                    <Button size="sm" className="ml-auto gap-1.5" onClick={() => setShowAdd(true)}>
                        <Plus className="size-4" /> Add Employee
                    </Button>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {employees.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <Users className="size-10 opacity-20" />
                                <p className="font-medium">No employees yet</p>
                                <p className="text-sm">Add your first employee to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Employee</th>
                                            <th className="px-4 py-3">Position</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Hired</th>
                                            <th className="px-4 py-3 text-right">Base Salary</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {employees.map((emp) => (
                                            <tr key={emp.id} className={`transition-colors hover:bg-muted/40 ${!emp.is_active ? 'opacity-50' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(emp.name)}`}>
                                                            {initials(emp.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{emp.name}</p>
                                                            {emp.user_name && (
                                                                <p className="text-[10px] text-blue-600 font-medium">
                                                                    🔗 {emp.user_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{emp.position}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {emp.phone ? (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="size-3" /> {emp.phone}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{emp.hire_date ?? '—'}</td>
                                                <td className="px-4 py-3 text-right font-bold tabular-nums text-violet-700">
                                                    {fmt(emp.base_salary)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${emp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                                        {emp.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/employees/${emp.id}`}>
                                                            <Button variant="ghost" size="icon" className="size-7" title="View salary records">
                                                                <Eye className="size-3.5" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="icon" className="size-7"
                                                            onClick={() => setEditEmployee(emp)}>
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon"
                                                            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => deleteEmployee(emp.id, emp.name)}>
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
            </div>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent><DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
                    <EmployeeForm availableUsers={available_users} onClose={() => setShowAdd(false)} />
                </DialogContent>
            </Dialog>
            <Dialog open={!!editEmployee} onOpenChange={(o) => !o && setEditEmployee(null)}>
                <DialogContent><DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>
                    {editEmployee && <EmployeeForm employee={editEmployee} availableUsers={available_users} onClose={() => setEditEmployee(null)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}

EmployeesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
    ],
};
