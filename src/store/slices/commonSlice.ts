import { createSlice } from '@reduxjs/toolkit'

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
  }
})

export const {  } = commonSlice.actions

export default commonSlice.reducer
