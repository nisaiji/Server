import { StatusCodes } from 'http-status-codes';
import { error, success } from '../utills/responseWrapper.js';
import { createStudentExamResultService } from '../services/studentExamResult.service.js';

export async function createStudentExamResultController(req, res) {
  try {
    const {examId, sessionStudentId, subjectId, components} = req.body;
    const studentExamResult = await createStudentExamResultService({
      exam: examId,
      sessionStudent: sessionStudentId,
      subject: subjectId,
      components
    });
    return res.status(StatusCodes.CREATED).send(success(201, 'Student exam result created successfully'));
    
  } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}