"use client";

import { Button, Flex } from 'antd';
import type { ButtonProps } from 'antd';

type AppButtonProps = ButtonProps & {
    align?: 'left' | 'center' | 'right';
};

export default function AppButton({
    size = "large",
    type = "primary",
    align,
    children,
    style,
    ...props
}: AppButtonProps) {
    const buttonElement = (
        <Button
            size={size}
            type={type}
            style={style}
            {...props}
        >
            {children}
        </Button>
    );

    if (align) {
        const justifyMap = {
            left: 'start',
            center: 'center',
            right: 'end',
        } as const;

        return (
            <Flex justify={justifyMap[align]} style={{ width: '100%', marginBottom: 16 }}>
                {buttonElement}
            </Flex>
        );
    }

    return buttonElement;
}