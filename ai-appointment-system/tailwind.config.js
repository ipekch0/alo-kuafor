/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    white: '#ffffff',
                    offwhite: '#f8fafc', // Slate 50
                    surface: '#f1f5f9', // Slate 100
                    border: '#e2e8f0', // Slate 200
                    text: {
                        primary: '#0f172a', // Slate 900
                        secondary: '#475569', // Slate 600
                        light: '#94a3b8', // Slate 400
                    },
                    accent: {
                        gold: '#d4af37', // Metallic Gold
                        violet: '#8b5cf6', // Violet 500
                        indigo: '#4f46e5', // Indigo 600
                    },
                    primary: '#4f46e5', // Indigo 600 (Main Brand Color)
                    dark: '#4338ca', // Indigo 700 (Hover State)
                    secondary: '#64748b', // Slate 500
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['Cormorant Garamond', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            boxShadow: {
                'soft-sm': '0 2px 4px rgb(0 0 0 / 0.02), 0 1px 2px rgb(0 0 0 / 0.02)',
                'soft': '0 4px 6px -1px rgb(0 0 0 / 0.02), 0 2px 4px -1px rgb(0 0 0 / 0.02)',
                'soft-md': '0 10px 15px -3px rgb(0 0 0 / 0.03), 0 4px 6px -2px rgb(0 0 0 / 0.02)',
                'soft-xl': '0 20px 25px -5px rgb(0 0 0 / 0.04), 0 10px 10px -5px rgb(0 0 0 / 0.02)',
                'glow': '0 0 20px rgb(79 70 229 / 0.15)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #e0e7ff 0deg, #f3e8ff 180deg, #e0e7ff 360deg)',
            }
        },
    },
    plugins: [],
}
