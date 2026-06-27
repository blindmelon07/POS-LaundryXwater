import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Service {
    id: number;
    name: string;
    type: string;
    price: number;
    unit: string;
    is_active: boolean;
    notes: string | null;
}

interface Props {
    services: Service[];
    type_labels: Record<string, string>;
}

function fmt(n: number) { return '₱' + n.toFixed(2); }

const TYPE_BADGE: Record<string, string> = {
    wash_dry:  'bg-violet-100 text-violet-700 border border-violet-200',
    wash_only: 'bg-blue-100 text-blue-700 border border-blue-200',
    dry_only:  'bg-cyan-100 text-cyan-700 border border-cyan-200',
    fold:      'bg-amber-100 text-amber-700 border border-amber-200',
    press:     'bg-orange-100 text-orange-700 border border-orange-200',
    other:     'bg-slate-100 text-slate-600 border border-slate-200',
};

function ServiceForm({ service, typeLabels, onClose }: { service?: Service; typeLabels: Record<string, string>; onClose: () => void }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name:      service?.name ?? '',
        type:      service?.type ?? 'wash_dry',
        price:     service?.price?.toString() ?? '',
        unit:      service?.unit ?? 'per kg',
        is_active: service?.is_active ?? true,
        notes:     service?.notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (service) {
            put(`/laundry/services/${service.id}`, { onSuccess: onClose });
        } else {
            post('/laundry/services', { onSuccess: onClose });
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
                <Label>Service Name</Label>
                <Input className="mt-1" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Wash & Dry" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
                <Label>Type</Label>
                <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(typeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Price (₱)</Label>
                    <Input className="mt-1" type="number" min={0} step="0.01" value={data.price}
                        onChange={(e) => setData('price', e.target.value)} placeholder="0.00" />
                    {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price}</p>}
                </div>
                <div>
                    <Label>Unit</Label>
                    <Select value={data.unit} onValueChange={(v) => setData('unit', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="per kg">Per kg</SelectItem>
                            <SelectItem value="per piece">Per piece</SelectItem>
                            <SelectItem value="per load">Per load</SelectItem>
                            <SelectItem value="per set">Per set</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                <Input className="mt-1" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="e.g. Includes fabric softener" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <input type="checkbox" id="is_active" checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)} className="size-4 accent-violet-600" />
                <Label htmlFor="is_active" className="cursor-pointer font-normal">Active — available when creating orders</Label>
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    {processing ? 'Saving…' : service ? 'Update Service' : 'Add Service'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

export default function LaundryServicesIndex({ services, type_labels }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editService, setEditService] = useState<Service | null>(null);

    const deleteService = (id: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) {
            fetch(`/laundry/services/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content ?? '' },
            }).then(() => window.location.reload());
        }
    };

    return (
        <>
            <Head title="Laundry Services" />
            <div className="flex flex-col gap-5 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Services & Pricing</h1>
                        <p className="text-sm text-muted-foreground">{services.length} services configured</p>
                    </div>
                    <Button size="sm" className="ml-auto gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => setShowAdd(true)}>
                        <Plus className="size-4" /> Add Service
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {services.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                <ShoppingBag className="size-10 opacity-20" />
                                <p className="font-medium">No services yet</p>
                                <p className="text-sm">Add your laundry services and pricing</p>
                                <Button size="sm" className="mt-2 gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => setShowAdd(true)}>
                                    <Plus className="size-4" /> Add Service
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            <th className="px-4 py-3">Service</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Price</th>
                                            <th className="px-4 py-3">Unit</th>
                                            <th className="px-4 py-3">Notes</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {services.map((s) => (
                                            <tr key={s.id} className={`transition-colors hover:bg-muted/40 ${!s.is_active ? 'opacity-50' : ''}`}>
                                                <td className="px-4 py-3 font-semibold">{s.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[s.type] ?? 'bg-muted text-muted-foreground'}`}>
                                                        {type_labels[s.type] ?? s.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold tabular-nums text-violet-700">{fmt(s.price)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{s.unit}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{s.notes ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                                        {s.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditService(s)}>
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => deleteService(s.id, s.name)}>
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
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
                    <ServiceForm typeLabels={type_labels} onClose={() => setShowAdd(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editService} onOpenChange={(o) => !o && setEditService(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
                    {editService && <ServiceForm service={editService} typeLabels={type_labels} onClose={() => setEditService(null)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}

LaundryServicesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laundry Orders', href: '/laundry/orders' },
        { title: 'Services & Pricing', href: '/laundry/services' },
    ],
};
