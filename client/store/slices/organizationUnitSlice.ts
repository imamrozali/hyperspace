import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrganizationUnit {
  id: string;
  name: string;
  // Add other organization unit fields as needed
}

interface OrganizationUnitState {
  currentOrganizationUnit: OrganizationUnit | null;
}

const initialState: OrganizationUnitState = {
  currentOrganizationUnit: null,
};

const organizationUnitSlice = createSlice({
  name: 'organizationUnit',
  initialState,
  reducers: {
    setCurrentOrganizationUnit: (state, action: PayloadAction<OrganizationUnit>) => {
      state.currentOrganizationUnit = action.payload;
    },
    clearCurrentOrganizationUnit: (state) => {
      state.currentOrganizationUnit = null;
    },
    clearAll: (state) => {
      state.currentOrganizationUnit = null;
    },
  },
});

export const { setCurrentOrganizationUnit, clearCurrentOrganizationUnit, clearAll } = organizationUnitSlice.actions;
export default organizationUnitSlice.reducer;