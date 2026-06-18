import { Button, Card, Col, Empty, Input, InputNumber, Row, Select, Slider, Space, Typography, Pagination } from 'antd';
import { Funnel } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import CardProduct from '../../components/product/CardProduct';
import type { IPage, IProductItem } from '../../interface';
import apiClient from '../../libs/axios/axios';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const [products, setProducts] = useState<IProductItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  
  // Applied filter states
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 10000]);
  
  const [allTags, setAllTags] = useState<string[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('newest');

  // Search state
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const getProducts = useCallback(async () => {
    try {
      const params: Record<string, any> = {
        page: currentPage - 1,
        size: pageSize,
      };

      if (searchKeyword) {
        params.keyword = searchKeyword;
      }

      if (appliedTags.length > 0) {
        params.tags = appliedTags.join(',');
      }

      if (appliedPriceRange[0] > 0) {
        params.minPrice = appliedPriceRange[0];
      }
      if (appliedPriceRange[1] < 10000) {
        params.maxPrice = appliedPriceRange[1];
      }

      if (sortBy === 'newest') {
        params.sort = 'createdDate,desc';
      } else if (sortBy === 'price-low') {
        params.sort = 'price,asc';
      } else if (sortBy === 'price-high') {
        params.sort = 'price,desc';
      }

      const { data } = await apiClient.get<IPage<IProductItem>>("/products", { params });
      setProducts(data.content);
      setTotalElements(data.totalElements);
    } catch {
      // Handle in interceptors
    }
  }, [currentPage, pageSize, appliedTags, appliedPriceRange, sortBy, searchKeyword]);

  useEffect(() => {
    const getTags = async () => {
      try {
        const { data } = await apiClient.get<string[]>("/products/tag");
        setAllTags(data);
      } catch {
        // Handle in interceptors
      }
    };
    getTags();
  }, []);


  useEffect(() => {
    getProducts();
  }, [getProducts]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <Title level={2} className="m-0">Explore Unique Finds</Title>
        <Text type="secondary">Discover second-hand treasures from trusted sellers.</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sidebar Filters */}
        <Col xs={24} lg={6}>
          <Card
            title="Filters"
            size="small"
            className="sticky shadow-sm"
            styles={{ body: { padding: '16px' } }}
          >
            <div className="space-y-6">
              <div>
                <Text strong className="block mb-3">Search Tags</Text>
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Search and select tags..."
                  value={selectedTags}
                  onChange={(values) => setSelectedTags(values)}
                  options={allTags.map(tag => ({ value: tag, label: tag }))}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>

              <div>
                <Text strong className="block mb-3">Price Range (THB)</Text>
                <Slider
                  range
                  min={0}
                  max={10000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                />
                <div className="flex items-center justify-between mt-2">
                  <InputNumber
                    min={0}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(val) => {
                      const newMin = val || 0;
                      setPriceRange([newMin, priceRange[1]]);
                    }}
                    size="small"
                    className="w-20"
                  />
                  <Text type="secondary">-</Text>
                  <InputNumber
                    min={priceRange[0]}
                    max={10000}
                    value={priceRange[1]}
                    onChange={(val) => {
                      const newMax = val || 10000;
                      setPriceRange([priceRange[0], newMax]);
                    }}
                    size="small"
                    className="w-20"
                  />
                </div>
              </div>

              <Space orientation="vertical" className="w-full pt-2" size="small">
                <Button 
                  type="primary" 
                  block 
                  icon={<Funnel className="w-4 h-4" />}
                  onClick={() => {
                    setAppliedTags(selectedTags);
                    setAppliedPriceRange(priceRange);
                    setCurrentPage(1);
                  }}
                >
                  Apply Filters
                </Button>
                <Button 
                  type="text" 
                  block 
                  danger
                  onClick={() => {
                    setSelectedTags([]);
                    setPriceRange([0, 10000]);
                    setAppliedTags([]);
                    setAppliedPriceRange([0, 10000]);
                    setCurrentPage(1);
                  }}
                >
                  Reset All Filters
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Product Grid */}
        <Col xs={24} lg={18}>
          <div className="flex flex-col md:flex-row gap-4 items-center w-full mb-6">
            <Input.Search
              placeholder="Search products, shops..."
              allowClear
              onSearch={(value) => {
                setSearchKeyword(value);
                setCurrentPage(1);
              }}
              className="flex-1"
            />
            <Select
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
              style={{ width: 160 }}
              options={[
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
              ]}
            />
          </div>

          {products.length > 0 ? (
            <div className="space-y-6">
              <Row gutter={[16, 16]}>
                {products.map(product => (
                  <Col xs={24} sm={12} xl={8} key={product.id}>
                    <CardProduct product={product}/>
                  </Col>
                ))}
              </Row>
              <div className="flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalElements}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  showSizeChanger
                  pageSizeOptions={['6', '9', '12', '24']}
                />
              </div>
            </div>
          ) : (
            <Empty description="No products found matching your filters." />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Home;
