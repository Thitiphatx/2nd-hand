import { Card, Masonry, Avatar, Space, Typography, Rate } from 'antd';
import { User } from 'lucide-react';
import type { IReview } from '../../../interface';
import { formatDateTime } from '../../../utils/formatter';

const { Text, Paragraph } = Typography;

interface IReviewsTabProps {
  reviews: IReview[];
}

const ReviewsTab: React.FC<IReviewsTabProps> = ({ 
  reviews, 
}) => {


  return (
    <Card title="Customer Reviews">
      <Masonry<IReview>
        columns={1}
        items={reviews.map(r => ({ key: r.id, data: r }))}
        itemRender={(itemInfo) => {
          const review = itemInfo.data;
          return (
            <div key={review.id} className="py-6 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
              <div className="flex gap-4">
                <Avatar icon={<User size={18} />} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <Space wrap>
                      <Text strong>{review.username}</Text>
                      <Rate disabled defaultValue={review.score} size="small" />
                      <Text type="secondary" className="text-xs">{formatDateTime(review.createdAt)}</Text>
                    </Space>
                  </div>
                  <Text italic className="block mb-2 text-sm">Product: {review.product?.name || 'Unknown'}</Text>
                  <Paragraph className="mb-0">{review.comment}</Paragraph>
                </div>
              </div>
            </div>
          );
        }}
      />
    </Card>
  );
};

export default ReviewsTab;
