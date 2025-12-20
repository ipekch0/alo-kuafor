import { useState, useEffect } from 'react';

/**
 * useFacebookSDK
 * 
 * A professional hook to load and manage the Facebook JavaScript SDK.
 * Handles async loading, initialization, and provides a wrapper for login.
 */
export const useFacebookSDK = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Prevent double loading
        if (window.FB) {
            setIsLoaded(true);
            return;
        }

        const loadSDK = () => {
            try {
                window.fbAsyncInit = function () {
                    window.FB.init({
                        appId: import.meta.env.VITE_FACEBOOK_APP_ID, // Use env var
                        cookie: true,
                        xfbml: true,
                        version: 'v18.0'
                    });
                    setIsLoaded(true);
                };

                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) return;
                    js = d.createElement(s); js.id = id;
                    js.src = "https://connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            } catch (err) {
                setError(err);
                console.error("Facebook SDK Load Error:", err);
            }
        };

        loadSDK();
    }, []);

    const login = async () => {
        if (!window.FB) throw new Error('Facebook SDK not loaded');

        return new Promise((resolve, reject) => {
            window.FB.login((response) => {
                if (response.authResponse) {
                    resolve(response.authResponse);
                } else {
                    reject(new Error('User cancelled login or did not fully authorize.'));
                }
            }, {
                // Critical scopes for WhatsApp Embedded Signup
                scope: 'whatsapp_business_management,whatsapp_business_messaging',
                extras: {
                    feature: 'whatsapp_embedded_signup',
                    sessionInfoVersion: '2' // Recommended for newer flows
                }
            });
        });
    };

    return { isLoaded, error, login };
};
