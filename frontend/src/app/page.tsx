"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, message, Spin } from "antd";
import ScreenRenderer from "@/components/ScreenRenderer";
import type { ProductRecord, ScreenNode } from "@/components/ScreenRenderer";
import {
  deleteProduct,
  getCategories,
  getProductListScreenLayout,
  getProducts,
  getProductsCache,
  getUseProductsCache,
  setProductsCache,
} from "@/services/api";

type ProductScreenLayout = {
  screen: string;
  title: string;
  layout: ScreenNode;
};

type FilterState = {
  search: string;
  category?: string;
  minPrice: string;
  maxPrice: string;
  minStock: string;
  maxStock: string;
};

const defaultFilters: FilterState = {
  search: "",
  category: undefined,
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
};

export default function Home() {
  const router = useRouter();
  const [screenLayout, setScreenLayout] = useState<ProductScreenLayout | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [layoutLoading, setLayoutLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const loadProductsData = async (
    nextFilters = filters,
    page = currentPage
  ) => {
    try {
      setLoading(true);
      const response = await getProducts(
        nextFilters.search,
        nextFilters.category || "",
        page,
        8,
        nextFilters.minPrice,
        nextFilters.maxPrice,
        nextFilters.minStock,
        nextFilters.maxStock
      );

      setProducts(response.data);
      setTotalItems(response.pagination.totalItems);

      setProductsCache({
        products: response.data,
        totalItems: response.pagination.totalItems,
        currentPage: page,
        filters: nextFilters,
      });
    } catch (error) {
      console.error("Load products failed:", error);
      message.error("Khong the tai danh sach san pham!");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesData = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Load categories failed:", error);
    }
  };

  useEffect(() => {
    const initScreen = async () => {
      try {
        setLayoutLoading(true);
        const layout = await getProductListScreenLayout();
        setScreenLayout(layout);

        const useCache = getUseProductsCache();
        if (useCache) {
          const cachedData = getProductsCache();
          if (cachedData) {
            const cachedFilters = cachedData.filters || {
              search: cachedData.searchText || "",
              category: cachedData.selectedCategory,
              minPrice: cachedData.minPrice || "",
              maxPrice: cachedData.maxPrice || "",
              minStock: cachedData.minStock || "",
              maxStock: cachedData.maxStock || "",
            };

            setProducts(cachedData.products || []);
            setTotalItems(cachedData.totalItems || 0);
            setCurrentPage(cachedData.currentPage || 1);
            setFilters(cachedFilters);
            await loadCategoriesData();
            return;
          }
        }

        await Promise.all([
          loadProductsData(defaultFilters, 1),
          loadCategoriesData(),
        ]);
      } catch (error) {
        console.error("Load screen failed:", error);
        message.error("Khong the tai cau hinh man hinh!");
      } finally {
        setLayoutLoading(false);
      }
    };

    initScreen();
  }, []);

  const handleFilterChange = (name: string, value: string | undefined) => {
    setFilters((current) => ({
      ...current,
      [name]: value || "",
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProductsData(filters, 1);
  };

  const handleTableChange = (paginationInfo: { current?: number }) => {
    if (paginationInfo.current) {
      setCurrentPage(paginationInfo.current);
      loadProductsData(filters, paginationInfo.current);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Modal.confirm({
      title: "Xac nhan xoa san pham",
      content: `Ban co chac chan muon xoa san pham "${name}" khong?`,
      okText: "Xoa",
      okType: "danger",
      cancelText: "Huy",
      onOk: async () => {
        try {
          await deleteProduct(id);
          message.success("Xoa san pham thanh cong!");
          loadProductsData(filters, currentPage);
        } catch (error: any) {
          console.error(error);
          message.error(error.message || "Xoa san pham that bai!");
        }
      },
    });
  };

  if (layoutLoading || !screenLayout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" description="Dang tai man hinh..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <ScreenRenderer
        layout={screenLayout.layout}
        filters={filters}
        categories={categories}
        products={products}
        loading={loading}
        currentPage={currentPage}
        totalItems={totalItems}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onNavigate={router.push}
        onTableChange={handleTableChange}
        onDeleteProduct={handleDelete}
      />
    </div>
  );
}
