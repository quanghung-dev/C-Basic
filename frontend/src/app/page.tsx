"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppInput from "../components/AppInput"
import AppDropBox from "../components/AppDropBox"
import AppButton from "@/components/AppButton";
import AppTable from "@/components/AppTable";
import { Tag, Space, message, Modal, Input } from "antd";
import { getProducts, getCategories, deleteProduct, setProductsCache, getProductsCache, getUseProductsCache } from "@/services/api";

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

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minStock, setMinStock] = useState<string>("");
  const [maxStock, setMaxStock] = useState<string>("");

  const loadProductsData = async (
    search = searchText,
    category = selectedCategory || "",
    page = currentPage,
    minP = minPrice,
    maxP = maxPrice,
    minS = minStock,
    maxS = maxStock
  ) => {
    try {
      setLoading(true);
      const response = await getProducts(search, category, page, 8, minP, maxP, minS, maxS);
      setProducts(response.data);
      setTotalItems(response.pagination.totalItems);

      const cacheData = {
        products: response.data,
        totalItems: response.pagination.totalItems,
        currentPage: page,
        searchText: search,
        selectedCategory: category,
        minPrice: minP,
        maxPrice: maxP,
        minStock: minS,
        maxStock: maxS
      };
      setProductsCache(cacheData);
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
    const useCache = getUseProductsCache();

    if (useCache) {
      const cachedData = getProductsCache();
      if (cachedData) {
        setProducts(cachedData.products || []);
        setTotalItems(cachedData.totalItems || 0);
        setCurrentPage(cachedData.currentPage || 1);
        setSearchText(cachedData.searchText || "");
        setSelectedCategory(cachedData.selectedCategory);
        setMinPrice(cachedData.minPrice || "");
        setMaxPrice(cachedData.maxPrice || "");
        setMinStock(cachedData.minStock || "");
        setMaxStock(cachedData.maxStock || "");

        loadCategoriesData();
        return;
      }
    }

    loadProductsData(searchText, selectedCategory || "", currentPage);
    loadCategoriesData();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    loadProductsData(searchText, selectedCategory || "", 1);
  };

  const handleTableChange = (paginationInfo: any) => {
    if (paginationInfo.current) {
      setCurrentPage(paginationInfo.current);
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
        <AppInput
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
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Khoảng giá (đ)
          </label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Từ"
              size="large"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <span style={{ color: "#d9d9d9" }}>-</span>
            <Input
              placeholder="Đến"
              size="large"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Khoảng số lượng
          </label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Từ"
              size="large"
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <span style={{ color: "#d9d9d9" }}>-</span>
            <Input
              placeholder="Đến"
              size="large"
              type="number"
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </div>
        </div>
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
