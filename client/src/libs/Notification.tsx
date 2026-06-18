import { App } from 'antd';
import React, { useEffect } from 'react';
import type { NotificationInstance } from 'antd/es/notification/interface';

export let notification: NotificationInstance | null = null;

export const initNotification = (
    notificationParam: NotificationInstance | null
) => {
    notification = notificationParam;
};

const Notification: React.FC = () => {
    const appParams = App.useApp();

    useEffect(() => {
        initNotification(appParams.notification);
    }, [appParams.notification]);

    return null;
};

export default Notification;
