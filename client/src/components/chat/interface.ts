import type { IConversation, IMessage } from '../../interface';
import React from 'react';

export interface IConversationListProps {
    conversations: IConversation[];
    userDataId: string;
    isLoadingConvs: boolean;
    setActiveConversation: (conv: IConversation) => void;
}

export interface IMessagingRoomProps {
    activeConversation: IConversation;
    userDataId: string;
    otherParticipantName: string;
    isLoadingMsgs: boolean;
    messages: IMessage[];
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
    fetchConversations: () => void;
}
