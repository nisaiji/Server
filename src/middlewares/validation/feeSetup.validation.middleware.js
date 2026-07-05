import { StatusCodes } from "http-status-codes";
import { error } from "../../utils/responseWrapper.js";
import {
  createFeeCycleSchema,
  createFeeHeadSchema,
  createFeeStructureSchema,
  feeHeadIdParamSchema,
  feeStructureIdParamSchema,
  sessionIdParamSchema,
  updateFeeCycleSchema,
  updateFeeHeadSchema,
  updateFeeStructureSchema,
  feeSetupVerifySchema
} from "../../validators/feeSetupSchema.validator.js";

function validateParams(schema, req, res, next) {
  const { error: schemaError } = schema.validate(req.params);

  if (schemaError) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(error(400, schemaError.details[0].message));
  }

  next();
}

export async function feeCycleCreateValidation(req, res, next) {
  try {
    const { error: schemaError } = createFeeCycleSchema.validate(req.body);

    if (schemaError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, schemaError.details[0].message));
    }

    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeCycleUpdateValidation(req, res, next) {
  try {
    const { error: schemaError } = updateFeeCycleSchema.validate(req.body);

    if (schemaError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, schemaError.details[0].message));
    }

    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeHeadCreateValidation(req, res, next) {
  try {
    const { error: schemaError, value } = createFeeHeadSchema.validate(
      req.body
    );

    if (schemaError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, schemaError.details[0].message));
    }

    req.body = value;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeHeadUpdateValidation(req, res, next) {
  try {
    const { error: schemaError, value } = updateFeeHeadSchema.validate(
      req.body
    );

    if (schemaError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, schemaError.details[0].message));
    }

    req.body = value;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeStructureCreateValidation(req, res, next) {
  try {
    const { error: schemaError, value } = createFeeStructureSchema.validate(
      req.body
    );

    if (schemaError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, schemaError.details[0].message));
    }

    req.body = value;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeStructureUpdateValidation(req, res, next) {
  try {
    const { error: schemaError, value } = updateFeeStructureSchema.validate(
      req.body
    );

    if (schemaError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, schemaError.details[0].message));
    }

    req.body = value;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function sessionIdParamValidation(req, res, next) {
  try {
    validateParams(sessionIdParamSchema, req, res, next);
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeHeadIdParamValidation(req, res, next) {
  try {
    validateParams(feeHeadIdParamSchema, req, res, next);
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeStructureIdParamValidation(req, res, next) {
  try {
    validateParams(feeStructureIdParamSchema, req, res, next);
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feeSetupVerifyValidation(req, res, next) {
  try {
    const { error: schemaError, value } = feeSetupVerifySchema.validate(
      req.body
    );

    if (schemaError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, schemaError.details[0].message));
    }

    req.body = value;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function studentFeeDuesParamValidation(req, res, next) {
  try {
    const { sessionId, studentId } = req.params;
    if (!sessionId || !studentId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "sessionId and studentId are required"));
    }
    next();
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}
