import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Badge, Button, Avatar, Flex, Typography, theme, FloatButton, Card } from 'antd';
import { MessageSquare, X, ChevronLeft } from 'lucide-react';
import ConversationList from './ConversationList';
import MessagingRoom from './MessagingRoom';

const { Text } = Typography;

const FloatingChat: React.FC = () => {
    const { userData } = useAuth();
    const { token } = theme.useToken();
    const {
        isOpen,
        setIsOpen,
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        setMessages,
        isLoadingConvs,
        isLoadingMsgs,
        fetchConversations
    } = useChat();

    const totalUnreadCount = useMemo(() => (
        conversations.reduce((acc, curr) => (userData ? acc + (curr.unreadCount[userData.id] || 0) : acc), 0)
    ), [conversations, userData]);

    const otherParticipant = useMemo(() => (
        activeConversation && userData ? activeConversation.participants.find(p => p.id !== userData.id) : null
    ), [activeConversation, userData]);

    const otherParticipantName = useMemo(() => (
        otherParticipant ? otherParticipant.name : 'User'
    ), [otherParticipant]);

    const titleText = useMemo(() => (
        activeConversation ? otherParticipantName : 'Messages'
    ), [activeConversation, otherParticipantName]);

    return (
        <>
            {userData ? (
                !isOpen ? (
                    <FloatButton
                        type="primary"
                        icon={<MessageSquare size={20} />}
                        onClick={() => setIsOpen(true)}
                        badge={{ count: totalUnreadCount, overflowCount: 99 }}
                        style={{ right: 24, bottom: 24, zIndex: 1000 }}
                    />
                ) : (
                    <div className="!fixed !bottom-0 !right-6 z-[999]">
                        <Card
                            size="small"
                            className="w-[360px] shadow-2xl rounded-b-none transition-all duration-300"
                            classNames={{
                                header: `!px-4 !py-3 !min-h-0 border-b border-gray-100 dark:border-zinc-800`,
                                body: `!p-0 overflow-hidden`
                            }}
                            title={
                                activeConversation ? (
                                    <Flex align="center" gap="small">
                                        <Button type="text" shape="circle" icon={<ChevronLeft size={18} />} onClick={(e) => { e.stopPropagation(); setActiveConversation(null); }} />
                                        <Avatar style={{ backgroundColor: token.colorPrimary, color: '#fff' }}>
                                            {otherParticipantName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Flex vertical style={{ minWidth: 0 }}>
                                            <Text strong ellipsis style={{ width: 160, fontSize: 14 }}>
                                                {otherParticipantName}
                                            </Text>
                                            <Text style={{ fontSize: 10, color: token.colorSuccess, lineHeight: 1 }}>Online</Text>
                                        </Flex>
                                    </Flex>
                                ) : (
                                    <Flex align="center" gap="small">
                                        <Badge dot={totalUnreadCount > 0}>
                                            <MessageSquare size={18} color={token.colorPrimary} />
                                        </Badge>
                                        <Text strong style={{ fontSize: 14 }}>{titleText}</Text>
                                    </Flex>
                                )
                            }
                            extra={
                                <Flex align="center" gap={6} onClick={e => e.stopPropagation()}>
                                    <Button type="text" shape="circle" icon={<X size={16} />} onClick={() => setIsOpen(false)} />
                                </Flex>
                            }
                        >
                            <div className="flex flex-col h-[450px] overflow-y-auto min-h-0 custom-scrollbar">
                                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="custom-scrollbar">
                                    {activeConversation ? (
                                        <MessagingRoom
                                            activeConversation={activeConversation}
                                            userDataId={userData.id}
                                            otherParticipantName={otherParticipantName}
                                            isLoadingMsgs={isLoadingMsgs}
                                            messages={messages}
                                            setMessages={setMessages}
                                            fetchConversations={fetchConversations}
                                        />
                                    ) : (
                                        <ConversationList
                                            conversations={conversations}
                                            userDataId={userData.id}
                                            isLoadingConvs={isLoadingConvs}
                                            setActiveConversation={setActiveConversation}
                                        />
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )
            ) : null}
        </>
    );
};

export default FloatingChat;
