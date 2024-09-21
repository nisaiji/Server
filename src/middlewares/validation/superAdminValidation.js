import { error } from "../../utills/responseWrapper.js";
import {
  registerSuperAdminSchema,
  loginSuperAdminSchema,
  updateSuperAdminSchema,
} 
from "../../validators/superAdminSchema.validator.js";

export async function registerSuperAdminValidation(req, res, next) {
  try {
    const { error: schemaError } = registerSuperAdminSchema.validate(req.body);
    if (schemaError) {
      return res.status(400).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
}

export async function loginSuperAdminValidation(req, res, next) {
  try {
    const { error: schemaError } = loginSuperAdminSchema.validate(req.body);
    if (schemaError) {
      return res.status(400).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
}

export async function updateSuperAdminValidation(req, res, next) {
  try {
    const { error: schemaError } = updateSuperAdminSchema.validate(req.body);
    if (schemaError) {
      return res.status(400).send(error(400, schemaError.details[0].message));
    }
    next();
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
}
