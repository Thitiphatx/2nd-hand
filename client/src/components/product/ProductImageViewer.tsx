import React, { useState, useEffect } from 'react';
import { Col, Image, Row, theme } from 'antd';
import { getFullImagePath } from '../../utils/utils';

interface ProductImageViewerProps {
  images: string[];
  productName: string;
}

const ProductImageViewer: React.FC<ProductImageViewerProps> = ({ images, productName }) => {
  const { token } = theme.useToken();
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    if (images && images.length > 0 && !images.includes(mainImage)) {
      setMainImage(images[0]);
    }
  }, [images, mainImage]);

  if (!images || images.length === 0) {
    return (
      <div 
        className="aspect-square rounded-lg flex items-center justify-center border"
        style={{ backgroundColor: token.colorFillAlter, borderColor: token.colorBorderSecondary }}
      >
        <span className="text-gray-400">No Image</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="aspect-square rounded-lg overflow-hidden border [&>.ant-image]:w-full! [&>.ant-image]:h-full!"
        style={{ backgroundColor: token.colorFillAlter, borderColor: token.colorBorderSecondary }}
      >
        <Image
          src={getFullImagePath(mainImage)}
          alt={productName}
          className="w-full! h-full! object-cover! object-center!"
          preview={{ mask: 'Click to enlarge' }}
        />
      </div>
      {images.length > 1 && (
        <Row gutter={[8, 8]}>
          {images.map((img, idx) => (
            <Col span={6} key={idx}>
              <div
                className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${mainImage === img ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                onClick={() => setMainImage(img)}
              >
                <img src={getFullImagePath(img)} alt={`${productName} ${idx}`} className="w-full h-full object-cover" />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ProductImageViewer;
