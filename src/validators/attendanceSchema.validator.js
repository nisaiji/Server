import Joi from "joi";

const attendanceByTeacherSchema = Joi.object({
    sectionId:Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        "any.required":"section id is required!"
    }),
    present: Joi.array().items(Joi.object()).required().messages({
        'array.base': 'Present should be an array of student IDs.',
        'array.includes': 'Each item in the present array must be a object.',
        'any.required': 'The present array is required.'
      }),
    absent: Joi.array().items(Joi.object()).required().messages({
        'array.base': 'Absent should be an array of student IDs.',
        'array.includes': 'Each item in the absent array must be a object.',
        'any.required': 'The absent array is required.'
      })
  });

const attendanceByParentSchema = Joi.object({
  studentId: Joi.string().length(24).hex().required().messages({
    'string.length': 'Student ID must be a 24-character hexadecimal string.',
    'string.hex': 'Student ID must be a valid hexadecimal string.',
    'any.required': 'Student ID is required.'
  }),
  attendance: Joi.string().valid('present', 'absent').required().messages({
    'string.valid': 'Attendance must be either "present" or "absent".',
    'any.required': 'Attendance is required.'
  })
});
  
const updateAttendanceSchema = Joi.object({
  present: Joi.array().items(Joi.object()).required().messages({
    'array.base': 'Present should be an array of student IDs.',
    'array.includes': 'Each item in the present array must be a object.',
    'any.required': 'The present array is required.'
  }),
  absent: Joi.array().items(Joi.object()).required().messages({
    'array.base': 'Absent should be an array of student IDs.',
    'array.includes': 'Each item in the absent array must be a object.',
    'any.required': 'The absent array is required.'
  })
})

const attendanceStatusSchema = Joi.object({
  startTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'Start time must be a number',
    'number.integer': 'Start time must be an integer',
    'number.min': 'Start time must be a positive number',
    'any.required': 'Start time is required'
  }),
  endTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'End time must be a number',
    'number.integer': 'End time must be an integer',
    'number.min': 'End time must be a positive number',
    'any.required': 'End time is required'
  }),
})

const attendanceCountSchema = Joi.object({
  studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    "any.required":"stuent id is required!"
  }),
  startTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'Start time must be a number',
    'number.integer': 'Start time must be an integer',
    'number.min': 'Start time must be a positive number',
    'any.required': 'Start time is required'
  }),
  endTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'End time must be a number',
    'number.integer': 'End time must be an integer',
    'number.min': 'End time must be a positive number',
    'any.required': 'End time is required'
  }),
})

export{ attendanceByTeacherSchema, attendanceByParentSchema, updateAttendanceSchema, attendanceStatusSchema, attendanceCountSchema};