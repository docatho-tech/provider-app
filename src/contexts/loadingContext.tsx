import { Colors } from '@/constants/Colors';
import React, { createContext, ReactNode, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingContextType {
    showLoader: (message?: string) => void;
    hideLoader: () => void;
    isLoading: boolean;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading...');

    const showLoader = (message: string = 'Loading...') => {
        setLoadingMessage(message);
        setIsLoading(true);
    };

    const hideLoader = () => {
        setIsLoading(false);
        setLoadingMessage('Loading...');
    };

    return (
        <LoadingContext.Provider value={{ showLoader, hideLoader, isLoading }}>
            {children}
            {isLoading && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        elevation: 9999
                    }}
                >
                    <View className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl items-center shadow-2xl mx-4">
                        <View className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 justify-center items-center mb-4">
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                        <Text className="text-lg font-semibold text-primary text-center mt-[15px]">
                            {loadingMessage}
                        </Text>
                    </View>
                </View>
            )}
        </LoadingContext.Provider>
    );
};