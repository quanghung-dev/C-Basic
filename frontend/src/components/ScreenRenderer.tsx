"use client";

import React from "react";
import { Button, Input, Space, Tag } from "antd";
import type { TablePaginationConfig } from "antd";
import type { ColumnsType } from "antd/es/table";
import AppButton from "@/components/AppButton";
import AppDropBox from "@/components/AppDropBox";
import AppInput from "@/components/AppInput";
import AppTable from "@/components/AppTable";

export interface ProductRecord {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

type ScreenAction = {
  type: "submit" | "navigate";
  label: string;
  action?: string;
  to?: string;
};

type ScreenField = {
  type: "input" | "select" | "numberRange";
  name: string;
  label?: string;
  placeholder?: string;
  source?: "categories";
  allLabel?: string;
  minName?: string;
  maxName?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
};

type ScreenColumn = {
  title: string;
  dataIndex?: keyof ProductRecord;
  render?: "categoryTag" | "currency" | "stockTag" | "productActions";
};

export type ScreenNode = {
  type: "page" | "filterBar" | "table";
  id?: string;
  columns?: number | ScreenColumn[];
  fields?: ScreenField[];
  actions?: ScreenAction[];
  children?: ScreenNode[];
  source?: string;
  rowKey?: keyof ProductRecord;
  pagination?: boolean;
};

type FilterState = Record<string, string | undefined>;

type ScreenRendererProps = {
  layout: ScreenNode;
  filters: FilterState;
  categories: string[];
  products: ProductRecord[];
  loading: boolean;
  currentPage: number;
  totalItems: number;
  onFilterChange: (name: string, value: string | undefined) => void;
  onSearch: () => void;
  onNavigate: (to: string) => void;
  onTableChange: (pagination: TablePaginationConfig) => void;
  onDeleteProduct: (id: number, name: string) => void;
};

export default function ScreenRenderer(props: ScreenRendererProps) {
  return renderNode(props.layout, props);
}

function renderNode(node: ScreenNode, props: ScreenRendererProps): React.ReactNode {
  switch (node.type) {
    case "page":
      return <>{node.children?.map((child, index) => <React.Fragment key={child.id || index}>{renderNode(child, props)}</React.Fragment>)}</>;
    case "filterBar":
      return renderFilterBar(node, props);
    case "table":
      return renderTable(node, props);
    default:
      return null;
  }
}

function renderFilterBar(node: ScreenNode, props: ScreenRendererProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 p-2">
        {node.fields?.map((field) => renderField(field, props))}
      </div>
      <div className="flex gap-4 p-2">
        {node.actions?.map((action) => renderAction(action, props))}
      </div>
    </>
  );
}

function renderField(field: ScreenField, props: ScreenRendererProps) {
  if (field.type === "input") {
    return (
      <AppInput
        key={field.name}
        label={field.label}
        placeholder={field.placeholder}
        value={props.filters[field.name] || ""}
        onChange={(event) => props.onFilterChange(field.name, event.target.value)}
        onPressEnter={props.onSearch}
      />
    );
  }

  if (field.type === "select") {
    const value = props.filters[field.name];
    const items = [
      { key: "__all", label: field.allLabel || "All" },
      ...props.categories.map((category) => ({ key: category, label: category })),
    ];

    return (
      <AppDropBox
        key={field.name}
        label={field.label}
        buttonText={value || field.placeholder || "Select"}
        menu={{
          items,
          onClick: ({ key }) => props.onFilterChange(field.name, key === "__all" ? undefined : key),
        }}
      />
    );
  }

  if (field.type === "numberRange") {
    const minName = field.minName || `${field.name}Min`;
    const maxName = field.maxName || `${field.name}Max`;

    return (
      <div key={field.name} style={{ marginBottom: 16 }}>
        {field.label && (
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            {field.label}
          </label>
        )}
        <div className="flex gap-2 items-center">
          <Input
            placeholder={field.minPlaceholder}
            size="large"
            type="number"
            value={props.filters[minName] || ""}
            onChange={(event) => props.onFilterChange(minName, event.target.value)}
            onPressEnter={props.onSearch}
            allowClear
          />
          <span style={{ color: "#d9d9d9" }}>-</span>
          <Input
            placeholder={field.maxPlaceholder}
            size="large"
            type="number"
            value={props.filters[maxName] || ""}
            onChange={(event) => props.onFilterChange(maxName, event.target.value)}
            onPressEnter={props.onSearch}
            allowClear
          />
        </div>
      </div>
    );
  }

  return null;
}

function renderAction(action: ScreenAction, props: ScreenRendererProps) {
  if (action.type === "submit") {
    return (
      <AppButton key={action.label} onClick={props.onSearch}>
        {action.label}
      </AppButton>
    );
  }

  if (action.type === "navigate" && action.to) {
    return (
      <AppButton key={action.label} onClick={() => props.onNavigate(action.to!)}>
        {action.label}
      </AppButton>
    );
  }

  return null;
}

function renderTable(node: ScreenNode, props: ScreenRendererProps) {
  const configuredColumns = Array.isArray(node.columns) ? node.columns : [];
  const columns: ColumnsType<ProductRecord> = configuredColumns.map((column) => ({
    title: column.title,
    dataIndex: column.dataIndex,
    key: column.dataIndex || column.render || column.title,
    render: (value: ProductRecord[keyof ProductRecord], record: ProductRecord) => renderCell(column, value, record, props),
  }));

  return (
    <div className="p-2">
      <AppTable<ProductRecord>
        columns={columns}
        dataSource={props.products}
        loading={props.loading}
        rowKey={node.rowKey || "id"}
        pagination={
          node.pagination
            ? {
                current: props.currentPage,
                pageSize: 8,
                total: props.totalItems,
                showSizeChanger: false,
              }
            : false
        }
        onChange={props.onTableChange}
      />
    </div>
  );
}

function renderCell(
  column: ScreenColumn,
  value: ProductRecord[keyof ProductRecord],
  record: ProductRecord,
  props: ScreenRendererProps
) {
  switch (column.render) {
    case "categoryTag":
      return <Tag color={getCategoryColor(String(value || ""))}>{value}</Tag>;
    case "currency":
      return `${Number(value || 0).toLocaleString("vi-VN")} d`;
    case "stockTag": {
      const stock = Number(value || 0);
      const color = stock > 10 ? "green" : stock > 0 ? "orange" : "red";
      const text = stock > 10 ? "Con hang" : stock > 0 ? "Sap het" : "Het hang";
      return <Tag color={color}>{`${text} (${stock})`}</Tag>;
    }
    case "productActions":
      return (
        <Space size="middle">
          <Button type="link" style={{ padding: 0 }} onClick={() => props.onNavigate(`/update-product?id=${record.id}`)}>
            Sua
          </Button>
          <Button type="link" danger style={{ padding: 0 }} onClick={() => props.onDeleteProduct(record.id, record.name)}>
            Xoa
          </Button>
        </Space>
      );
    default:
      return value;
  }
}

function getCategoryColor(category: string) {
  if (category === "Dien thoai" || category === "Electronics") return "green";
  if (category === "Laptop" || category === "Clothing") return "purple";
  if (category === "Phu kien" || category === "Books") return "orange";
  if (category === "Home") return "cyan";
  if (category === "Sports") return "magenta";
  return "blue";
}
