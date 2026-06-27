import { Link } from '@inertiajs/react';
import { Droplets } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Brand */}
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-3">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                                <Droplets className="size-8 text-white" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-bold tracking-tight text-blue-900">
                                    Jaz Pure Water Refilling
                                </h1>
                                <p className="text-xs font-medium text-blue-500">
                                    POS Management System
                                </p>
                            </div>
                        </Link>

                        {title && (
                            <div className="space-y-1 text-center">
                                <h2 className="text-lg font-semibold">{title}</h2>
                                {description && (
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                        {children}
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Jaz Pure Water Refilling Station
                    </p>
                </div>
            </div>
        </div>
    );
}
