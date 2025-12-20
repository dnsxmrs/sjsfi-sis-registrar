// components/InputField.tsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Or use any icon lib like Heroicons, FontAwesome

interface InputFieldProps {
    name: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function InputField({
    name,
    type,
    placeholder,
    value,
    onChange,
    disabled = false,
}: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="relative w-full">
            <input
                autoComplete="off"
                name={name}
                type={isPassword ? (showPassword ? "text" : "password") : type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="bg-white border text-black text-sm border-gray-300 rounded-sm px-4 py-2 w-full focus:outline-0 focus:ring-1 focus:ring-[#800000] focus:border-transparent pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={disabled}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    );
}
