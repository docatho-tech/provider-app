import { Colors } from '@/constants/Colors';
import { iCreateRazorpayOrderResponse, iRazorpayOrderRequest, iRazorpayOrderResponse } from '@/interfaces/payments';
import { useLocalSearchParams } from 'expo-router';
import RazorpayCheckout, { CheckoutOptions } from 'react-native-razorpay';

interface iUseRazorpayProps {
    onSuccess?: (data: { detail: string, order_id?: string }) => void;
    onError?: (error: any) => void;
}

const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

const useRazorpay = ({ onSuccess, onError }: iUseRazorpayProps) => {
    const { from_chat } = useLocalSearchParams();
    // const { requestPOST : verifyRazorpayPayment } = useAxios<{ detail: string, order_id?: string }>(API_ENDPOINTS.VERIFY_RAZORPAY_ORDER);
    // const { requestPOST: handleCreateRazorpayOrder, isLoading: isLoadingCreateRazorpayOrder } = useAxios<iCreateRazorpayOrderResponse>(API_ENDPOINTS.CREATE_RAZORPAY_ORDER);
    // const { requestGET: handleGetRazorpayOrder, isLoading: isLoadingGetRazorpayOrder } = useAxios<iRazorpayOrderResponse>(API_ENDPOINTS.GET_RAZORPAY_ORDER);

    const openRazorpayPaymentGateway = (amount: number, orderId: string, description: string = '') => {
        const options = {
            description: description,
            image: 'https://i.imgur.com/3g7nmJC.jpg',
            currency: 'INR',
            key: RAZORPAY_KEY,
            amount: amount,
            name: 'AstroGlobal',
            order_id: orderId,
            prefill: {
                email: '',
                contact: '',
                name: ''
            },
            theme: { color: Colors.primary }
        }

        RazorpayCheckout.open(options as unknown as CheckoutOptions).then((data) => {
            handleVerifyRazorpayPayment(data.razorpay_payment_id, orderId, data.razorpay_signature);
        }).catch((error) => {
            console.log(`Error: ${error.code} | ${error.description}`);
        });
    }

    const createRazorpayOrder = async (data: iRazorpayOrderRequest, description: string = '', openPaymentGateway: boolean = true): Promise<iCreateRazorpayOrderResponse | null> => {
        // try {
        //     const response = await handleCreateRazorpayOrder(data);
        //     if(response.status === 201) {
        //         if(openPaymentGateway) {
        //             openRazorpayPaymentGateway(response.data.razorpay_response.amount, response.data.razorpay_response.id, description)
        //         }
        //         return response.data;
        //     }
        // } catch (error) {
        //     console.log(error);
        //     Toast.show({
        //         text1: 'Something went wrong',
        //         type: 'error',
        //     });
        // }
        return null;
    }

    const getRazorpayOrder = async (orderId: string): Promise<iRazorpayOrderResponse | null> => {
        // const localURL = replaceUrlParams(API_ENDPOINTS.GET_RAZORPAY_ORDER, { orderId: orderId });
        // const response = await handleGetRazorpayOrder({}, localURL);
        // if(response.status === 200) {
        //     return response.data;
        // }
        return null;
    } 

    const handleVerifyRazorpayPayment = async (paymentId: string, orderId: string, signature: string) => {
        // const body = {
        //     order_id: orderId,
        //     payment_id: paymentId,
        //     signature,
        //     message_entry_keyword : from_chat === 'true' ? MESSAGE_KEYS.AFTER_WALLET_LOAD_MESSAGE : null
        // }

        // try {
        //     const response = await verifyRazorpayPayment(body);

        //     if(response.status === 200 && onSuccess) {
        //         onSuccess(response.data);
        //     } else {
        //         if(onError) {
        //             onError(response);
        //         }
        //     }
        // } catch (error) {
        //     console.log(error);
        //     if(onError) {
        //         onError(error);
        //     }
        // }
    }

    

    return {
        openRazorpayPaymentGateway,
        createRazorpayOrder,
        getRazorpayOrder
    }
}

export default useRazorpay