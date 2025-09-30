import { StatusCodes } from 'http-status-codes';
import { error, success } from '../utills/responseWrapper.js';
import { createStudentExamResultService, getStudentExamResultService, getStudentExamResultsPipelineService, updateStudentExamResultService } from '../services/studentExamResult.service.js';
import { getSectionService } from '../services/section.services.js';
import { getExamService } from '../services/exam.services.js';
import { getSubjectService } from '../services/subject.service.js';
import { convertToMongoId } from '../services/mongoose.services.js';
import { getSessionStudentsPipelineService } from '../services/v2/sessionStudent.service.js';

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

export async function createOrUpdateStudentExamResultByTeacherController(req, res) {
  try {
    const {studentExamResultId, examId, sessionStudentId, subjectId, components} = req.body;
    if(studentExamResultId) {
      const studentExamResult = await getStudentExamResultService({_id: studentExamResultId});
      if(!studentExamResult) {
        return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student exam result not found"));
      }
      await updateStudentExamResultService({_id: studentExamResultId},{components});
      return res.status(StatusCodes.OK).send(success(200, "Student exam result updated successfully"));
    }
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

export async function updateStudentExamResultController(req, res) {
  try {
    const id = req.params.studentExamResultId;
    const {examId, sessionStudentId, subjectId, components} = req.body;
    const studentExamResult = await getStudentExamResultService({_id: id});
    if(!studentExamResult) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, 'Student exam result not found'));
    }
    const params = {}
    if(examId) params.exam = examId;
    if(sessionStudentId) params.sessionStudent = sessionStudentId;
    if(subjectId) params.subject = subjectId;
    if(components) params.components = components;

    const updatedStudentExamResult = await updateStudentExamResultService(params);
    return res.status(StatusCodes.CREATED).send(success(201, 'Student exam result updated successfully'));
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getStudentsExamMarksForSubjectController(req, res) {
  try {
    const {sectionId, subjectId, examId} = req.body;
    const[subject, exam, section] = await Promise.all([
      getSubjectService({_id: subjectId}),
      getExamService({_id: examId}),
      getSectionService({_id: sectionId})
    ]);
    
    if(!subject) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Subject not found"));
    }
    if(!exam) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Exam not found"));
    }
    if(!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }

    const pipeline = [
      {
        $match: {
          section: convertToMongoId(sectionId)
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sessions",
          localField: "session",
          foreignField: "_id",
          as: "session"
        }
      },
      {
        $unwind: {
          path: "$session",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section"
        }
      },
      {
        $unwind: {
          path: "$section",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class"
        }
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'studentexamresults',
          localField: '_id',
          foreignField: 'sessionStudent',
          as: 'studentExamResult',
          pipeline: [
            {
              $match: {
                exam: convertToMongoId(examId),
                subject: convertToMongoId(subjectId)
              }
            },
            {
              $lookup: {
                from: 'subjects',
                localField: 'subject',
                foreignField: '_id',
                as: 'subject'
              }
            },
            {
              $unwind: {
                path: '$subject',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'exams',
                localField: 'exam',
                foreignField: '_id',
                as: 'exam'
              }
            },
            {
              $unwind: {
                path: '$exam',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                subjectId: '$subject._id',
                subjectName: '$subject.name',
                subjectCode: '$subject.code',
                subjectDescription: '$subject.description',
                examId: '$exam._id',
                examName: '$exam.name',
                examType: '$exam.type',
                examStatus: '$exam.status',
                examResultPublished: '$exam.resultPublished',
                examResultPublishedAt: '$exam.resultPublishedAt',
                components: '$components',
              }
            }
          ]
        }
      },
            {
        $project: {
          id: '$_id',
          studentFirstName: '$student.firstname',
          studentLastName: '$student.lastname',
          studentId: '$student._id',
          studentGender: '$student.gender',
          studentPhoto: '$student.photo',
          studntBloodGroup: '$student.bloodGroup',
          studentAddress: '$student.address',
          studentCity: '$student.city',
          studentDistrict: '$student.district',
          studentState: '$student.state',
          studentCountry: '$student.country',
          studentPincode: '$student.pincode',
          sessionStudentId: '$sessionStudent._id',
          sectionId: '$section._id',
          sectionName: '$section.name',
          classId: '$class._id',
          className: '$class.name',
          sessionId: '$session._id',
          sessionName: '$session.name',
          sessionStatus: '$session.status',
          sessionStartDate: '$session.startDate',
          sessionEndDate: '$session.endDate',
          isCurrentSession: '$session.isCurrent',
          studentExamResult: '$studentExamResult'

        }
      }
    ]

    const sessionStudents = await getSessionStudentsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, sessionStudents));
    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSectionStudentsExamMarksController(req, res) {
  try {
    const {sectionId, examId} = req.body;
    const pipeline = [
      {
        $match: {
          section: convertToMongoId(sectionId)
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sessions",
          localField: "session",
          foreignField: "_id",
          as: "session"
        }
      },
      {
        $unwind: {
          path: "$session",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section"
        }
      },
      {
        $unwind: {
          path: "$section",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class"
        }
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "exams",
          let: { examId: convertToMongoId(examId) },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$examId"] }
              }
            },
            {
              $unwind: "$subjects"
            },
            {
              $lookup: {
                from: "subjects",
                localField: "subjects.subject",
                foreignField: "_id",
                as: "subject"
              }
            },
            {
              $project: {
                examId: '$_id',
                examName: '$name',
                examType: '$type',
                subjects: '$subject'
              }
            }
          ],
          as: "exam"
        }
      },
      {
        $unwind: {
          path: "$exam",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'studentexamresults',
          localField: '_id',
          foreignField: 'sessionStudent',
          as: 'studentExamResult',
          pipeline: [
            {
              $match: {
                exam: convertToMongoId(examId)
              }
            },
            {
              $lookup: {
                from: 'subjects',
                localField: 'subject',
                foreignField: '_id',
                as: 'subject'
              }
            },
            {
              $unwind: {
                path: '$subject',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'exams',
                localField: 'exam',
                foreignField: '_id',
                as: 'exam'
              }
            },
            {
              $unwind: {
                path: '$exam',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                subjectId: '$subject._id',
                subjectName: '$subject.name',
                subjectCode: '$subject.code',
                subjectDescription: '$subject.description',
                examId: '$exam._id',
                examName: '$exam.name',
                examType: '$exam.type',
                examStatus: '$exam.status',
                examResultPublished: '$exam.resultPublished',
                examResultPublishedAt: '$exam.resultPublishedAt',
                components: '$components',
              }
            }
          ]
        }
      },
            {
        $project: {
          id: '$_id',
          studentFirstName: '$student.firstname',
          studentLastName: '$student.lastname',
          studentId: '$student._id',
          studentGender: '$student.gender',
          studentPhoto: '$student.photo',
          studntBloodGroup: '$student.bloodGroup',
          studentAddress: '$student.address',
          studentCity: '$student.city',
          studentDistrict: '$student.district',
          studentState: '$student.state',
          studentCountry: '$student.country',
          studentPincode: '$student.pincode',
          sessionStudentId: '$sessionStudent._id',
          sectionId: '$section._id',
          sectionName: '$section.name',
          classId: '$class._id',
          className: '$class.name',
          sessionId: '$session._id',
          sessionName: '$session.name',
          sessionStatus: '$session.status',
          sessionStartDate: '$session.startDate',
          sessionEndDate: '$session.endDate',
          isCurrentSession: '$session.isCurrent',
          studentExamResult: '$studentExamResult',
          exam: '$exam'
        }
      }
    ]

    const sessionStudents = await getSessionStudentsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, sessionStudents))
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getStudentExamMarksController(req, res) {
  try {
    const {sessionStudentId, examId} = req.body;
    console.log({sessionStudentId, examId})
    const pipeline = [
      {
        $match: {
          _id: convertToMongoId(sessionStudentId)          
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sessions",
          localField: "session",
          foreignField: "_id",
          as: "session"
        }
      },
      {
        $unwind: {
          path: "$session",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section"
        }
      },
      {
        $unwind: {
          path: "$section",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class"
        }
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "exams",
          let: { examId: convertToMongoId(examId) },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$examId"] }
              }
            },
            {
              $unwind: "$subjects"
            },
            {
              $lookup: {
                from: "subjects",
                localField: "subjects.subject",
                foreignField: "_id",
                as: "subject"
              }
            },
            {
              $project: {
                examId: '$_id',
                examName: '$name',
                examType: '$type',
                subjects: '$subject'
              }
            }
          ],
          as: "exam"
        }
      },
      {
        $unwind: {
          path: "$exam",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'studentexamresults',
          localField: '_id',
          foreignField: 'sessionStudent',
          as: 'studentExamResult',
          pipeline: [
            {
              $match: {
                exam: convertToMongoId(examId)
              }
            },
            {
              $lookup: {
                from: 'subjects',
                localField: 'subject',
                foreignField: '_id',
                as: 'subject'
              }
            },
            {
              $unwind: {
                path: '$subject',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'exams',
                localField: 'exam',
                foreignField: '_id',
                as: 'exam'
              }
            },
            {
              $unwind: {
                path: '$exam',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                subjectId: '$subject._id',
                subjectName: '$subject.name',
                subjectCode: '$subject.code',
                subjectDescription: '$subject.description',
                examId: '$exam._id',
                examName: '$exam.name',
                examType: '$exam.type',
                examStatus: '$exam.status',
                examResultPublished: '$exam.resultPublished',
                examResultPublishedAt: '$exam.resultPublishedAt',
                components: '$components',
              }
            }
          ]
        }
      },
      {
        $project: {
          id: '$_id',
          studentFirstName: '$student.firstname',
          studentLastName: '$student.lastname',
          studentId: '$student._id',
          studentGender: '$student.gender',
          studentPhoto: '$student.photo',
          studntBloodGroup: '$student.bloodGroup',
          studentAddress: '$student.address',
          studentCity: '$student.city',
          studentDistrict: '$student.district',
          studentState: '$student.state',
          studentCountry: '$student.country',
          studentPincode: '$student.pincode',
          sessionStudentId: '$sessionStudent._id',
          sectionId: '$section._id',
          sectionName: '$section.name',
          classId: '$class._id',
          className: '$class.name',
          sessionId: '$session._id',
          sessionName: '$session.name',
          sessionStatus: '$session.status',
          sessionStartDate: '$session.startDate',
          sessionEndDate: '$session.endDate',
          isCurrentSession: '$session.isCurrent',
          studentExamResult: '$studentExamResult',
          exam: '$exam'
        }
      }
    ]

    const sessionStudent = await getSessionStudentsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, sessionStudent))
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}