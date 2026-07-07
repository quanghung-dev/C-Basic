"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../components/AppInput"
import AppDropBox from "../components/AppDropBox"
import AppButton from "@/components/AppButton";
import AppTable from "@/components/AppTable";
import { Tag, Space, message, Modal } from "antd";
import { getProducts, getCategories, deleteProduct } from "@/services/api";

interface ProductType {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const loadProductsData = async (search = "", category = "", page = currentPage) => {
    try {
      setLoading(true);
      const response = await getProducts(search, category, page, 8);
      setProducts(response.data);
      setTotalItems(response.pagination.totalItems);
      sessionStorage.setItem("cached_products", JSON.stringify(response.data));
      sessionStorage.setItem("cached_total_items", String(response.pagination.totalItems));
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  }

  const loadCategoriesData = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  useEffect(() => {
    const shouldRefresh = sessionStorage.getItem("should_refresh_products") === "true";
    const cachedData = sessionStorage.getItem("cached_products");
    const cachedTotal = sessionStorage.getItem("cached_total_items");

    const savedPage = sessionStorage.getItem("current_page");
    const targetPage = savedPage ? Number(savedPage) : 1;
    if (savedPage) {
      setCurrentPage(targetPage);
    }

    if (shouldRefresh || !cachedData || !cachedTotal) {
      loadProductsData(searchText, selectedCategory || "", targetPage);
      sessionStorage.removeItem("should_refresh_products");
    } else {
      setProducts(JSON.parse(cachedData));
      setTotalItems(Number(cachedTotal));
    }

    loadCategoriesData();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    sessionStorage.setItem("current_page", "1");
    loadProductsData(searchText, selectedCategory || "", 1);
  };

  const handleTableChange = (paginationInfo: any) => {
    if (paginationInfo.current) {
      setCurrentPage(paginationInfo.current);
      sessionStorage.setItem("current_page", String(paginationInfo.current));
      loadProductsData(searchText, selectedCategory || "", paginationInfo.current);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteProduct(id);
          message.success("Xóa sản phẩm thành công!");
          loadProductsData(searchText, selectedCategory || "", currentPage);
        } catch (error: any) {
          console.error(error);
          message.error(error.message || "Xóa sản phẩm thất bại!");
        }
      }
    });
  };

  const categoryItems = categories.map((cat) => ({
    key: cat,
    label: cat
  }));

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        let color = 'blue';
        if (category === 'Điện thoại' || category === 'Electronics') color = 'green';
        if (category === 'Laptop' || category === 'Clothing') color = 'purple';
        if (category === 'Phụ kiện' || category === 'Books') color = 'orange';
        if (category === 'Home') color = 'cyan';
        if (category === 'Sports') color = 'magenta';
        return <Tag color={color}>{category}</Tag>;
      }
    },
    {
      title: 'Giá tiền',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => {
        const color = stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red';
        const text = stock > 10 ? 'Còn hàng' : stock > 0 ? 'Sắp hết' : 'Hết hàng';
        return <Tag color={color}>{`${text} (${stock})`}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: ProductType) => (
        <Space size="middle">
          <a style={{ color: '#1890ff' }} onClick={() => router.push(`/update-product?id=${record.id}`)}>Sửa</a>
          <a style={{ color: '#ff4d4f' }} onClick={() => handleDelete(record.id, record.name)}>Xóa</a>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="grid grid-cols-4 gap-10 p-2">
        <Input 
          label="Name Product" 
          placeholder="Nhập tên để tìm kiếm" 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
        />
        <AppDropBox 
          label="Categories" 
          buttonText={selectedCategory || "Chọn danh mục"} 
          menu={{ 
            items: [
              { key: "all", label: "Tất cả danh mục" },
              ...categoryItems
            ],
            onClick: ({ key }) => setSelectedCategory(key === "all" ? undefined : key)
          }} 
        />
        <Input label="Price" placeholder="Nhập giá" />
        <Input label="Stock" placeholder="Nhập số lượng" />
      </div>
      <div className="flex gap-4 p-2">
        <AppButton onClick={handleSearch}>Search</AppButton>
        <AppButton onClick={() => router.push("/create-product")}>Add Product</AppButton>
      </div>
      <div className="p-2">
        <AppTable<ProductType>
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: 8,
            total: totalItems,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
