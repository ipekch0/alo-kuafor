const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
    phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz.'),
    role: z.enum(['customer', 'salon_owner', 'professional', 'admin']).optional().nullable(),
    salonDetails: z.object({
        salonName: z.string().min(2),
        taxNumber: z.string().min(10).optional().nullable(),
        taxOffice: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable()
    }).optional().nullable()
});

const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(1, 'Şifre gereklidir.')
});

module.exports = { registerSchema, loginSchema };
