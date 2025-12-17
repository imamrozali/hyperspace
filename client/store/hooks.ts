import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selectors
export const useCurrentUser = () => useAppSelector((state) => state.user.currentUser);
export const useCurrentOrganization = () => useAppSelector((state) => state.organization.currentOrganization);
export const useCurrentOrganizationUnit = () => useAppSelector((state) => state.organizationUnit.currentOrganizationUnit);
export const useTheme = () => useAppSelector((state) => state.app.theme);