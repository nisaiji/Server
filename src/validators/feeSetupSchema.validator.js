import Joi from "joi";

const mongoIdSchema = Joi.string().hex().length(24);

const sessionIdParamSchema = Joi.object({
  sessionId: mongoIdSchema.required().messages({
    "any.required": "Session Id is required.",
    "string.base": "Session Id must be a string.",
    "string.hex": "Session Id must be a valid Mongo Id.",
    "string.length": "Session Id must be a valid Mongo Id.",
  }),
});

const feeHeadIdParamSchema = Joi.object({
  feeHeadId: mongoIdSchema.required().messages({
    "any.required": "Fee head Id is required.",
    "string.base": "Fee head Id must be a string.",
    "string.hex": "Fee head Id must be a valid Mongo Id.",
    "string.length": "Fee head Id must be a valid Mongo Id.",
  }),
});

const feeStructureIdParamSchema = Joi.object({
  feeStructureId: mongoIdSchema.required().messages({
    "any.required": "Fee structure Id is required.",
    "string.base": "Fee structure Id must be a string.",
    "string.hex": "Fee structure Id must be a valid Mongo Id.",
    "string.length": "Fee structure Id must be a valid Mongo Id.",
  }),
});

const createFeeCycleSchema = Joi.object({
  sessionId: Joi.string().required().messages({
    "any.required": "Session Id is required.",
    "string.base": "Session Id must be a string.",
  }),
  frequency: Joi.string()
    .valid("MONTHLY", "QUARTERLY", "BY_MONTHLY", "HALF_YEARLY", "YEARLY")
    .required()
    .messages({
      "any.only": "Frequency must be one of MONTHLY, QUARTERLY, BY_MONTHLY, HALF_YEARLY, YEARLY.",
      "any.required": "Frequency is required.",
      "string.base": "Frequency must be a string.",
    }),
  dueDate: Joi.number().integer().min(1).max(28).required().messages({
    "any.required": "Due date is required.",
    "number.base": "Due date must be a number.",
    "number.integer": "Due date must be an integer.",
    "number.min": "Due date must be between 1 and 28.",
    "number.max": "Due date must be between 1 and 28.",
  }),
});

const updateFeeCycleSchema = Joi.object({
  frequency: Joi.string()
    .valid("MONTHLY", "QUARTERLY", "BY_MONTHLY", "HALF_YEARLY", "YEARLY")
    .required()
    .messages({
      "any.only": "Frequency must be one of MONTHLY, QUARTERLY, BY_MONTHLY, HALF_YEARLY, YEARLY.",
      "any.required": "Frequency is required.",
      "string.base": "Frequency must be a string.",
    }),
  dueDate: Joi.number().integer().min(1).max(28).required().messages({
    "any.required": "Due date is required.",
    "number.base": "Due date must be a number.",
    "number.integer": "Due date must be an integer.",
    "number.min": "Due date must be between 1 and 28.",
    "number.max": "Due date must be between 1 and 28.",
  }),
});

const feeHeadPayloadSchema = {
  name: Joi.string().trim().required().messages({
    "any.required": "Fee head name is required.",
    "string.base": "Fee head name must be a string.",
    "string.empty": "Fee head name is required.",
  }),
  label: Joi.string().trim().required().messages({
    "any.required": "Fee head label is required.",
    "string.base": "Fee head label must be a string.",
    "string.empty": "Fee head label is required.",
  }),
  type: Joi.string().valid("RECURRING", "ONE_TIME").required().messages({
    "any.only": "Fee head type must be one of RECURRING, ONE_TIME.",
    "any.required": "Fee head type is required.",
    "string.base": "Fee head type must be a string.",
  }),
  refundable: Joi.boolean().default(false).messages({
    "boolean.base": "Refundable must be a boolean.",
  }),
};

const createFeeHeadSchema = Joi.object({
  sessionId: Joi.string().required().messages({
    "any.required": "Session Id is required.",
    "string.base": "Session Id must be a string.",
  }),
  ...feeHeadPayloadSchema,
});

const updateFeeHeadSchema = Joi.object(feeHeadPayloadSchema);

const feeStructureSectionSchema = Joi.object({
  section: Joi.object({
    sectionId: Joi.string().required().messages({
      "any.required": "Section Id is required.",
      "string.base": "Section Id must be a string.",
    }),
    name: Joi.string().trim().required().messages({
      "any.required": "Section name is required.",
      "string.base": "Section name must be a string.",
      "string.empty": "Section name is required.",
    }),
  }).required(),
  feeHeads: Joi.array()
    .items(
      Joi.object({
        feeHeadId: Joi.string().required().messages({
          "any.required": "Fee head Id is required.",
          "string.base": "Fee head Id must be a string.",
        }),
        amount: Joi.number().min(0).required().messages({
          "any.required": "Fee head amount is required.",
          "number.base": "Fee head amount must be a number.",
          "number.min": "Fee head amount cannot be negative.",
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one fee head amount is required for each section.",
      "any.required": "Fee heads are required.",
    }),
});

const feeStructurePayloadSchema = {
  feeCycleId: Joi.string().required().messages({
    "any.required": "Fee cycle Id is required.",
    "string.base": "Fee cycle Id must be a string.",
  }),
  sessionId: Joi.string().required().messages({
    "any.required": "Session Id is required.",
    "string.base": "Session Id must be a string.",
  }),
  classId: Joi.string().required().messages({
    "any.required": "Class Id is required.",
    "string.base": "Class Id must be a string.",
  }),
  amountForAllSections: Joi.boolean().default(false).messages({
    "boolean.base": "Amount for all sections must be a boolean.",
  }),
  applicableSections: Joi.array().items(feeStructureSectionSchema).min(1).required().messages({
    "array.min": "At least one section is required.",
    "any.required": "Applicable sections are required.",
  })
};

const feeSetupVerifySchema = Joi.object({
  id: mongoIdSchema.required().messages({
    "any.required": "Id is required.",
    "string.base": "Id must be a string.",
    "string.hex": "Id must be a valid Mongo Id.",
    "string.length": "Id must be a valid Mongo Id.",
  }),
  token: Joi.string().required().messages({
    "any.required": "Token is required.",
    "string.base": "Token must be a string.",
  }),
  type: Joi.string().valid("VERIFY_FEE_STRUCTURE", "VERIFY_FEE_HEAD").required().messages({
    "any.only": "Type must be VERIFY_FEE_STRUCTURE or VERIFY_FEE_HEAD.",
    "any.required": "Type is required.",
    "string.base": "Type must be a string.",
  }),
});

const createFeeStructureSchema = Joi.object(feeStructurePayloadSchema);
const updateFeeStructureSchema = Joi.object(feeStructurePayloadSchema);

export {
  createFeeCycleSchema,
  updateFeeCycleSchema,
  createFeeHeadSchema,
  updateFeeHeadSchema,
  createFeeStructureSchema,
  updateFeeStructureSchema,
  sessionIdParamSchema,
  feeHeadIdParamSchema,
  feeStructureIdParamSchema,
  feeSetupVerifySchema,
};
