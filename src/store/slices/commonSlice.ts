import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { STORAGE_KEYS } from '@/constants/base'
import { standardInstance } from '@/hooks/useAxios'
import { iOrder } from '@/interfaces/order'
import { replaceUrlParams } from '@/utils/base'
import StorageService from '@/utils/storage'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AxiosResponse } from 'axios'

// Define a type for the slice state
interface CommonState {
}

// Define the initial state using that type
const initialState: CommonState = {
  
}

export const commonSlice = createSlice({
  name: 'common',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  
  reducers: {
    // reducers here
  },
  extraReducers: (builder) => {
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      // do nothing
    })
  }
})

export const {  } = commonSlice.actions

export const updateOrderStatus = createAsyncThunk(API_ENDPOINTS.UPDATE_ORDER_STATUS, async (payload : { orderId : string, status : string, estimatedDeliveryMinutes : number }) => {
  standardInstance.interceptors.request.use(async (config) => {
    const accessToken = await StorageService.getItem(
      STORAGE_KEYS.ACCESS_TOKEN,
    );
    if (accessToken) {
      config.headers.Authorization = `Token ${accessToken}`;
    }
    return config;
  });
  const { orderId, status, estimatedDeliveryMinutes } = payload;
  const response : AxiosResponse<iOrder> = await standardInstance.patch(replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId: orderId }), {
    status: status,
    estimated_delivery_mins: estimatedDeliveryMinutes
  })
  return response.data
})

export default commonSlice.reducer
