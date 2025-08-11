'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export enum AdminEventType {
  // User management events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_STATUS_CHANGED = 'user.status_changed',
  USER_BULK_ACTION = 'user.bulk_action',

  // Vendor management events
  VENDOR_CREATED = 'vendor.created',
  VENDOR_UPDATED = 'vendor.updated',
  VENDOR_STATUS_CHANGED = 'vendor.status_changed',
  VENDOR_VERIFIED = 'vendor.verified',

  // Product management events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  PRODUCT_STATUS_CHANGED = 'product.status_changed',

  // Order management events
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_STATUS_CHANGED = 'order.status_changed',

  // Payment events
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_FAILED = 'payment.failed',
  REFUND_PROCESSED = 'refund.processed',

  // System events
  SYSTEM_ALERT = 'system.alert',
  SYSTEM_METRIC_UPDATE = 'system.metric_update',
  ACTIVITY_LOG = 'activity.log',
}

interface AdminWebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (event: AdminEventType, handler: (data: any) => void) => void;
  unsubscribe: (event: AdminEventType, handler: (data: any) => void) => void;
  subscribeToChannel: (channel: string) => void;
  unsubscribeFromChannel: (channel: string) => void;
  emit: (event: string, data: any) => void;
}

const AdminWebSocketContext = createContext<AdminWebSocketContextType | null>(null);

export const useAdminWebSocket = () => {
  const context = useContext(AdminWebSocketContext);
  if (!context) {
    throw new Error('useAdminWebSocket must be used within AdminWebSocketProvider');
  }
  return context;
};

interface AdminWebSocketProviderProps {
  children: React.ReactNode;
}

export function AdminWebSocketProvider({ children }: AdminWebSocketProviderProps) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const eventHandlers = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) {
      // Initialize socket connection
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4800';
      const newSocket = io(`${wsUrl}/admin-ws`, {
        auth: {
          token: session.user.accessToken,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to admin WebSocket');
        setIsConnected(true);
        toast.success('Real-time updates connected');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from admin WebSocket');
        setIsConnected(false);
        toast.warning('Real-time updates disconnected');
      });

      newSocket.on('connect_error', error => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('connection_success', data => {
        console.log('Connection success:', data);
      });

      // Register event listeners from the map
      eventHandlers.current.forEach((handlers, event) => {
        handlers.forEach(handler => {
          newSocket.on(event, handler);
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [session, status]);

  const subscribe = useCallback((event: AdminEventType, handler: (data: any) => void) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, new Set());
    }
    eventHandlers.current.get(event)!.add(handler);

    // If socket is already connected, add the listener
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const unsubscribe = useCallback((event: AdminEventType, handler: (data: any) => void) => {
    const handlers = eventHandlers.current.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        eventHandlers.current.delete(event);
      }
    }

    // Remove listener from socket
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  const subscribeToChannel = useCallback((channel: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe', { channels: [channel] });
    }
  }, []);

  const unsubscribeFromChannel = useCallback((channel: string) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe', { channels: [channel] });
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const contextValue: AdminWebSocketContextType = {
    socket,
    isConnected,
    subscribe,
    unsubscribe,
    subscribeToChannel,
    unsubscribeFromChannel,
    emit,
  };

  return (
    <AdminWebSocketContext.Provider value={contextValue}>{children}</AdminWebSocketContext.Provider>
  );
}

// Hook for user management events
export function useUserManagementEvents() {
  const { subscribe, unsubscribe } = useAdminWebSocket();

  const onUserCreated = useCallback(
    (handler: (user: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.user);
      subscribe(AdminEventType.USER_CREATED, wrappedHandler);
      return () => unsubscribe(AdminEventType.USER_CREATED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onUserUpdated = useCallback(
    (handler: (user: any, changes: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.user, data.changes);
      subscribe(AdminEventType.USER_UPDATED, wrappedHandler);
      return () => unsubscribe(AdminEventType.USER_UPDATED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onUserDeleted = useCallback(
    (handler: (userId: string) => void) => {
      const wrappedHandler = (data: any) => handler(data.userId);
      subscribe(AdminEventType.USER_DELETED, wrappedHandler);
      return () => unsubscribe(AdminEventType.USER_DELETED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onUserStatusChanged = useCallback(
    (handler: (userId: string, oldStatus: string, newStatus: string) => void) => {
      const wrappedHandler = (data: any) => handler(data.userId, data.oldStatus, data.newStatus);
      subscribe(AdminEventType.USER_STATUS_CHANGED, wrappedHandler);
      return () => unsubscribe(AdminEventType.USER_STATUS_CHANGED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onUserBulkAction = useCallback(
    (handler: (action: string, userIds: string[], results: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.action, data.userIds, data.results);
      subscribe(AdminEventType.USER_BULK_ACTION, wrappedHandler);
      return () => unsubscribe(AdminEventType.USER_BULK_ACTION, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  return {
    onUserCreated,
    onUserUpdated,
    onUserDeleted,
    onUserStatusChanged,
    onUserBulkAction,
  };
}

// Hook for vendor management events
export function useVendorManagementEvents() {
  const { subscribe, unsubscribe } = useAdminWebSocket();

  const onVendorCreated = useCallback(
    (handler: (vendor: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.vendor);
      subscribe(AdminEventType.VENDOR_CREATED, wrappedHandler);
      return () => unsubscribe(AdminEventType.VENDOR_CREATED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onVendorUpdated = useCallback(
    (handler: (vendor: any, changes: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.vendor, data.changes);
      subscribe(AdminEventType.VENDOR_UPDATED, wrappedHandler);
      return () => unsubscribe(AdminEventType.VENDOR_UPDATED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onVendorStatusChanged = useCallback(
    (handler: (vendorId: string, oldStatus: string, newStatus: string) => void) => {
      const wrappedHandler = (data: any) => handler(data.vendorId, data.oldStatus, data.newStatus);
      subscribe(AdminEventType.VENDOR_STATUS_CHANGED, wrappedHandler);
      return () => unsubscribe(AdminEventType.VENDOR_STATUS_CHANGED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  return {
    onVendorCreated,
    onVendorUpdated,
    onVendorStatusChanged,
  };
}

// Hook for product management events
export function useProductManagementEvents() {
  const { subscribe, unsubscribe } = useAdminWebSocket();

  const onProductCreated = useCallback(
    (handler: (product: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.product);
      subscribe(AdminEventType.PRODUCT_CREATED, wrappedHandler);
      return () => unsubscribe(AdminEventType.PRODUCT_CREATED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onProductUpdated = useCallback(
    (handler: (product: any, changes: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.product, data.changes);
      subscribe(AdminEventType.PRODUCT_UPDATED, wrappedHandler);
      return () => unsubscribe(AdminEventType.PRODUCT_UPDATED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onProductDeleted = useCallback(
    (handler: (productId: string) => void) => {
      const wrappedHandler = (data: any) => handler(data.productId);
      subscribe(AdminEventType.PRODUCT_DELETED, wrappedHandler);
      return () => unsubscribe(AdminEventType.PRODUCT_DELETED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  return {
    onProductCreated,
    onProductUpdated,
    onProductDeleted,
  };
}

// Hook for order management events
export function useOrderManagementEvents() {
  const { subscribe, unsubscribe } = useAdminWebSocket();

  const onOrderCreated = useCallback(
    (handler: (order: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.order);
      subscribe(AdminEventType.ORDER_CREATED, wrappedHandler);
      return () => unsubscribe(AdminEventType.ORDER_CREATED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onOrderStatusChanged = useCallback(
    (handler: (orderId: string, oldStatus: string, newStatus: string) => void) => {
      const wrappedHandler = (data: any) => handler(data.orderId, data.oldStatus, data.newStatus);
      subscribe(AdminEventType.ORDER_STATUS_CHANGED, wrappedHandler);
      return () => unsubscribe(AdminEventType.ORDER_STATUS_CHANGED, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  return {
    onOrderCreated,
    onOrderStatusChanged,
  };
}

// Hook for system events
export function useSystemEvents() {
  const { subscribe, unsubscribe } = useAdminWebSocket();

  const onSystemAlert = useCallback(
    (handler: (alert: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.alert);
      subscribe(AdminEventType.SYSTEM_ALERT, wrappedHandler);
      return () => unsubscribe(AdminEventType.SYSTEM_ALERT, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onMetricUpdate = useCallback(
    (handler: (metric: string, value: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.metric, data.value);
      subscribe(AdminEventType.SYSTEM_METRIC_UPDATE, wrappedHandler);
      return () => unsubscribe(AdminEventType.SYSTEM_METRIC_UPDATE, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  const onActivityLog = useCallback(
    (handler: (activity: any) => void) => {
      const wrappedHandler = (data: any) => handler(data.activity);
      subscribe(AdminEventType.ACTIVITY_LOG, wrappedHandler);
      return () => unsubscribe(AdminEventType.ACTIVITY_LOG, wrappedHandler);
    },
    [subscribe, unsubscribe]
  );

  return {
    onSystemAlert,
    onMetricUpdate,
    onActivityLog,
  };
}
