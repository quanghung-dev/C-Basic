"use client";

import { Input } from "antd";
import type { InputProps } from "antd";

type AppInputProps = InputProps & {
    label?: string;
    error?: string;
};

export default function AppInput({
    label,
    error,
    placeholder = "Nhập dữ liệu...",
    size = "large",
    allowClear = true,
    ...props
}: AppInputProps) {
    return (
        <div style={{ marginBottom: 16 }}>
            {label && (
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                    {label}
                </label>
            )}

            <Input
                placeholder={placeholder}
                size={size}
                allowClear={allowClear}
                status={error ? "error" : undefined}
                {...props}
            />

            {error && (
                <p style={{ color: "red", marginTop: 4, fontSize: 13 }}>
                    {error}
                </p>
            )}
        </div>
    );
}