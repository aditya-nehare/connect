const joi = require("joi");
const listingSchema = require("./models/listing");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      price: joi.number().required().min(0),
    })
    .required(),
});
