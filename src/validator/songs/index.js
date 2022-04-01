const {SongsPayloadSchema} = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
