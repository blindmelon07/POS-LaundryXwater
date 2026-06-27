import { Head, useForm, router } from '@inertiajs/react';
import { AlertTriangle, Boxes, History, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Adjustment {
    type: string;
    quantity: number;
    reason: string;
    user: string | null;
    date: string;
}

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    min_quantity: number | null;
    cost_per_unit: number | null;
    total_value: number;
    is_low_stock: boolean;
    notes: string | null;
    recent_adjustments: Adjustment[];
}

interface Props {
    items: InventoryItem[];
    low_stock_count: number;
    total_value: number;
}

function fmt(n: number) { return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

const DEFAULT_CATEGORIES = ['Detergents', 'Fabric Softeners', 'Bleach & Stain Removers', 'Packaging', 'Equipment', 'Other'];

function ItemForm({ item, onClose }: { item?: InventoryItem; onClose: () => void }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name:          item?.name ?? '',
        category:      item?.category ?? 'Detergents',
        quantity:      item?.quantity?.toString() ?? '0',
        unit:          item?.unit ?? 'pcs',
        min_quantity:  item?.min_quantity?.toString() ?? '',
        cost_per_unit: item?.cost_per_unit?.toString() ?? '',
        notes:         item?.notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item) {
            put(`/laundry/inventory/${item.id}`, { onSuccess: onClose });
        } else {
            post('/laundry/inventory', { onSuccess: onClose });
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <Label>Item Name</Label>
                    <Input className="mt-1" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Ariel Detergent 1kg" />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                    <Label>Category</Label>
                    <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {DEFAULT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Unit</Label>
                    <Input className="mt-1" value={data.unit} onChange={(e) => setData('unit', e.target.value)} placeholder="pcs, kg, L…" />
                </div>
                <div>
                    <Label>Quantity</Label>
                    <Input className="mt-1" type="number" min={0} step="0.01" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} />
                </div>
                <div>
                    <Label>Min Stock Alert</Label>
                    <Input className="mt-1" type="number" min={0} step="0.01" value={data.min_quantity}
                        onChange={(e) => setData('min_quantity', e.target.value)} placeholder="Optional" />
                </div>
                <div className="col-span-2">
                    <Label>Cost per Unit (₱) <span className="text-muted-foreground">(optional)</span></Label>
                    <Input className="mt-1" type="number" min={0} step="0.01" value={data.cost_per_unit}
                        onChange={(e) => setData('cost_per_unit', e.target.value)} placeholder="0.00" />
                </div>
                <div className="col-span-2">
                    <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                    <Input className="mt-1" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Brand, supplier, notes…" />
                </div>
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    {processing ? 'Saving…' : item ? 'Update Item' : 'Add Item'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

function AdjustForm({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({ type: 'add', quantity: '', reason: '' });

    const newQty = data.type === 'adjustment' ? parseFloat(data.quantity) || 0
        : data.type === 'add' ? item.quantity + (parseFloat(data.quantity) || 0)
        : Math.max(0, item.quantity - (parseFloat(data.quantity) || 0));

    return (
        <form onSubmit={(e) => { e.preventDefault(); post(`/laundry/inventory/${item.id}/adjust`, { onSuccess: onClose }); }}
            className="flex flex-col gap-4">
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
                Adjusting <strong>{item.name}</strong> — current: <span className="font-bold">{item.quantity} {item.unit}</span>
            </div>
            <div>
                <Label>Adjustment Type</Label>
                <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="add">Add Stock</SelectItem>
                        <SelectItem value="remove">Remove Stock</SelectItem>
                        <SelectItem value="adjustment">Set to Exact Value</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>{data.type === 'adjustment' ? 'New Quantity' : 'Quantity'}</Label>
                <Input className="mt-1" type="number" min={0} step="0.01" value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)} placeholder="0" />
                {errors.quantity && <p className="mt-1 text-xs text-destructive">{errors.quantity}</p>}
            </div>
            {data.quantity && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">Result:</span>
                    <span className="font-semibold">{item.quantity} {item.unit}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`font-bold ${newQty <= (item.min_quantity ?? 0) ? 'text-red-600' : 'text-emerald-700'}`}>
                        {newQty} {item.unit}
                    </span>
                </div>
            )}
            <div>
                <Label>Reason *</Label>
                <Input className="mt-1" value={data.reason} onChange={(e) => setData('reason', e.target.value)}
                    placeholder="e.g. Purchased from supplier, Used, Physical count" />
                {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason}</p>}
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">{processing ? 'Saving…' : 'Apply Adjustment'}</Button>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

function AdjustmentHistory({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Recent adjustments for <strong>{item.name}</strong></p>
            {item.recent_adjustments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                    <History className="size-8 opacity-20" />
                    <p className="text-sm">No adjustments recorded yet</p>
                </div>
            ) : (
                <div className="flex flex-col divide-y rounded-lg border">
                    {item.recent_adjustments.map((a, i) => (
                        <div key={i} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${a.type === 'add' ? 'bg-emerald-100 text-emerald-700' : a.type === 'remove' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {a.type === 'add' ? <Plus className="size-3" /> : a.type === 'remove' ? <Minus className="size-3" /> : null}
                                    {a.type} {a.quantity} {item.unit}
                                </span>
                                <span className="text-xs text-muted-foreground">{a.date}</span>
                            </div>
                            <p className="mt-1 text-xs">{a.reason}</p>
                            {a.user && <p className="text-xs text-muted-foreground">by {a.user}</p>}
                        </div>
                    ))}
                </div>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
    );
}

export default function LaundryInventoryIndex({ items, low_stock_count, total_value }: Props) {
    const [showAdd, setShowAdd]       = useState(false);
    const [editItem, setEditItem]     = useState<InventoryItem | null>(null);
    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
    const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

    const deleteItem = (id: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) router.delete(`/laundry/inventory/${id}`);
    };

    const grouped = items.reduce<Record<string, InventoryItem[]>>((acc, item) => {
        (acc[item.category] ??= []).push(item);
        return acc;
    }, {});

    return (
        <>
            <Head title="Laundry Inventory" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Laundry Inventory</h1>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Total value: <span className="font-semibold text-foreground">{fmt(total_value)}</span></span>
                            {low_stock_count > 0 && (
                                <span className="flex items-center gap-1 font-semibold text-amber-600">
                                    <AlertTriangle className="size-3.5" />{low_stock_count} low stock
                                </span>
                            )}
                        </div>
                    </div>
                    <Button size="sm" className="ml-auto gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => setShowAdd(true)}>
                        <Plus className="size-4" /> Add Item
                    </Button>
                </div>

                {low_stock_count > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <AlertTriangle className="size-5 shrink-0 text-amber-600" />
                        <p className="text-sm font-medium text-amber-800">
                            {low_stock_count} item{low_stock_count !== 1 ? 's are' : ' is'} running low. Check and restock soon.
                        </p>
                    </div>
                )}

                {Object.entries(grouped).map(([category, categoryItems]) => (
                    <div key={category}>
                        <div className="mb-2.5 flex items-center gap-2">
                            <Boxes className="size-4 text-muted-foreground" />
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</h2>
                        </div>
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                <th className="px-4 py-3">Item</th>
                                                <th className="px-4 py-3">Quantity</th>
                                                <th className="px-4 py-3">Min Stock</th>
                                                <th className="px-4 py-3">Cost/Unit</th>
                                                <th className="px-4 py-3 text-right">Total Value</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {categoryItems.map((item) => (
                                                <tr key={item.id} className={`transition-colors hover:bg-muted/40 ${item.is_low_stock ? 'bg-amber-50/50' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold">{item.name}</p>
                                                        {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`font-bold tabular-nums ${item.is_low_stock ? 'text-amber-700' : ''}`}>
                                                            {item.quantity} {item.unit}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {item.min_quantity != null ? `${item.min_quantity} ${item.unit}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {item.cost_per_unit != null ? fmt(item.cost_per_unit) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                        {item.total_value > 0 ? fmt(item.total_value) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.is_low_stock ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                                <AlertTriangle className="size-3" /> Low
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">OK</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAdjustItem(item)}>Adjust</Button>
                                                            <Button variant="ghost" size="icon" className="size-7" title="History" onClick={() => setHistoryItem(item)}>
                                                                <History className="size-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditItem(item)}>
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => deleteItem(item.id, item.name)}>
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                {items.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                            <Boxes className="size-10 opacity-20" />
                            <p className="font-medium">No inventory items yet</p>
                            <p className="text-sm">Track detergents, softeners, and other laundry supplies</p>
                            <Button size="sm" className="mt-2 gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={() => setShowAdd(true)}>
                                <Plus className="size-4" /> Add Item
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent><DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                    <ItemForm onClose={() => setShowAdd(false)} />
                </DialogContent>
            </Dialog>
            <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
                <DialogContent><DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
                    {editItem && <ItemForm item={editItem} onClose={() => setEditItem(null)} />}
                </DialogContent>
            </Dialog>
            <Dialog open={!!adjustItem} onOpenChange={(o) => !o && setAdjustItem(null)}>
                <DialogContent><DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
                    {adjustItem && <AdjustForm item={adjustItem} onClose={() => setAdjustItem(null)} />}
                </DialogContent>
            </Dialog>
            <Dialog open={!!historyItem} onOpenChange={(o) => !o && setHistoryItem(null)}>
                <DialogContent><DialogHeader><DialogTitle>Adjustment History</DialogTitle></DialogHeader>
                    {historyItem && <AdjustmentHistory item={historyItem} onClose={() => setHistoryItem(null)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}

LaundryInventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laundry Orders', href: '/laundry/orders' },
        { title: 'Laundry Inventory', href: '/laundry/inventory' },
    ],
};
