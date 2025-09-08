import { STORAGE_KEYS } from "@/constants/base";
import AsyncStorageService from "@/utils/storage";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { useLoading } from "./useLoading";

export const standardInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

const chatInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_CHAT_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

const fileInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  timeout: 10000,
});

interface DjangoErrorResponse {
  [key: string]: any;
  detail?: string;
  non_field_errors?: string[];
}

const useAxios = <T>(
  url: string,
  showPageLoader: boolean = false,
  useChatInstance: boolean = false
) => {
  
  const [response, setResponse] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoading();

  const instance = useMemo(() => {
    return useChatInstance ? chatInstance : standardInstance;
  }, [useChatInstance]);

  const getAccessToken = async () => {
    try {
      const accessToken = await AsyncStorageService.getItem(
        STORAGE_KEYS.ACCESS_TOKEN
      );
      return accessToken;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const handleError = (error: any): void => {
    let errorMessage = "Something went wrong";

    try {
      // Check if error has response data (Django error structure)
      if (error?.response?.data) {
        const errorData: DjangoErrorResponse = error.response.data;

        // 1. Check for custom error in "detail" key
        if (errorData.detail) {
          errorMessage =
            typeof errorData.detail === "string"
              ? errorData.detail
              : JSON.stringify(errorData.detail);
        }
        // 2. Check for non-field errors
        else if (
          errorData.non_field_errors &&
          errorData.non_field_errors.length > 0
        ) {
          errorMessage = errorData.non_field_errors[0];
        }
        // 3. Check for field-specific errors
        else {
          const fieldErrors = Object.keys(errorData)
            .filter((key) => key !== "detail" && key !== "non_field_errors")
            .map((key) => {
              const fieldError = errorData[key];
              if (Array.isArray(fieldError)) {
                return `${key}: ${fieldError[0]}`;
              }
              return `${key}: ${fieldError}`;
            });

          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors[0];
          }
        }
      }
      // 4. Check for network/axios errors
      else if (error?.message) {
        if (error.message.includes("Network Error")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timeout. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
    } catch (parseError) {
      console.error("Error parsing Django error:", parseError);
      errorMessage = "Something went wrong";
    }

    // Show toast with the extracted error message
    Toast.show({
      type: "error",
      text1: "Error",
      text2: errorMessage
    });
  };

  const requestGET = async (
    params: Record<string, any> = {},
    localUrl?: string
  ): Promise<AxiosResponse<T>> => {
    setIsLoading(true);
    if (showPageLoader) showLoader();
    setError(null);
    setResponse(null);

    instance.interceptors.request.use(async (config) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    try {
      const response = await instance.get(localUrl ? localUrl : url, { params });
      setResponse(response.data);
      return response;
    } catch (error: any) {
      setError(error.message);
      handleError(error);
      return error;
    } finally {
      setIsLoading(false);
      if (showPageLoader) hideLoader();
    }
  };

  const requestPOST = async (
    data: AxiosRequestConfig["data"],
    config: AxiosRequestConfig = {},
    localUrl?: string
  ): Promise<AxiosResponse<T>> => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    instance.interceptors.request.use(async (config) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    try {
      const response = await instance.post(localUrl ? localUrl : url, data);
      setResponse(response.data);
      return response;
    } catch (error: any) {
      console.log(error.response.data, "error.response.data");
      setError(error.message);
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPOSTFile = async (
    data: AxiosRequestConfig["data"],
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    fileInstance.interceptors.request.use(async (config) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    try {
      const response = await fileInstance.post(url, data);
      setResponse(response.data);
      return response;
    } catch (error: any) {
      setError(error.message);
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPUT = async (data: any, localUrl?: string): Promise<AxiosResponse<T>> => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    instance.interceptors.request.use(async (config) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    try {
      const response = await instance.put(localUrl ? localUrl : url, data);
      setResponse(response.data);
      return response;
    } catch (error: any) {
      setError(error.message);
      handleError(error);
      return error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPATCH = async (
    data: AxiosRequestConfig["data"], 
    localUrl?: string
  ): Promise<AxiosResponse<T>> => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    instance.interceptors.request.use(async (config) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    try {
      const response = await instance.patch(localUrl ? localUrl : url, data);
      setResponse(response.data);
      return response;
    } catch (error: any) {
      console.log(error.response.data);
      setError(error.message);
      handleError(error);
      return error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestDELETE = async (localUrl?: string): Promise<AxiosResponse<T>> => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    instance.interceptors.request.use(async (config) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    try {
      const response = await instance.delete(localUrl ? localUrl : url);
      setResponse(response.data);
      return response;
    } catch (error: any) {
      setError(error.message);
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    response,
    isLoading,
    error,
    requestGET,
    requestPOST,
    requestPOSTFile,
    requestPUT,
    requestPATCH,
    requestDELETE,
  };
};

export default useAxios;
