import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

/**
 * Joi schema for user signup payload.
 * Required: firstName, lastName, email, password.
 */
export const UserSpec = Joi.object({
  firstName: Joi.string().required().description("User first name"),
  lastName: Joi.string().required().description("User last name"),
  email: Joi.string().email().required().description("User email address"),
  password: Joi.string().required().description("User password"),
}).description("User signup payload");

/**
 * Joi schema for login credentials.
 * Required: email, password.
 */
export const UserCredentialsSpec = Joi.object({
  email: Joi.string().email().required().description("User email address"),
  password: Joi.string().required().description("Login password"),
}).description("User login credentials");

export const UserUpdateSpec = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
}).description("User account update");

/** Coerce string to number and validate latitude range (-90 to 90). Accepts number (API) or string (form). */
const latCoord = Joi.alternatives()
  .try(
    Joi.number().min(-90).max(90),
    Joi.string()
      .custom((v, helpers) => {
        const n = Number(v);
        if (Number.isNaN(n)) return helpers.error("number.base");
        if (n < -90 || n > 90) return helpers.error("number.range");
        return n;
      })
  )
  .required();
/** Coerce string to number and validate longitude range (-180 to 180). Accepts number (API) or string (form). */
const lonCoord = Joi.alternatives()
  .try(
    Joi.number().min(-180).max(180),
    Joi.string()
      .custom((v, helpers) => {
        const n = Number(v);
        if (Number.isNaN(n)) return helpers.error("number.base");
        if (n < -180 || n > 180) return helpers.error("number.range");
        return n;
      })
  )
  .required();

/**
 * Joi schema for add-cafe payload.
 * All fields required: name, category, description, latitude, longitude.
 * Latitude/longitude accept numbers (API) or numeric strings (form); coerced to number.
 */
export const CafeSpec = Joi.object({
  name: Joi.string().required().description("Cafe name"),
  category: Joi.string().required().description("Cafe category"),
  description: Joi.string().required().allow("").description("Cafe description"),
  latitude: latCoord.description("Latitude (-90 to 90)"),
  longitude: lonCoord.description("Longitude (-180 to 180)"),
}).description("Add cafe payload");

/**
 * Joi schema for cafe update (API PUT). All fields optional.
 */
export const CafeUpdateSpec = Joi.object({
  name: Joi.string().optional().description("Cafe name"),
  category: Joi.string().optional().description("Cafe category"),
  description: Joi.string().allow("").optional().description("Cafe description"),
  latitude: Joi.number().min(-90).max(90).optional().description("Latitude (-90 to 90)"),
  longitude: Joi.number().min(-180).max(180).optional().description("Longitude (-180 to 180)"),
  analytics: Joi.object({ views: Joi.number().optional() }).optional(),
  userId: Joi.string().optional(),
}).min(1).description("Cafe update payload");