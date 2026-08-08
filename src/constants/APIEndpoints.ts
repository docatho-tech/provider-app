export const API_ENDPOINTS = Object.freeze({
    SEND_OTP: '/api/providers/send-otp/',
    VERIFY_OTP: '/api/providers/verify-otp/',
    UPDATE_PROFILE: '/api/update-profile/',
    GET_PROFILE: '/api/profile/',

    ORDER_LIST: '/api/providers/chemist-order-list/',
    UPDATE_ORDER_STATUS: '/api/providers/chemist-order-update/:orderId/',
    ORDER_DETAILS: '/api/providers/order-detail/:orderId/',
    ORDER_INVOICE: '/api/providers/order-invoice/:orderId/',
    EARNINGS: '/api/providers/earnings/',
    BANK: '/api/providers/bank/',

    APPOINTMENTS: '/api/healthcare/provider/appointments/',
    APPOINTMENT_VIDEO_TOKEN: '/api/healthcare/provider/appointments/:appointmentId/video-token/',
    DOCTOR_PROFILE: '/api/healthcare/provider/doctor-profile/',
    AVAILABILITY: '/api/healthcare/provider/availability/',

    GET_PROFILE_PROVIDER: '/api/providers/profile/',
    DEVICE_TOKEN: '/api/device-tokens/',

    NOTIFICATIONS: '/api/notifications/',
    NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread_count/',
    NOTIFICATION_MARK_READ: '/api/notifications/:notificationId/mark_read/',
    NOTIFICATIONS_MARK_ALL_READ: '/api/notifications/mark_all_read/',

    MEDICINES: '/api/medicines/',
})