import { createExamService, getExamService, getExamsPipelineService, updateExamService } from '../services/exam.services.js';
import { NOT_FOUND, StatusCodes } from 'http-status-codes';
import { error, success } from '../utills/responseWrapper.js';
import { convertToMongoId } from '../services/mongoose.services.js';
import { getSessionStudentService } from '../services/v2/sessionStudent.service.js';
import { getSectionService } from '../services/section.services.js';
import { getSessionService } from '../services/session.services.js';
import { getClassService } from '../services/class.sevices.js';
import { getTeacherSubjectSectionsService } from '../services/teacherSubjectSection.service.js';

export async function createExambyAdminController(req, res) {
  try {
    let { sessionId, classId, sectionId, name, description, type, startDate, endDate, subjects } = req.body;
    const adminId = req.adminId; 
    const[session, classinfo, section] = await Promise.all([
      getSessionService({_id: sessionId, school: adminId}),
      getClassService({_id: classId, admin: adminId, session: sessionId}),
      getSectionService({_id: sectionId, classId: classId, session: sessionId, admin: adminId}),
    ]);
    if(!session) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session not found"));
    }
    if(!classinfo) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Class not found"));
    }
    if(!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }
     if(session['status']==='completed'){
       return res.status(StatusCodes.NOT_FOUND).send(error(404, "Can't create exam for completed session"));
     }
     
    // const subjectIds = subjects.map(s => s.subjectId);
    const subjectIds = subjects.map(s => s.subject);
    const assignedSubjects = await getTeacherSubjectSectionsService({
      subject: { $in: subjectIds },
      section: sectionId,
      classId: classId,
      session: sessionId,
      school: adminId
    });

    if (assignedSubjects.length !== subjects.length) {;
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Provided invalid subjects"));
    }
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
        $addFields: {
          subjects: {
            $filter: {
              input: "$subjects",
              as: "s",
              cond: { $eq: ["$$s.subject", convertToMongoId(subjectId)] }
            }
          }
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

export async function getStudentExamsForParentController(req, res) {
  try {
    const {sessionStudentId} = req.body;
    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if(!sessionStudent) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Session student not found"));
    }
    const section = await getSectionService({_id: sessionStudent['section']});
    if(!section) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Section not found"));
    }

    const pipeline = [
      {
        $match: {
          section: convertToMongoId(section['id'])
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
    ]
    const exams = await getExamsPipelineService(pipeline);
    return res.status(StatusCodes.OK).send(success(200, exams));       
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(err.message));
  }
}

export async function updateExamController(req, res) {
  try {
    const examId = req.params.examId;
    let {name, description, type, resultPublished, status, subjects} = req.body;
    let exam = await getExamService({_id: examId});
    if(!exam) {
      return res.status(StatusCodes.NOT_FOUND).send(error(404, "Exam not found"));
    }
    let params = {}
    if(name) params.name = name;
    if(description) params.description = description;
    if(type) params.type = type;
    if(resultPublished="true") params.resultPublished = (resultPublished==="true");
    if(subjects) params.subjects = subjects;
    await updateExamService({_id: examId}, params);
    return res.status(StatusCodes.OK).send(success(200, "Exam updated successfully"));    
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
