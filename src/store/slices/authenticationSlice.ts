import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { STORAGE_KEYS } from '@/constants/base'
import { standardInstance } from '@/hooks/useAxios'
import { iProfile } from '@/interfaces/authentication'
import StorageService from '@/utils/storage'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AxiosResponse } from 'axios'


// Define a type for the slice state
interface AuthenticationState {
  profile: iProfile | null
}

// Define the initial state using that type
const initialState: AuthenticationState = {
  profile: null,
}

export const authenticationSlice = createSlice({
  name: 'authentication',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<iProfile>) => {
      state.profile = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProfileDetails.fulfilled, (state, action) => {
      state.profile = action.payload
    })
  }
})

export const { setProfile } = authenticationSlice.actions

export default authenticationSlice.reducer

//Get profile details
export const getProfileDetails = createAsyncThunk<iProfile>(API_ENDPOINTS.GET_PROFILE, async () => {
  standardInstance.interceptors.request.use(async (config) => {
    const accessToken = await StorageService.getItem(
      STORAGE_KEYS.ACCESS_TOKEN,
    );
    if (accessToken) {
      config.headers.Authorization = `Token ${accessToken}`;
    }
    return config;
  });
  const response : AxiosResponse<iProfile> = await standardInstance.get(API_ENDPOINTS.GET_PROFILE)
  return response.data
})