import { configureStore } from '@reduxjs/toolkit'
import authenticationReducer from './slices/authenticationSlice'
import commonReducer from './slices/commonSlice'

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    common: commonReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch