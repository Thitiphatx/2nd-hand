import { Avatar, Badge, Flex, Spin, Typography, theme } from 'antd';
import dayjs from 'dayjs';
import { MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import type { IConversationListProps } from './interface';

const { Text } = Typography;

const ConversationList: React.FC<IConversationListProps> = ({
    conversations,
    userDataId,
    isLoadingConvs,
    setActiveConversation
}) => {
    const { token } = theme.useToken();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <>
            {isLoadingConvs ? (
                <Flex justify="center" align="center" style={{ height: '100%' }}>
                    <Spin size="small" />
                </Flex>
            ) : conversations.length === 0 ? (
                <Flex vertical align="center" justify="center" style={{ height: '100%', padding: '16px', textAlign: 'center' }}>
                    <Flex align="center" justify="center" style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: token.colorFillTertiary, marginBottom: 8 }}>
                        <MessageSquare size={20} color={token.colorTextDescription} />
                    </Flex>
                    <Text strong>No Chats Yet</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                        Click "Chat" on any product listing to message a seller.
                    </Text>
                </Flex>
            ) : (
                <Flex vertical gap={4} style={{ padding: '8px' }}>
                    {conversations.map((conv) => {
                        const otherParticipant = conv.participants.find(p => p.id !== userDataId);
                        const otherName = otherParticipant?.name || 'User';
                        const unread = conv.unreadCount[userDataId] || 0;
                        const lastMsgTime = conv.lastMessage?.timestamp
                            ? dayjs(conv.lastMessage.timestamp).format('HH:mm')
                            : '';

                        return (
                            <div
                                key={conv.id}
                                onClick={() => setActiveConversation(conv)}
                                style={{
                                    padding: '10px',
                                    borderRadius: token.borderRadiusLG,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    backgroundColor: hoveredId === conv.id ? token.colorFillQuaternary : 'transparent',
                                }}
                                onMouseEnter={() => setHoveredId(conv.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <Flex gap="middle" align="center">
                                    <Badge count={unread} overflowCount={9}>
                                        <Avatar style={{ backgroundColor: token.colorPrimary, color: '#fff' }}>
                                            {otherName.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                    <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                                        <Flex justify="space-between" align="baseline">
                                            <Text strong ellipsis style={{ maxWidth: 160 }}>
                                                {otherName}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 10 }}>{lastMsgTime}</Text>
                                        </Flex>
                                        <Text ellipsis type={unread > 0 ? undefined : 'secondary'} strong={unread > 0} style={{ fontSize: 12, margin: 0 }}>
                                            {conv.lastMessage?.content || 'No messages yet'}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </div>
                        );
                    })}
                </Flex>
            )}
        </>
    );
};

export default ConversationList;
