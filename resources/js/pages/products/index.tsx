import { Head, useForm } from '@inertiajs/react';
import { Droplets, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
    id: number;
    name: string;
    type: string;
    type_label: string;
    price: number;
    unit: string;
    notes: string | null;
    is_active: boolean;
    promo_buy: number | null;
    promo_get: number | null;
}

interface Props {
    products: Product[];
    type_labels: Record<string, string>;
}

function fmt(n: number) {
    return '₱' + n.toFixed(2);
}

const TYPE_BADGE: Record<string, string> = {
    slim_wholesale: 'bg-blue-100 text-blue-700 border border-blue-200',
    slim_regular: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
    slim_commercial: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    container_slim: 'bg-amber-100 text-amber-700 border border-amber-200',
    container_round: 'bg-orange-100 text-orange-700 border border-orange-200',
    delivery: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    other: 'bg-slate-100 text-slate-600 border border-slate-200',
};

function ProductForm({
    product,
    typeLabels,
    onClose,
}: {
    product?: Product;
    typeLabels: Record<string, string>;
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        name:      product?.name ?? '',
        type:      product?.type ?? 'slim_wholesale',
        price:     product?.price?.toString() ?? '',
        unit:      product?.unit ?? 'Per gallon',
        notes:     product?.notes ?? '',
        is_active: product?.is_active ?? true,
        promo_buy: product?.promo_buy?.toString() ?? '',
        promo_get: product?.promo_get?.toString() ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product) {
            put(`/products/${product.id}`, { onSuccess: onClose });
        } else {
            post('/products', { onSuccess: onClose });
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
                <Label>Product Name</Label>
                <Input
                    className="mt-1"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Slim Regular Refill"
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
                <Label>Type</Label>
                <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Price (₱)</Label>
                    <Input
                        className="mt-1"
                        type="number"
                        min={0}
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        placeholder="0.00"
                    />
                    {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price}</p>}
                </div>
                <div>
                    <Label>Unit</Label>
                    <Input
                        className="mt-1"
                        value={data.unit}
                        onChange={(e) => setData('unit', e.target.value)}
                        placeholder="Per gallon"
                    />
                </div>
            </div>
            <div>
                <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                    className="mt-1"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Any additional info"
                />
            </div>
            {/* Promo Rule */}
            <div className="rounded-lg border bg-amber-50 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-800">
                    Free Gallon Promo <span className="font-normal text-muted-foreground">(optional)</span>
                </p>
                <p className="mb-2 text-[11px] text-amber-700">
                    Every sale of this product automatically includes free gallons — regardless of quantity ordered.
                </p>
                <div className="flex items-center gap-3">
                    <div className="w-32">
                        <Label className="text-xs">Free gallons to add</Label>
                        <Input
                            className="mt-1 h-8 text-sm"
                            type="number"
                            min={1}
                            value={data.promo_get}
                            onChange={(e) => setData('promo_get', e.target.value)}
                            placeholder="e.g. 1"
                        />
                    </div>
                    {data.promo_get && (
                        <p className="mt-4 text-[11px] text-amber-700">
                            → +{data.promo_get} free gallon{parseInt(data.promo_get) > 1 ? 's' : ''} auto-added on every sale
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="size-4 accent-blue-600"
                />
                <Label htmlFor="is_active" className="cursor-pointer font-normal">
                    Active — visible on POS terminal
                </Label>
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Saving…' : product ? 'Update Product' : 'Add Product'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function ProductsIndex({ products, type_labels }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const deleteProduct = (id: number, name: string) => {
        if (confirm(`Delete "${name}"? This cannot be undone.`)) {
            fetch(`/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content ?? '',
                },
            }).then(() => window.location.reload());
        }
    };

    const waterProducts = products.filter((p) =>
        ['slim_wholesale', 'slim_regular', 'slim_commercial'].includes(p.type),
    );
    const otherProducts = products.filter(
        (p) => !['slim_wholesale', 'slim_regular', 'slim_commercial'].includes(p.type),
    );

    const renderTable = (items: Product[]) => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Promo</th>
                        <th className="px-4 py-3">Notes</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {items.map((p) => (
                        <tr
                            key={p.id}
                            className={`transition-colors hover:bg-muted/40 ${!p.is_active ? 'opacity-50' : ''}`}
                        >
                            <td className="px-4 py-3 font-semibold">{p.name}</td>
                            <td className="px-4 py-3">
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[p.type] ?? 'bg-muted text-muted-foreground'}`}
                                >
                                    {p.type_label}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-bold tabular-nums text-blue-700">{fmt(p.price)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{p.unit}</td>
                            <td className="px-4 py-3">
                                {p.promo_get ? (
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                        +{p.promo_get} free
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{p.notes ?? '—'}</td>
                            <td className="px-4 py-3">
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}
                                >
                                    {p.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={() => setEditProduct(p)}
                                    >
                                        <Pencil className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => deleteProduct(p.id, p.name)}
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
    );

    return (
        <>
            <Head title="Products" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Products & Price List</h1>
                        <p className="text-sm text-muted-foreground">{products.length} products configured</p>
                    </div>
                    <Button size="sm" className="ml-auto gap-1.5" onClick={() => setShowAdd(true)}>
                        <Plus className="size-4" /> Add Product
                    </Button>
                </div>

                {/* Water Refill Products */}
                {waterProducts.length > 0 && (
                    <div>
                        <div className="mb-2.5 flex items-center gap-2">
                            <Droplets className="size-4 text-cyan-600" />
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Water Refills
                            </h2>
                        </div>
                        <Card className="overflow-hidden">{renderTable(waterProducts)}</Card>
                    </div>
                )}

                {/* Other Products */}
                {otherProducts.length > 0 && (
                    <div>
                        <div className="mb-2.5 flex items-center gap-2">
                            <Package className="size-4 text-muted-foreground" />
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Services & Others
                            </h2>
                        </div>
                        <Card className="overflow-hidden">{renderTable(otherProducts)}</Card>
                    </div>
                )}

                {products.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                            <Package className="size-10 opacity-20" />
                            <p className="font-medium">No products yet</p>
                            <p className="text-sm">Add your first product to get started</p>
                            <Button size="sm" className="mt-2 gap-1.5" onClick={() => setShowAdd(true)}>
                                <Plus className="size-4" /> Add Product
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm typeLabels={type_labels} onClose={() => setShowAdd(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editProduct} onOpenChange={(o) => !o && setEditProduct(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    {editProduct && (
                        <ProductForm
                            product={editProduct}
                            typeLabels={type_labels}
                            onClose={() => setEditProduct(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
    ],
};
