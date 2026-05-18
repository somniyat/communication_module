const { badRequest } = require('../../utils/errors');

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (obj[k] !== undefined ? ((acc[k] = obj[k]), acc) : acc), {});

function validate(schemaMap) {
  return (req, res, next) => {
    const sources = ['body', 'query', 'params'];
    for (const src of sources) {
      const schema = schemaMap[src];
      if (!schema) continue;
      const { value, error } = schema.validate(req[src], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      if (error) {
        return next(badRequest('Validation failed', error.details.map((d) => d.message)));
      }
      req[src] = value;
    }
    return next();
  };
}

module.exports = { validate, pick };
