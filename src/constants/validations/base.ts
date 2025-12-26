import { object, string } from 'yup';

export const phoneNumberValidation = object({
    phone: string().required('Phone is required').min(10, 'Phone must be at least 10 digits').max(10, 'Phone must be at most 10 digits'),
})

export const profileValidation = object({
    name: string().required('Name is required'),
    dob: string().required('Date of birth is required'),
    email: string().email('Invalid email'),
})