// components/RoleButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

interface RoleButtonProps {
    label: string;
    color: string; // example: 'bg-[#800000]'
    hoverClass?: string; // example: 'hover:bg-[#DAA520]'
    textColor?: string;
    href: string;
}

// Loading spinner component
function LoadingSpinner() {
    return (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
    );
}

export default function RoleButton({
    label,
    color,
    hoverClass,
    textColor = "text-white",
    href,
}: RoleButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = async () => {
        setIsLoading(true);

        router.push(href);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            className={clsx(
                color,
                textColor,
                "text-base font-medium rounded-sm px-4 py-3 w-full transition duration-200 ease-in-out flex items-center justify-center",
                hoverClass || "hover:opacity-80",
                isLoading && "opacity-70 cursor-not-allowed",
                "gap-2"
            )}
        >
            {isLoading && <LoadingSpinner />}
            {label}
        </button>
    );
}
