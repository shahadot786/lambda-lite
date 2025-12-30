export function Logo({ className = "", size = 40 }: { className?: string; size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="none"
            width={size}
            height={size}
            className={className}
        >
            <defs>
                <linearGradient id="lambdaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#3B82F6" }} />
                    <stop offset="50%" style={{ stopColor: "#6366F1" }} />
                    <stop offset="100%" style={{ stopColor: "#8B5CF6" }} />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background circle */}
            <circle cx="256" cy="256" r="240" fill="url(#lambdaGradient)" opacity="0.1" />
            <circle cx="256" cy="256" r="240" fill="none" stroke="url(#lambdaGradient)" strokeWidth="3" opacity="0.3" />

            {/* Lambda symbol */}
            <g filter="url(#glow)">
                <path
                    d="M 160 400 L 256 120 L 280 120 L 232 250 L 352 400 L 312 400 L 220 290 L 200 400 Z"
                    fill="url(#lambdaGradient)"
                />
            </g>

            {/* Accent dot */}
            <circle cx="290" cy="140" r="12" fill="url(#lambdaGradient)" opacity="0.8" />
        </svg>
    );
}

export function LogoIcon({ className = "", size = 32 }: { className?: string; size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="none"
            width={size}
            height={size}
            className={className}
        >
            <defs>
                <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#3B82F6" }} />
                    <stop offset="100%" style={{ stopColor: "#8B5CF6" }} />
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx="6" fill="url(#logoIconGradient)" />
            <path
                d="M 10 26 L 16 6 L 18.5 6 L 14.5 16 L 22 26 L 19 26 L 13.5 18.5 L 12 26 Z"
                fill="white"
            />
        </svg>
    );
}

export function LoadingLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative">
                <Logo size={80} className="animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
            <p className="mt-4 text-lg font-bold text-muted-foreground animate-pulse">
                Loading...
            </p>
        </div>
    );
}
