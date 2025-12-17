import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Organization {
  id: string;
  name: string;
  // Add other organization fields as needed
}

interface OrganizationState {
  currentOrganization: Organization | null;
}

const initialState: OrganizationState = {
  currentOrganization: null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrganization: (state, action: PayloadAction<Organization>) => {
      state.currentOrganization = action.payload;
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
    },
    clearAll: (state) => {
      state.currentOrganization = null;
    },
  },
});

export const { setCurrentOrganization, clearCurrentOrganization, clearAll } = organizationSlice.actions;
export default organizationSlice.reducer;