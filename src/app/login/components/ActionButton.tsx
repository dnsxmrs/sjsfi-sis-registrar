// components/ActionButton.tsx

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    bgColor?: string;
    hoverColor?: string;
    textColor?: string;
    isLoading?: boolean;
    loadingText?: string;
}

export default function ActionButton({
    label,
    bgColor = "bg-[#800000]",
    hoverColor = "hover:bg-[#800000]/80",
    textColor = "text-white",
    type = "submit",
    isLoading = false,
    loadingText = "Loading...",
    ...props
}: ActionButtonProps) {
    return (
        <button
            type={type}
            disabled={isLoading}
            {...props}
            className={clsx(
                bgColor,
                hoverColor,
                textColor,
                "text-sm rounded-sm px-4 py-2 w-full transition duration-200 ease-in-out",
                isLoading && "opacity-80 cursor-not-allowed",
                "flex items-center justify-center gap-2"
            )}
        >
            {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? loadingText : label}
        </button>
    );
}
