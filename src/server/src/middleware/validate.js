const validate = (schema) => (req, res, next) => {
  const data = req.method === 'GET' ? req.query : req.body;
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  next();
};

module.exports = validate;