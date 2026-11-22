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
    INSIGHTS: '/api/providers/insights/',
    STATEMENT: '/api/providers/statement/',
    PARTNER_CATALOG: '/api/providers/catalog/',
    BANK: '/api/providers/bank/',

    APPOINTMENTS: '/api/healthcare/provider/appointments/',
    APPOINTMENT_DETAIL: '/api/healthcare/provider/appointments/:appointmentId/',
    APPOINTMENT_VIDEO_TOKEN: '/api/healthcare/provider/appointments/:appointmentId/video-token/',
    APPOINTMENT_VIDEO_END: '/api/healthcare/provider/appointments/:appointmentId/video-end/',
    APPOINTMENT_PRESCRIPTION: '/api/healthcare/provider/appointments/:appointmentId/prescription/',
    APPOINTMENT_MESSAGES: '/api/healthcare/appointments/:appointmentId/messages/',

    DIAGNOSTIC_BOOKINGS: '/api/healthcare/provider/diagnostic-bookings/',
    DIAGNOSTIC_BOOKING_DETAIL: '/api/healthcare/provider/diagnostic-bookings/:bookingId/',
    UPLOADS: '/api/uploads/',
    DOCTOR_PROFILE: '/api/healthcare/provider/doctor-profile/',
    AVAILABILITY: '/api/healthcare/provider/availability/',
    BLOCKED_DATES: '/api/healthcare/provider/blocked-dates/',

    GET_PROFILE_PROVIDER: '/api/providers/profile/',
    DEVICE_TOKEN: '/api/device-tokens/',

    NOTIFICATIONS: '/api/notifications/',
    NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread_count/',
    NOTIFICATION_MARK_READ: '/api/notifications/:notificationId/mark_read/',
    NOTIFICATIONS_MARK_ALL_READ: '/api/notifications/mark_all_read/',

    MEDICINES: '/api/medicines/',
})