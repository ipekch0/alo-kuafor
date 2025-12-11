const axios = require('axios');

// SMS Service Wrapper
// Can switch between Mock (Console) and Providers (Netgsm, Twilio)

const sendSMS = async (phone, message) => {
    try {
        // Normalize phone number (remove spaces, ensure TR format)
        const cleanPhone = phone.replace(/\D/g, ''); // 05551234567 -> 05551234567

        // 1. MOCK (DEVELOPMENT)
        // If no API credentials, log to console
        if (!process.env.NETGSM_USER || process.env.NODE_ENV !== 'production') {
            console.log('📱 [MOCK SMS] To:', cleanPhone);
            console.log('💬 [MOCK SMS] Message:', message);
            return { success: true, method: 'mock' };
        }

        // 2. NETGSM (PRODUCTION)
        const netgsmPayload = {
            usercode: process.env.NETGSM_USER,
            password: process.env.NETGSM_PASSWORD,
            gsmno: cleanPhone,
            message: message,
            msgheader: process.env.NETGSM_HEADER || 'ODAKMANAGE',
            filter: '0', // 0: No filter
            startdate: '',
            stopdate: ''
        };

        // This is a simplified fetch, real Netgsm might need XML or specific GET/POST format
        // Check Netgsm API docs for exact endpoint (usually XML or GET)
        const response = await axios.post('https://api.netgsm.com.tr/sms/send/get', null, { params: netgsmPayload });

        console.log('Netgsm Response:', response.data);
        return { success: true, provider: 'netgsm', data: response.data };

    } catch (error) {
        console.error('SMS Send Error:', error.message);
        // Don't throw error to stop auth flow, just return false?
        // Or throw to alert user? Better to throw so we can fallback
        throw new Error('SMS gönderimi başarısız.');
    }
};

module.exports = { sendSMS };
