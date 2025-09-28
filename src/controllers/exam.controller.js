import { createExamService, getExamsPipelineService } from '../services/exam.services.js';
import { StatusCodes } from 'http-status-codes';
import { error, success } from '../utills/responseWrapper.js';
import { convertToMongoId } from '../services/mongoose.services.js';

export async function createExamController(req, res) {
  try {
    const { sessionId, classId, sectionId, name, description, type, startDate, endDate, subjects } = req.body;
    const adminId = req.adminId;
    const exam = await createExamService({
      school: adminId,
      session: sessionId,
      classInfo: classId,
      section: sectionId,
      name,
      description,
      type,
      startDate,
      endDate,
      subjects
    });
    return res.status(StatusCodes.CREATED).send(success(201, 'Exam created successfully')); 
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getExamsForSectionController(req, res) {
  try {
    const sectionId  = req.params.sectionId;
    const adminId = req.adminId;
    const pipeline = [
      {
        $match: {
          section: convertToMongoId(sectionId)
        }
      }
    ];
    const exams = await getExamsPipelineService(pipeline);
 
    return res.status(StatusCodes.OK).send(success(200, exams)); 
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getSectionExamsForTeacherController(req, res) {
  try {
    const {sectionId, subjectId} = req.body;
    const adminId = req.adminId;
    const teacherId = req.teacherId;
    const pipeline = [
      {
        $match: {
          section: convertToMongoId(sectionId)
        }
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects.subject",
          foreignField: "_id",
          as: "subjectDocs"
        }
      },
      {
        $addFields: {
          subjects: {
            $map: {
              input: "$subjects",
              as: "s",
              in: {
                subjectType: "$$s.subjectType",
                components: "$$s.components",
                subject: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$subjectDocs",
                        as: "sd",
                        cond: { $eq: ["$$sd._id", "$$s.subject"] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          subjectDocs: 0
        }
      }
    ];
    const exams = await getExamsPipelineService(pipeline);
 
    return res.status(StatusCodes.OK).send(success(200, exams)); 
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

