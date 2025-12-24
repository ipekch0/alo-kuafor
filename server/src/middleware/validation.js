const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (e) {
        if (e.errors) {
            const messages = e.errors.map(err => err.message).join(', ');
            console.log('Validation Errors:', messages);
            return res.status(400).json({ error: messages });
        }
        console.error('Validation Exception:', e);
        res.status(400).json({ error: 'Geçersiz veri formatı.' });
    }
};

module.exports = validateRequest;
