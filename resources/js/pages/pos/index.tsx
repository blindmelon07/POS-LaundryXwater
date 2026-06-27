import { Head, router } from '@inertiajs/react';
import { Droplets, Minus, Package, Plus, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Product {
    id: number;
    name: string;
    type: string;
    type_label: string;
    price: number;
    unit: string;
    notes: string | null;
}

interface CartItem {
    product: Product;
    quantity: number;
    containers_returned: number;
}

interface Props {
    products: Product[];
}

const TYPE_STYLES: Record<string, { card: string; badge: string }> = {
    slim_wholesale: {
        card: 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300',
        badge: 'bg-blue-100 text-blue-700',
    },
    slim_regular: {
        card: 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-300',
        badge: 'bg-cyan-100 text-cyan-700',
    },
    slim_commercial: {
        card: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300',
        badge: 'bg-indigo-100 text-indigo-700',
    },
    container_slim: {
        card: 'border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300',
        badge: 'bg-amber-100 text-amber-700',
    },
    container_round: {
        card: 'border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300',
        badge: 'bg-orange-100 text-orange-700',
    },
    delivery: {
        card: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300',
        badge: 'bg-emerald-100 text-emerald-700',
    },
    other: {
        card: 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300',
        badge: 'bg-slate-100 text-slate-700',
    },
};

const WATER_TYPES = ['slim_wholesale', 'slim_regular', 'slim_commercial'];

function fmt(n: number) {
    return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function PosIndex({ products }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [formData, setFormData] = useState({
        customer_name: '',
        payment_method: 'cash',
        amount_paid: '',
        notes: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                );
            }
            return [...prev, { product, quantity: 1, containers_returned: 0 }];
        });
    };

    const updateQty = (productId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((i) =>
                    i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
                )
                .filter((i) => i.quantity > 0),
        );
    };

    const updateReturned = (productId: number, value: number) => {
        setCart((prev) =>
            prev.map((i) =>
                i.product.id === productId ? { ...i, containers_returned: Math.max(0, value) } : i,
            ),
        );
    };

    const removeItem = (productId: number) => {
        setCart((prev) => prev.filter((i) => i.product.id !== productId));
    };

    const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const total = Math.max(0, subtotal - discount);
    const amountPaid = parseFloat(formData.amount_paid) || 0;
    const change = Math.max(0, amountPaid - total);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            '/pos',
            {
                ...formData,
                discount,
                items: cart.map((i) => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                    containers_returned: i.containers_returned,
                })),
            },
            {
                onSuccess: () => {
                    setCart([]);
                    setDiscount(0);
                    setFormData({ customer_name: '', payment_method: 'cash', amount_paid: '', notes: '' });
                    setErrors({});
                    setProcessing(false);
                },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setProcessing(false);
                },
            },
        );
    };

    const refillProducts = products.filter((p) => WATER_TYPES.includes(p.type));
    const otherProducts = products.filter((p) => !WATER_TYPES.includes(p.type));

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    return (
        <>
            <Head title="POS Terminal" />
            <div className="flex h-full gap-4 overflow-hidden p-4">
                {/* Left: Product Grid */}
                <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
                    {/* Water Refills */}
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Droplets className="size-4 text-cyan-600" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Water Refills
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {refillProducts.map((p) => {
                                const style = TYPE_STYLES[p.type] ?? TYPE_STYLES.other;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => addToCart(p)}
                                        className={`group rounded-xl border-2 p-4 text-left transition-all duration-150 active:scale-95 ${style.card}`}
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <p className="text-sm font-semibold leading-tight">{p.name}</p>
                                            <Droplets className="mt-0.5 size-3.5 shrink-0 text-cyan-500 opacity-70" />
                                        </div>
                                        <p className="mt-2 text-xl font-bold text-blue-700">{fmt(p.price)}</p>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground">{p.unit}</p>
                                        {p.notes && (
                                            <p className="mt-1 text-[10px] italic text-muted-foreground">{p.notes}</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Other Products */}
                    {otherProducts.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Package className="size-4 text-muted-foreground" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Services & Others
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {otherProducts.map((p) => {
                                    const style = TYPE_STYLES[p.type] ?? TYPE_STYLES.other;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => addToCart(p)}
                                            className={`rounded-xl border-2 p-4 text-left transition-all duration-150 active:scale-95 ${style.card}`}
                                        >
                                            <p className="text-sm font-semibold leading-tight">{p.name}</p>
                                            <p className="mt-2 text-xl font-bold text-blue-700">{fmt(p.price)}</p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">{p.unit}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Cart & Checkout */}
                <div className="flex w-[22rem] shrink-0 flex-col gap-3">
                    {/* Cart */}
                    <Card className="flex flex-1 flex-col overflow-hidden">
                        <CardHeader className="border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="size-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-semibold">Current Order</CardTitle>
                                {cartCount > 0 && (
                                    <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                                {cart.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto h-7 text-xs text-destructive hover:text-destructive"
                                        onClick={() => setCart([])}
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                            {cart.length === 0 ? (
                                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                                    <ShoppingCart className="size-9 opacity-20" />
                                    <p className="text-sm font-medium">Cart is empty</p>
                                    <p className="text-xs opacity-70">Tap a product to add it</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {cart.map((item) => (
                                        <div
                                            key={item.product.id}
                                            className="rounded-lg border bg-card p-3 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">
                                                        {item.product.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {fmt(item.product.price)} × {item.quantity} ={' '}
                                                        <span className="font-semibold text-foreground">
                                                            {fmt(item.product.price * item.quantity)}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.product.id)}
                                                    className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            </div>
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <div className="flex items-center rounded-lg border bg-background">
                                                    <button
                                                        onClick={() => updateQty(item.product.id, -1)}
                                                        className="flex size-7 items-center justify-center rounded-l-lg transition-colors hover:bg-muted"
                                                    >
                                                        <Minus className="size-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold tabular-nums">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQty(item.product.id, 1)}
                                                        className="flex size-7 items-center justify-center rounded-r-lg transition-colors hover:bg-muted"
                                                    >
                                                        <Plus className="size-3" />
                                                    </button>
                                                </div>
                                                {['container_slim', 'container_round'].includes(
                                                    item.product.type,
                                                ) && (
                                                    <div className="flex flex-1 items-center gap-1.5">
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Returned:
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            value={item.containers_returned}
                                                            onChange={(e) =>
                                                                updateReturned(
                                                                    item.product.id,
                                                                    parseInt(e.target.value) || 0,
                                                                )
                                                            }
                                                            className="h-7 w-14 text-center text-xs"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Checkout Panel */}
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <Label className="text-xs font-medium">Customer Name</Label>
                                        <Input
                                            placeholder="Walk-in"
                                            value={formData.customer_name}
                                            onChange={(e) =>
                                                setFormData((f) => ({ ...f, customer_name: e.target.value }))
                                            }
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium">Payment</Label>
                                        <Select
                                            value={formData.payment_method}
                                            onValueChange={(v) =>
                                                setFormData((f) => ({ ...f, payment_method: v }))
                                            }
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="gcash">GCash</SelectItem>
                                                <SelectItem value="card">Card</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span className="tabular-nums">{fmt(subtotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Discount</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={discount || ''}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="h-7 w-24 text-right text-sm"
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                                        <span className="text-base font-bold text-blue-900">Total</span>
                                        <span className="text-xl font-black tracking-tight text-blue-700 tabular-nums">
                                            {fmt(total)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <Label className="text-xs font-medium">Amount Paid</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={formData.amount_paid}
                                            onChange={(e) =>
                                                setFormData((f) => ({ ...f, amount_paid: e.target.value }))
                                            }
                                            placeholder="0.00"
                                            className="mt-1 h-8 text-sm"
                                        />
                                        {errors.amount_paid && (
                                            <p className="mt-1 text-xs text-destructive">{errors.amount_paid}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium">Change</Label>
                                        <div
                                            className={`mt-1 flex h-8 items-center rounded-md border px-3 text-sm font-bold tabular-nums ${change > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            {fmt(change)}
                                        </div>
                                    </div>
                                </div>

                                {errors.items && (
                                    <p className="text-xs text-destructive">{errors.items}</p>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95"
                                    disabled={processing || cart.length === 0 || !formData.amount_paid}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Processing…
                                        </span>
                                    ) : (
                                        `Charge ${fmt(total)}`
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

PosIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'POS Terminal', href: '/pos' },
    ],
};
