import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import counterReducer, { clearAll as clearCounter } from './slices/counterSlice';
import userReducer, { clearAll as clearUser } from './slices/userSlice';
import organizationReducer, { clearAll as clearOrganization } from './slices/organizationSlice';
import organizationUnitReducer, { clearAll as clearOrganizationUnit } from './slices/organizationUnitSlice';
import appReducer, { clearAll as clearApp } from './slices/appSlice';
import { indexedDBStorage } from './storage';

const persistConfig = {
  key: 'root',
  storage: indexedDBStorage,
};

const persistedCounterReducer = persistReducer({ ...persistConfig, key: 'counter' }, counterReducer);
const persistedUserReducer = persistReducer({ ...persistConfig, key: 'user' }, userReducer);
const persistedOrganizationReducer = persistReducer({ ...persistConfig, key: 'organization' }, organizationReducer);
const persistedOrganizationUnitReducer = persistReducer({ ...persistConfig, key: 'organizationUnit' }, organizationUnitReducer);
const persistedAppReducer = persistReducer({ ...persistConfig, key: 'app' }, appReducer);

export const store = configureStore({
  reducer: {
    counter: persistedCounterReducer,
    user: persistedUserReducer,
    organization: persistedOrganizationReducer,
    organizationUnit: persistedOrganizationUnitReducer,
    app: persistedAppReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const clearAllData = () => async (dispatch: AppDispatch) => {
  dispatch(clearCounter());
  dispatch(clearUser());
  dispatch(clearOrganization());
  dispatch(clearOrganizationUnit());
  dispatch(clearApp());
  await indexedDBStorage.clearAll();
};