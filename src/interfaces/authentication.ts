export interface VerifyOTPResponse {
    detail: string;
    token: string;
}

export interface iProfile {
    id: number;
    name: string;
    dob: string;
    email: string;
}