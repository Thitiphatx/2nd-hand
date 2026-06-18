import { Card, Divider, Flex, Image, Typography } from 'antd'
import React from 'react'
import type { IProductItem } from '../../interface'
import { formatTHB } from '../../utils/formatter'
import { getFullImagePath } from '../../utils/utils'

const { Text, Paragraph, Link } = Typography

interface CardProductProps {
    product: IProductItem
}

const CardProduct: React.FC<CardProductProps> = ({ product }) => {
    return (
        <Link href={`/product/${product.id}`} className="block">
            <Card
                id={product.id}
                hoverable
                className="overflow-hidden h-96"
                classNames={{
                    body: "p-0! h-full! flex! flex-col!"
                }}
            >
                {/* Image — fixed height */}
                <div className="h-48 shrink-0 overflow-hidden bg-gray-100">
                    <img
                        src={getFullImagePath(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover object-center block"
                    />
                </div>

                <Flex vertical gap={4} className="p-4! flex-1 overflow-hidden">
                    <div className="h-6 shrink-0 overflow-hidden">
                        <Text strong ellipsis className="block">
                            {product.name}
                        </Text>
                    </div>
                    <div className="grow overflow-hidden">
                        <Paragraph
                            type="secondary"
                            ellipsis={{ rows: 3 }}
                            className="mb-0! text-sm!"
                        >
                            {product.description || ' '}
                        </Paragraph>
                    </div>
                    <div className="shrink-0 mt-auto">
                        <Divider />
                        <Text strong>
                            {formatTHB(product.price)}
                        </Text>
                    </div>

                </Flex>
            </Card>
        </Link>
    )
}

export default CardProduct