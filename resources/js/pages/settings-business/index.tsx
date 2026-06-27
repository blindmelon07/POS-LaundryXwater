import { Head, useForm } from '@inertiajs/react';
import { Building2, Mail, MapPin, Phone, Receipt, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Props {
    settings: Record<string, string>;
}

export default function BusinessSettings({ settings }: Props) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        business_name: settings.business_name ?? '',
        business_address: settings.business_address ?? '',
        business_phone: settings.business_phone ?? '',
        business_email: settings.business_email ?? '',
        receipt_footer: settings.receipt_footer ?? '',
        tax_rate: settings.tax_rate ?? '0',
        currency: settings.currency ?? '₱',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/business-settings');
    };

    return (
        <>
            <Head title="Business Settings" />
            <div className="mx-auto max-w-2xl p-4 md:p-6">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
                        <Settings className="size-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Business Settings</h1>
                        <p className="text-sm text-muted-foreground">Configure store information and receipts</p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    {/* Store Information */}
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-3 pt-4">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Building2 className="size-4 text-muted-foreground" />
                                Store Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 p-5">
                            <div>
                                <Label htmlFor="business_name">Business Name</Label>
                                <Input
                                    id="business_name"
                                    className="mt-1"
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    placeholder="Jaz Pure Water Refilling Station"
                                />
                                {errors.business_name && (
                                    <p className="mt-1 text-xs text-destructive">{errors.business_name}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="business_address" className="flex items-center gap-1.5">
                                    <MapPin className="size-3.5 text-muted-foreground" /> Address
                                </Label>
                                <Input
                                    id="business_address"
                                    className="mt-1"
                                    value={data.business_address}
                                    onChange={(e) => setData('business_address', e.target.value)}
                                    placeholder="123 Main St, Barangay, City"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="business_phone" className="flex items-center gap-1.5">
                                        <Phone className="size-3.5 text-muted-foreground" /> Phone Number
                                    </Label>
                                    <Input
                                        id="business_phone"
                                        className="mt-1"
                                        value={data.business_phone}
                                        onChange={(e) => setData('business_phone', e.target.value)}
                                        placeholder="09xx-xxx-xxxx"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="business_email" className="flex items-center gap-1.5">
                                        <Mail className="size-3.5 text-muted-foreground" /> Email
                                    </Label>
                                    <Input
                                        id="business_email"
                                        className="mt-1"
                                        type="email"
                                        value={data.business_email}
                                        onChange={(e) => setData('business_email', e.target.value)}
                                        placeholder="store@example.com"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Receipt Settings */}
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-3 pt-4">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Receipt className="size-4 text-muted-foreground" />
                                Receipt Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 p-5">
                            <div>
                                <Label htmlFor="receipt_footer">Footer Message</Label>
                                <Input
                                    id="receipt_footer"
                                    className="mt-1"
                                    value={data.receipt_footer}
                                    onChange={(e) => setData('receipt_footer', e.target.value)}
                                    placeholder="Thank you for your purchase!"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Printed at the bottom of every receipt
                                </p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="currency">Currency Symbol</Label>
                                    <Input
                                        id="currency"
                                        className="mt-1 w-24"
                                        value={data.currency}
                                        onChange={(e) => setData('currency', e.target.value)}
                                        placeholder="₱"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                    <Input
                                        id="tax_rate"
                                        className="mt-1"
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        value={data.tax_rate}
                                        onChange={(e) => setData('tax_rate', e.target.value)}
                                        placeholder="0"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Set to 0 if not applicable
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        disabled={processing || !isDirty}
                        size="lg"
                        className="w-full gap-2"
                    >
                        <Save className="size-4" />
                        {processing ? 'Saving…' : isDirty ? 'Save Settings' : 'No Changes'}
                    </Button>
                </form>
            </div>
        </>
    );
}

BusinessSettings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Business Settings', href: '/business-settings' },
    ],
};
