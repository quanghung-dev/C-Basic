"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Select, InputNumber, message, Spin } from "antd";
import AppForm from "@/components/AppForm";
import AppInput from "@/components/AppInput";
import AppButton from "@/components/AppButton";
import { getProductById, updateProduct, getCategories } from "@/services/api";

function UpdateProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [categoriesData, productData] = await Promise.all([
          getCategories(),
          getProductById(id)
        ]);

        setCategories(categoriesData);

        form.setFieldsValue({
          name: productData.name,
          category: productData.category,
          price: productData.price,
          stock: productData.stock
        });
      } catch (error: any) {
        console.error(error);
        message.error("Không thể tải thông tin sản phẩm!");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initData();
    }
  }, [id, form, router]);

  const handleFinish = async (values: any) => {
    try {
      setSubmitLoading(true);
      await updateProduct(id, {
        name: values.name,
        category: values.category,
        price: Number(values.price),
        stock: Number(values.stock)
      });
      message.success("Cập nhật sản phẩm thành công!");
      sessionStorage.setItem("should_refresh_products", "true");
      router.push("/");
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Cập nhật sản phẩm thất bại!");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <AppForm form={form} onFinish={handleFinish}>
      {loading ? (
        <div className="flex justify-center p-12">
          <Spin size="large" description="Đang tải thông tin sản phẩm..." />
        </div>
      ) : (
        <>
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
            <AppButton type="default" htmlType="button" onClick={() => router.back()} disabled={submitLoading}>
              Hủy bỏ
            </AppButton>
            <AppButton type="primary" htmlType="submit" loading={submitLoading}>
              Lưu thay đổi
            </AppButton>
          </div>
        </>
      )}
    </AppForm>
  );
}

export default function UpdateProductPage() {
  return (
    <div className="flex min-h-screen flex-col p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Cập nhật sản phẩm</h1>
      <Suspense fallback={
        <div className="flex justify-center p-12">
          <Spin size="large" description="Đang chuẩn bị form..." />
        </div>
      }>
        <UpdateProductForm />
      </Suspense>
    </div>
  );
}
