function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,
      errors: { wrap: { label: false } },
    });

    if (error) {
      const unknown = error.details.find((d) => d.type === 'object.unknown');
      const selected = unknown || error.details[0];
      const err = new Error(selected.message);
      err.isJoi = true;
      err.details = [selected];
      return next(err);
    }

    req.body = value;
    return next();
  };
}

module.exports = { validate };
