import { Card, Flex, Typography } from 'antd'
import { MapPin } from 'lucide-react';
import React from 'react'
import type { IAddress } from '../../pages/account/interface';

const { Title, Text } = Typography;

export interface CardAddressProps {
    address: IAddress
}

const CardAddress: React.FC<CardAddressProps> = ({ address }) => {
    return (
        <Card
            title={
                <Flex align="center" gap={12}>
                    <MapPin size={16} className='text-blue-500' />
                    <Title level={5} className='mb-0!'>Shipping Address</Title>
                </Flex>
            }
            classNames={{
                header: "border-b-0!",
                body: "pt-0!"
            }}
        >
            <Flex orientation='vertical'>
                <Text>{address.title}</Text>
                <Text type="secondary">
                    {address.address}, {address.subDistrict}, {address.district}, {address.province}, {address.zipcode}
                </Text>
            </Flex>
        </Card>
    )
}

export default CardAddress