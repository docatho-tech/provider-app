import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { STORAGE_KEYS } from '@/constants/base'
import { standardInstance } from '@/hooks/useAxios'
import { iAstrolgerResult } from '@/interfaces/astrologer'
import { iCreateThreadResponse } from '@/interfaces/chat'
import StorageService from '@/utils/storage'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AxiosResponse } from 'axios'

// Define a type for the slice state
interface CommonState {
  walletBalance: number
  astrologerDetailsWhileOnCall: Pick<iAstrolgerResult, 'astrologer'> | null
}

// Define the initial state using that type
const initialState: CommonState = {
  walletBalance: 0,
  astrologerDetailsWhileOnCall: null
}

export const commonSlice = createSlice({
  name: 'common',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  
  reducers: {
    setWalletBalance: (state, action: PayloadAction<number>) => {
      state.walletBalance = action.payload
    },

    setAstrologerDetailsWhileOnCall: (state, action: PayloadAction<Pick<iAstrolgerResult, 'astrologer'>>) => {
      state.astrologerDetailsWhileOnCall = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWalletBalance.fulfilled, (state, action) => {
      state.walletBalance = action.payload.balance
    })
    builder.addCase(createThread.fulfilled, (state, action) => {
      // do nothing
    })
  }
})

export const { setWalletBalance, setAstrologerDetailsWhileOnCall } = commonSlice.actions

export default commonSlice.reducer

export const fetchWalletBalance = createAsyncThunk(API_ENDPOINTS.GET_WALLET_BALANCE, async () => {
    standardInstance.interceptors.request.use(async (config) => {
        const accessToken = await StorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        if(accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    })  
    const response : AxiosResponse<{balance: number}> = await standardInstance.get(API_ENDPOINTS.GET_WALLET_BALANCE)
    return response.data
});

export const createThread = createAsyncThunk(API_ENDPOINTS.CREATE_THREAD, async (data: {selected_topic: number | null, astrologer_user_id: number | null}) => {
  standardInstance.interceptors.request.use(async (config) => {
    const accessToken = await StorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if(accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  })
  const response : AxiosResponse<iCreateThreadResponse> = await standardInstance.post(API_ENDPOINTS.CREATE_THREAD, data)
  return response.data
})