"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Select, InputNumber, message } from "antd";
import AppForm from "@/components/AppForm";
import AppInput from "@/components/AppInput";
import AppButton from "@/components/AppButton";
import { createProduct, getCategories } from "@/services/api";

export default function CreateProductPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    loadCategories();
  }, []);

  const handleFinish = async (values: any) => {
    try {
      setLoading(true);
      await createProduct({
        name: values.name,
        category: values.category,
        price: Number(values.price),
        stock: Number(values.stock),
      });
      message.success("Tạo sản phẩm thành công!");
      sessionStorage.setItem("should_refresh_products", "true");
      router.push("/");
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Tạo sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Thêm sản phẩm mới</h1>
      
      <AppForm form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
        >
          <AppInput placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select
            size="large"
            placeholder="Chọn danh mục"
            options={categories.map(cat => ({ value: cat, label: cat }))}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá tiền"
          rules={[
            { required: true, message: "Vui lòng nhập giá tiền!" },
            { type: "number", min: 0, message: "Giá tiền phải lớn hơn hoặc bằng 0!" }
          ]}
        >
          <InputNumber
            size="large"
            placeholder="Nhập giá tiền"
            style={{ width: "100%" }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="Số lượng"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng!" },
            { type: "number", min: 0, message: "Số lượng phải lớn hơn hoặc bằng 0!" }
          ]}
        >
          <InputNumber
            size="large"
            placeholder="Nhập số lượng"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <div className="flex gap-4 mt-6">
          <AppButton type="default" htmlType="button" onClick={() => router.back()} disabled={loading}>
            Hủy bỏ
          </AppButton>
          <AppButton type="primary" htmlType="submit" loading={loading}>
            Tạo sản phẩm
          </AppButton>
        </div>
      </AppForm>
    </div>
  );
}
