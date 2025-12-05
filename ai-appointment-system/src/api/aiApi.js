const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const aiApi = {
    // Send message to AI
    async sendMessage(message, sessionId = null) {
        try {
            const response = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    sessionId: sessionId || `session_${Date.now()}`
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'AI iletişim hatası');
            }

            return await response.json();
        } catch (error) {
            console.error('AI API Error:', error);
            throw error;
        }
    },

    // Clear conversation history
    async clearHistory(sessionId) {
        try {
            const response = await fetch(`${API_URL}/api/ai/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            });

            return await response.json();
        } catch (error) {
            console.error('Clear History Error:', error);
            throw error;
        }
    },

    // Check AI service status
    async checkStatus() {
        try {
            const response = await fetch(`${API_URL}/api/ai/status`);
            return await response.json();
        } catch (error) {
            console.error('Status Check Error:', error);
            return { configured: false, status: 'error' };
        }
    }
};
