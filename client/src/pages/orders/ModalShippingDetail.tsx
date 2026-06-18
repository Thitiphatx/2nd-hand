import { Button, Flex, Form, Input, Modal } from 'antd';
import React, { useCallback } from 'react';
import type { IModalShippingDetailProps } from './interface';



const ModalShippingDetail: React.FC<IModalShippingDetailProps> = ({
    isOpen,
    setIsOpen,
    form,
    onSubmit
}) => {    
    const handleCloseModal = useCallback(()=> {
        setIsOpen(false);
        form.resetFields();
    }, [form, setIsOpen])
    
    return (
        <Modal
            title="Enter Shipping Details"
            open={isOpen}
            centered
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                name="shipping_details_form"
                initialValues={{ shippingCode: '', deliveryUrl: '' }}
                onFinish={onSubmit}
            >
                <Form.Item
                    name="shippingCode"
                    label="Shipping Code / Tracking Number"
                    rules={[{ required: true, message: 'Please enter the shipping code!' }]}
                >
                    <Input placeholder="e.g. TH123456789" />
                </Form.Item>
                <Form.Item
                    name="deliveryUrl"
                    label="Delivery Tracking URL"
                    rules={[
                        { required: true, message: 'Please enter the tracking URL!' },
                        { type: 'url', message: 'Please enter a valid URL!' }
                    ]}
                >
                    <Input placeholder="e.g. https://thailandpost.co.th/track?id=..." />
                </Form.Item>
                <Flex gap={12} justify='flex-end'>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button variant='solid' htmlType='submit'>Confirm Shipping</Button>
                </Flex>
            </Form>
        </Modal>
    )
}

export default ModalShippingDetail