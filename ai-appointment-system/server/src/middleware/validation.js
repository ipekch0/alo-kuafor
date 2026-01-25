const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (e) {
        if (e.errors) {
            const messages = e.errors.map(err => err.message).join(', ');
            return res.status(400).json({ error: messages });
        }
        res.status(400).json({ error: 'Geçersiz veri formatı.' });
    }
};

module.exports = validateRequest;
