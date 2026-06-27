export default function AppLogo() {
    return (
        <>
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
                <img
                    src="/logo.png"
                    alt="Jaz Pure Logo"
                    className="size-8 object-contain"
                    onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = 'none';
                        t.nextElementSibling?.classList.remove('hidden');
                    }}
                />
                <div className="hidden size-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                    JP
                </div>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate font-bold leading-tight tracking-tight">
                    Jaz Pure
                </span>
                <span className="truncate text-[10px] leading-tight text-muted-foreground">
                    Water Refilling Station
                </span>
            </div>
        </>
    );
}
