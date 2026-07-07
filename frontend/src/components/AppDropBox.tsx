"use client";

import type { DropdownProps } from "antd";
import { Button, Dropdown, Space } from "antd";

type AppDropBoxProps = DropdownProps & {
    label?: string;
    error?: string;
    buttonText?: string;
};

export default function AppDropBox({
    label,
    error,
    buttonText = "Chọn...",
    children,
    ...props
}: AppDropBoxProps) {
    return (
        <div style={{ marginBottom: 16 }}>
            {label && (
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                    {label}
                </label>
            )}

            <Dropdown {...props}>
                {children || (
                    <Button size="large" style={{ width: "100%", textAlign: "left" }}>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <span>{buttonText}</span>
                            <span style={{ fontSize: 10, color: "#8c8c8c" }}>▼</span>
                        </Space>
                    </Button>
                )}
            </Dropdown>

            {error && (
                <p style={{ color: "red", marginTop: 4, fontSize: 13 }}>
                    {error}
                </p>
            )}
        </div>
    );
}
