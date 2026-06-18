import { Button, Flex, Form, Input, Modal, Typography } from 'antd';
import React, { useCallback } from 'react';

const { Text } = Typography;

interface IModalFormRefundEmailProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    form: any;
    onSubmit: (values: { email?: string }) => void;
    isPromptPay: boolean;
}

const ModalFormRefundEmail: React.FC<IModalFormRefundEmailProps> = ({
    isOpen,
    setIsOpen,
    form,
    onSubmit,
    isPromptPay
}) => {    
    const handleCloseModal = useCallback(()=> {
        setIsOpen(false);
        form.resetFields();
    }, [form, setIsOpen])
    
    return (
        <Modal
            title="Request Refund"
            open={isOpen}
            centered
            footer={null}
            onCancel={handleCloseModal}
        >
            <Form
                form={form}
                layout="vertical"
                name="refund_email_form"
                onFinish={onSubmit}
            >
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Your refund request will be sent to the shopkeeper for review.
                </Text>
                
                {isPromptPay && (
                    <Form.Item
                        name="email"
                        label="Email for Refund Instructions"
                        extra="This email must be real and active. Stripe will send a secure link to this address where you will need to fill in your bank account details to receive your PromptPay refund."
                        rules={[
                            { required: true, message: 'Please enter your email address!' },
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                    >
                        <Input placeholder="Enter email where Stripe will send refund instructions" />
                    </Form.Item>
                )}

                <Flex gap={12} justify='flex-end' style={{ marginTop: 24 }}>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button type='primary' danger={!isPromptPay} htmlType='submit'>
                        Submit Request
                    </Button>
                </Flex>
            </Form>
        </Modal>
    )
}

export default ModalFormRefundEmail;
