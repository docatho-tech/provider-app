import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Define a type for the slice state
interface AuthenticationState {
  isLoggedIn: boolean
}

// Define the initial state using that type
const initialState: AuthenticationState = {
  isLoggedIn: false,
}

export const authenticationSlice = createSlice({
  name: 'authentication',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload
    },
  },
  extraReducers: (builder) => {
    // builder.addCase(getProfileDetails.fulfilled, (state, action) => {
    //   state.profileDetails = action.payload
    // })
  }
})

export const { setIsLoggedIn } = authenticationSlice.actions

export default authenticationSlice.reducer

// Get profile details
// export const getProfileDetails = createAsyncThunk(API_ENDPOINTS.PROFILE, async () => {
//   standardInstance.interceptors.request.use(async (config) => {
//     const accessToken = await StorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
//     if(accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`
//     }
//     return config
//   })
//   const response : AxiosResponse<iProfile> = await standardInstance.get(API_ENDPOINTS.PROFILE)
//   return response.data
// })