import { object, string } from 'yup';

export const getOTPValidation = object({
    phone: string().required('Phone is required').min(10, 'Phone must be at least 10 digits').max(10, 'Phone must be at most 10 digits'),
})