import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../libs/axios/axios';
import type { IConversation, IMessage } from '../interface';
import stompClient from '../libs/stomp';

interface IChatContext {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    conversations: IConversation[];
    setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
    activeConversation: IConversation | null;
    setActiveConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
    messages: IMessage[];
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
    isLoadingConvs: boolean;
    isLoadingMsgs: boolean;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<IChatContext | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { userData } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<IConversation | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoadingConvs, setIsLoadingConvs] = useState(false);
    const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);

    const fetchConversations = useCallback(async () => {
        if (!userData) return;
        setIsLoadingConvs(true);
        try {
            const { data } = await apiClient.get<IConversation[]>('/chat/conversations');
            setConversations(data);
        } catch (err) {
            console.error('Failed to fetch conversations', err);
        } finally {
            setIsLoadingConvs(false);
        }
    }, [userData]);

    const fetchMessages = useCallback(async (conversationId: string) => {
        setIsLoadingMsgs(true);
        try {
            const { data } = await apiClient.get<IMessage[]>(`/chat/conversations/${conversationId}/messages`);
            setMessages(data);

            await apiClient.post(`/chat/conversations/${conversationId}/read`);
            fetchConversations();
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setIsLoadingMsgs(false);
        }
    }, [fetchConversations]);

    const handleIncomingMessage = useCallback((msg: IMessage) => {
        if (activeConversation && msg.conversationId === activeConversation.id) {
            setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            if (isOpen) {
                apiClient.post(`/chat/conversations/${activeConversation.id}/read`).then(() => {
                    fetchConversations();
                });
            }
        } else {
            fetchConversations();
        }
    }, [activeConversation, isOpen, fetchConversations]);

    const handleIncomingMessageRef = useRef(handleIncomingMessage);

    useEffect(() => {
        handleIncomingMessageRef.current = handleIncomingMessage;
    }, [handleIncomingMessage]);

    useEffect(() => {
        if (!userData?.id) {
            stompClient.deactivate();
            return;
        }

        stompClient.onConnect = () => {
            stompClient.subscribe(`/topic/messages.${userData.id}`, (message) => {
                try {
                    const msg = JSON.parse(message.body) as IMessage;
                    if (handleIncomingMessageRef.current) {
                        handleIncomingMessageRef.current(msg);
                    }
                } catch (e) {
                    console.error('Failed to parse incoming message', e);
                }
            });
        };

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [userData?.id]);

    useEffect(() => {
        if (activeConversation && isOpen) {
            fetchMessages(activeConversation.id);
        }
    }, [activeConversation, isOpen, fetchMessages]);

    useEffect(() => {
        if (isOpen && userData) {
            fetchConversations();
        }
    }, [isOpen, userData, fetchConversations]);

    const handleOpenChat = useCallback(async (e: Event) => {
        const customEvent = e as CustomEvent<{ userId: string; userName: string }>;
        const { userId } = customEvent.detail;

        setIsOpen(true);

        try {
            const { data } = await apiClient.post<IConversation>(`/chat/conversations/${userId}`);
            setActiveConversation(data);
            fetchConversations();
        } catch (err) {
            console.error('Failed to initiate conversation with user:', userId, err);
        }
    }, [fetchConversations]);

    useEffect(() => {
        window.addEventListener('open-chat', handleOpenChat);
        return () => {
            window.removeEventListener('open-chat', handleOpenChat);
        };
    }, [handleOpenChat]);

    return (
        <ChatContext.Provider value={{
            isOpen,
            setIsOpen,
            conversations,
            setConversations,
            activeConversation,
            setActiveConversation,
            messages,
            setMessages,
            isLoadingConvs,
            isLoadingMsgs,
            fetchConversations,
            fetchMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
};
