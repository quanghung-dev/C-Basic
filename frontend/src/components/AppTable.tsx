"use client";

import { Table } from 'antd';
import type { TableProps } from 'antd';


export default function AppTable<RecordType extends object = any>({
    rowKey = "id",
    bordered = true,
    pagination = { defaultPageSize: 5, showSizeChanger: true },
    ...props
}: TableProps<RecordType>) {
    return (
        <div style={{ marginBottom: 16, width: "100%" }}>
            <Table
                rowKey={rowKey}
                bordered={bordered}
                pagination={pagination}
                {...props}
            />
        </div>
    );
}