import { Avatar, Button, Flex, Form, Input, Spin, Typography, theme } from 'antd';
import type { InputRef } from 'antd';
import dayjs from 'dayjs';
import { CheckCheck, Send } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { IMessage } from '../../interface';
import apiClient from '../../libs/axios/axios';
import type { IMessagingRoomProps } from './interface';

const { Text } = Typography;

const MessagingRoom: React.FC<IMessagingRoomProps> = ({
    activeConversation,
    userDataId,
    otherParticipantName,
    isLoadingMsgs,
    messages,
    setMessages,
    fetchConversations
}) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const watchMessage = Form.useWatch('message', form);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<InputRef>(null);

    const isDisableSend = useMemo(() => (watchMessage === undefined || watchMessage === ""), [watchMessage]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }, []);

    const handleSendMessage = useCallback(async (values: { message: string }) => {
        if (!values.message.trim()) return;

        const text = values.message.trim();
        form.resetFields();
        setTimeout(() => inputRef.current?.focus(), 0);

        const tempMsg: IMessage = {
            id: 'temp-' + Date.now(),
            conversationId: activeConversation.id,
            senderId: userDataId,
            content: text,
            type: 'TEXT',
            read: false,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const { data } = await apiClient.post<IMessage>('/chat/messages', {
                conversationId: activeConversation.id,
                content: text
            });

            setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
            fetchConversations();
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        }
    }, [activeConversation.id, userDataId, form, setMessages, fetchConversations]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (!isLoadingMsgs) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isLoadingMsgs]);

    return (
        <Flex vertical style={{ height: '100%', overflow: 'hidden' }}>
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {isLoadingMsgs ? (
                    <Flex justify="center" align="center" style={{ height: '100%' }}>
                        <Spin size="small" />
                    </Flex>
                ) : messages.length === 0 ? (
                    <Flex vertical align="center" justify="center" style={{ height: '100%', padding: '16px', textAlign: 'center' }}>
                        <Avatar size={48} style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary, marginBottom: 8 }}>
                            {otherParticipantName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text strong>Say Hello to {otherParticipantName}!</Text>
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                            Send a message to start bargaining or asking questions.
                        </Text>
                    </Flex>
                ) : (
                    <Flex vertical gap="small">
                        {messages.map((msg) => {
                            const isOwn = msg.senderId === userDataId;
                            const isTemp = msg.id.startsWith('temp-');
                            return (
                                <Flex key={msg.id} justify={isOwn ? 'flex-end' : 'flex-start'}>
                                    <div
                                        style={{
                                            maxWidth: '75%',
                                            borderRadius: token.borderRadiusLG,
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            boxShadow: token.boxShadowTertiary,
                                            backgroundColor: isOwn ? token.colorPrimary : token.colorBgElevated,
                                            color: isOwn ? '#fff' : token.colorText,
                                            borderBottomRightRadius: isOwn ? 0 : token.borderRadiusLG,
                                            borderBottomLeftRadius: isOwn ? token.borderRadiusLG : 0,
                                            border: isOwn ? 'none' : `1px solid ${token.colorBorderSecondary}`
                                        }}
                                    >
                                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                                        <Flex justify="flex-end" align="center" gap={4} style={{ fontSize: '9px', marginTop: 4, color: isOwn ? 'rgba(255,255,255,0.8)' : token.colorTextDescription }}>
                                            <span>{dayjs(msg.createdAt).format('HH:mm')}</span>
                                            {isOwn && (
                                                <span style={{ opacity: isTemp ? 0.55 : 1 }}>
                                                    <CheckCheck size={11} />
                                                </span>
                                            )}
                                        </Flex>
                                    </div>
                                </Flex>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </Flex>
                )}
            </div>

            <Form form={form} onFinish={handleSendMessage} style={{ padding: '8px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                <Flex gap="small" align="center">
                    <Form.Item name="message" style={{ flex: 1, marginBottom: 0 }}>
                        <Input.TextArea
                            ref={inputRef as any}
                            placeholder="Write a message..."
                            disabled={isLoadingMsgs}
                            style={{ borderRadius: '16px', resize: 'none' }}
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            maxLength={200}
                            autoFocus
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    form.submit();
                                }
                            }}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        icon={<Send size={16} />}
                        htmlType="submit"
                        disabled={isDisableSend || isLoadingMsgs}
                        shape="circle"
                    />
                </Flex>
            </Form>
        </Flex>
    );
};

export default MessagingRoom;
