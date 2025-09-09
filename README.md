# Docatho Provider App

## Environment Setup

Before starting the project, you need to set up environment variables:

1. **Create `.env.local` file in the root directory**
2. **Use `.env.example` as reference** (if available) or add the following variables:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=your_api_base_url
```

## Setup Instructions

### Prerequisites
- Node.js installed on your system
- npm package manager

### Project Setup

1. **Install dependencies**
   ```bash
   npm i
   ```

2. **Add Google Services configuration** (if required)
   - Place your `google-services.json` file in the root location.

3. **Start the development server**
   ```bash
   npm run start
   ```

### Local Development Build

For creating development builds in your local machine, use the following Expo commands:

```bash
npx expo run:ios
npx expo run:android
```

Use the emulator/simulator of your choice

### EAS Development Build

For creating development builds using EAS (Expo Application Services), follow these steps:

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to your Expo account**
   ```bash
   eas login
   ```

3. **Configure EAS build**
   ```bash
   eas build:configure
   ```

4. **Create development build**
   ```bash
   # For iOS
   eas build --platform ios --profile development-simulator
   
   # For Android
   eas build --platform android --profile development-simulator
   ```

5. **Install the build on your device**
   - Download the build from the provided link
   - Install on your iOS/Android device

## App Routing Structure

This app uses Expo Router with file-based routing. Follow these guidelines when creating new routes:

### Route Groups

- **`(protected)`** - All authenticated routes should be placed inside this group
  - Requires user to be logged in
  - Automatically redirects to login if not authenticated
  - Contains sub-groups for different UI layouts

- **`(headerless)`** - Pages that don't require a header/navigation bar
  - Located inside `(protected)` group
  - Use for full-screen experiences like splash screens, onboarding, etc.

- **`(withheader)`** - Pages that require a header/navigation bar
  - Located inside `(protected)` group
  - Use for standard app pages with navigation

- **`(tabs)`** - Tab-based navigation pages
  - Located inside `(protected)` group
  - Use for main app sections with bottom tab navigation

### Public Routes

- **`login.tsx`** - Authentication login page
- **`otp.tsx`** - OTP verification page

### Creating New Routes

1. **For protected pages**: Create files inside `(protected)` group
2. **For pages without header**: Place inside `(protected)/(headerless)`
3. **For pages with header**: Place inside `(protected)/(withheader)`
4. **For tab pages**: Place inside `(protected)/(tabs)`
5. **For public pages**: Create directly in `src/app/` directory

## Asset Management

### Image Placement Guidelines

When adding images for specific pages, follow these practices:

1. **Create a folder for each page**
   - Create a folder named after the page inside `src/assets/images/`
   - Example: `src/assets/images/login/` for login page images

2. **Place images in the page-specific folder**
   - Add all images related to that page in its dedicated folder
   - Use descriptive names for image files

3. **Register images in constants**
   - Add image imports to `src/constants/Images.ts`
   - Export images with descriptive names

### Example Structure

```
src/assets/images/
├── login/
│   ├── login-banner.png
│   └── login-icon.png
├── dashboard/
│   ├── dashboard-bg.png
│   └── dashboard-icon.png
└── common/
    ├── logo.png
    └── placeholder.png
```

### Example Images.ts Registration

```typescript
const Images = {
  loginBanner: require('../assets/images/login/login-banner.png'),
  dashboardBg: require('../assets/images/dashboard/dashboard-bg.png'),
  logo: require('../assets/images/common/logo.png'),
};

export default Images;
```

## API Calling Guidelines

### Using useAxios Hook

For API calls in React components, use the `useAxios` hook:

```typescript
import { useAxios } from '@/hooks/useAxios';
import { API_ENDPOINTS } from '@/constants/APIEndpoints';

const MyComponent = () => {
  const { requestGET: getUserDetails, response } = useAxios(API_ENDPOINTS.GET_OTP);

  const { requestPOST: validateOTP, response } = useAxios(API_ENDPOINTS.GET_OTP);

  const fetchData = async () => {
    await getUserDetails();
  };

  const postData = async (data: unknown) => {
    await validateOTP(data);
  };

  return (
    // Your component JSX
  );
};
```

### Available Methods

- `requestGET(params?, localUrl?)` - GET requests
- `requestPOST(data, config?, localUrl?)` - POST requests
- `requestPOSTFile(data, config?)` - File upload requests
- `requestPUT(data, localUrl?)` - PUT requests
- `requestPATCH(data, localUrl?)` - PATCH requests
- `requestDELETE(localUrl?)` - DELETE requests

### Redux API Calls

For API calls in Redux slices, import the appropriate axios instance directly:

```typescript
import { standardInstance, chatInstance, fileInstance } from '@/hooks/useAxios';

// Use standardInstance for regular API calls
const response = await standardInstance.get('/api/endpoint');

// Use chatInstance for chat-related API calls
const chatResponse = await chatInstance.post('/chat/message');

// Use fileInstance for file uploads
const fileResponse = await fileInstance.post('/upload', formData);
```

### API Endpoints

Define all API endpoints in `src/constants/APIEndpoints.ts`:

```typescript
export const API_ENDPOINTS = Object.freeze({
  GET_OTP: '/account/check-user/',
  LOGIN: '/account/login/',
  GET_USER_PROFILE: '/users/:userId/profile',
  UPDATE_USER: '/users/:userId',
  // Add more endpoints here
});
```

### Dynamic API Routes

For API endpoints with dynamic parameters, use the `replaceUrlParams` utility directly in the `useAxios` parameters:

```typescript
import { replaceUrlParams } from '@/utils/base';
import { API_ENDPOINTS } from '@/constants/APIEndpoints';

const MyComponent = () => {
  const { requestGET: getUserProfile } = useAxios(
    replaceUrlParams(API_ENDPOINTS.GET_USER_PROFILE, { userId: '123' })
  );

  const fetchUserProfile = async () => {
    await getUserProfile();
  };

  return (
    // Your component JSX
  );
};
```

### replaceUrlParams Usage

The `replaceUrlParams` method replaces URL parameters with actual values:

```typescript
// URL with parameters
const url = '/users/:userId/profile/:sectionId';

// Replace parameters
const dynamicUrl = replaceUrlParams(url, { 
  userId: '123', 
  sectionId: '456' 
});

// Result: '/users/123/profile/456'
```

## General Components

Use the pre-built components from `components/general` for common UI elements:

- **`BottomSheet`** - Modal bottom sheet component with backdrop and gesture handling
- **`CustomFlatList`** - Enhanced FlatList with loading states, pagination, and customizable styling
- **`DatePicker`** - Date selection component with bottom sheet modal and platform-specific handling
- **`Input`** - Text input component with label, placeholder, and customizable styling
- **`Modal`** - Full-screen modal component with keyboard avoidance and backdrop press handling
- **`TimePicker`** - Time selection component with bottom sheet modal and platform-specific handling

## Redux State Management

### Creating Slices

Create appropriate slices for specific features or use `commonSlice` for general state:

```typescript
// For specific features - create new slice
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    isLoading: false,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
});

// For general state - use commonSlice
export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    theme: 'light',
    notifications: [],
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});
```

### Using Redux Hooks

Use typed hooks for better TypeScript support:

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks/useStoreHooks';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.authentication.isLoggedIn);
  const theme = useAppSelector((state) => state.common.theme);

  const handleLogin = () => {
    dispatch(setIsLoggedIn(true));
  };

  return (
    // Your component JSX
  );
};
```

### API Calls in Slices

Use `createAsyncThunk` for API calls within slices:

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { standardInstance } from '@/hooks/useAxios';
import { API_ENDPOINTS } from '@/constants/APIEndpoints';

// Create async thunk for API call
export const fetchUserProfile = createAsyncThunk(
  API_ENDPOINTS.GET_USER_PROFILE,
  async (userId: string) => {
    const response = await standardInstance.get(
      `${API_ENDPOINTS.GET_USER_PROFILE}/${userId}`
    );
    return response.data;
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});
```

### Best Practices

- **Use `useAppDispatch` and `useAppSelector`** instead of traditional `useDispatch` and `useSelector`
- **Create specific slices** for major features (authentication, user, etc.)
- **Use `commonSlice`** for general app state (theme, notifications, etc.)
- **Define proper TypeScript interfaces** for slice state
- **Use `createAsyncThunk`** for API calls with proper loading and error states

### API Calling Strategy

**Preferred Approach**: Call APIs directly in components using the `useAxios` hook for better component-level state management and reusability.

**Use Redux Slices for API calls only when**:
- API calls are repeated across multiple pages/components
- You need to share API response data across the entire application
- Complex state management is required for the API response

**Example**: If user profile data is needed in multiple screens, use Redux slice. If it's only needed in one component, use `useAxios` hook directly in the component.

## Context Providers

The app includes three main context providers for global state management:

### Authentication Context (`AuthProvider`)

Handles all authentication-related functionality including login, logout, and token management:

```typescript
import { AuthContext } from '@/contexts/authenticationContext';

const MyComponent = () => {
  const { isLoggedIn, isReady, loginAndSetTokens, logOut } = useContext(AuthContext);

  const handleLogin = async (accessToken: string, refreshToken: string) => {
    await loginAndSetTokens(accessToken, refreshToken, '/dashboard');
  };

  const handleLogout = async () => {
    await logOut();
  };

  return (
    // Your component JSX
  );
};
```

**Available Functions**:
- `loginAndSetTokens(accessToken, refreshToken, redirectTo?)` - Login and store tokens
- `logOut()` - Logout and clear tokens
- `isLoggedIn` - Boolean indicating login status
- `isReady` - Boolean indicating if auth check is complete

**Note**: Login/logout functionality is fully handled by the context. Just call the provided functions - no additional setup required.

### Loading Context (`LoadingProvider`)

Manages global loading states with customizable messages:

```typescript
import { useLoading } from '@/hooks/useLoading';

const MyComponent = () => {
  const { showLoader, hideLoader } = useLoading();

  const handleApiCall = async () => {
    showLoader('Processing your request...');
    try {
      // Your API call
    } finally {
      hideLoader();
    }
  };

  return (
    // Your component JSX
  );
};
```

### Toast Context (`ToastProvider`)

Provides global toast notifications throughout the app:

```typescript
import Toast from 'react-native-toast-message';

// Show success toast
Toast.show({
  type: 'success',
  text1: 'Success',
  text2: 'Operation completed successfully'
});

// Show error toast
Toast.show({
  type: 'error',
  text1: 'Error',
  text2: 'Something went wrong'
});
```