"use client";

import { Form } from 'antd';
import type { FormProps } from 'antd';

export default function AppForm<T = any>({
    layout = "vertical",
    autoComplete = "off",
    children,
    ...props
}: FormProps<T>) {
    return (
        <Form
            layout={layout}
            autoComplete={autoComplete}
            {...props}
        >
            {children as any}
        </Form>
    );
}