'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '@/client/store/slices/counterSlice';
import userReducer from '@/client/store/slices/userSlice';
import organizationReducer from '@/client/store/slices/organizationSlice';
import organizationUnitReducer from '@/client/store/slices/organizationUnitSlice';
import appReducer from '@/client/store/slices/appSlice';

interface TestProvidersProps {
  children: React.ReactNode;
}

export function TestProviders({ children }: TestProvidersProps) {
  const [queryClient] = React.useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })
  );

  const testStore = React.useMemo(() =>
    configureStore({
      reducer: {
        counter: counterReducer,
        user: userReducer,
        organization: organizationReducer,
        organizationUnit: organizationUnitReducer,
        app: appReducer,
      },
    }), []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={testStore}>
        {children}
      </Provider>
    </QueryClientProvider>
  );
}