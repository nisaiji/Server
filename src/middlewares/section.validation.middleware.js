import { error } from "../utills/responseWrapper.js";
import { registerSectionSchema } from "../validators/sectionSchema.validator.js";

export async function registerSectionValidation(req, res, next) {
  try {
    const { name, coordinatorId } = req.body;
    const { error: schemaError } = registerSectionSchema.validate({
      name,
      coordinatorId
    });

    if (schemaError) {
      return res.send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
