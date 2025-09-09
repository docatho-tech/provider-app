import { STORAGE_KEYS } from "@/constants/base";
import { useAppDispatch } from "@/hooks/useStoreHooks";
import StorageService from "@/utils/storage";
import { RelativePathString, SplashScreen, useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  loginAndSetTokens: (accessToken: string, refreshToken: string, redirectTo : string | undefined) => void;
  logOut: () => void;
};

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  loginAndSetTokens: async () => {},
  logOut: () => {},
});

const AuthProvider = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  // const userAppConfigs = useAppSelector((state) => state.authentication.userAppConfigs);

  useEffect(() => {
    const getTokenFromStorage = async () => {
      const accessToken = await StorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);  
      if(accessToken) {
        setIsLoggedIn(true);
      }
      setIsReady(true);
    };
    getTokenFromStorage();
  }, []);

  useEffect(() => {
    if(isLoggedIn) {
      // dispatch(getUserAppConfigs());
    }
  }, [isLoggedIn]);

  useEffect(() => {    
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  const login = async (accessToken: string, refreshToken: string, redirectTo : string | undefined) => {
    try {
      await StorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await StorageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      setIsLoggedIn(true);
      if(redirectTo) {
        router.replace(redirectTo as RelativePathString);
      }
      else {
        router.replace("/");
      }
    } catch (error) {
      console.log("Error logging in", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await StorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      setIsLoggedIn(false);
      router.replace("/login");
    } catch (error) {
      console.log("Error logging out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      isReady,
      loginAndSetTokens : login,
      logOut : logOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;