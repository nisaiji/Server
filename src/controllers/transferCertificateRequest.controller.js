import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { getClassService } from "../services/class.services.js";
import {
  convertToMongoId,
  isValidMongoId
} from "../services/mongoose.services.js";
import { getSectionService } from "../services/section.services.js";
import { getSessionService } from "../services/session.services.js";
import {
  getStudentService,
  updateStudentService
} from "../services/student.service.js";
import {
  registerTransferCertificateRequestService,
  getTransferCertificateRequestService,
  updateTransferCertificateRequestService,
  getTransferCertificateRequestsPipelineService
} from "../services/transferCertificateRequest.service.js";
import { getParentService } from "../services/parent.services.js";
import { getSessionStudentService, updateSessionStudentService } from "../services/sessionStudent.service.js";

// Generate unique TC number
function generateUniqueTCNumber() {
  const year = new Date().getFullYear();
  const randomId = new mongoose.Types.ObjectId()
    .toString()
    .slice(-8)
    .toUpperCase();
  return `TC-${year}-${randomId}`;
}

// Admin API - Apply for Transfer Certificate
export async function applyTransferCertificateController(req, res) {
  try {
    const {
      studentId,
      sessionStudentId,
      reason,
      reasonDescription,
      lastAttendanceDate,
      conduct,
      promotionStatus,
      clearanceStatus
    } = req.body;

    // const teacherId = req.teacherId;
    const adminId = req.adminId;

    // Validate student
    const student = await getStudentService({ _id: studentId, isActive: true });
    if (!student) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Student not found"));
    }

    const sessionStudent = await getSessionStudentService({
      _id: sessionStudentId,
      isActive: true,
      student: studentId
    });
    if (!sessionStudent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Session student not found"));
    }

    // Get student's academic information
    const [section, classInfo, session] = await Promise.all([
      getSectionService({ _id: sessionStudent.section }),
      getClassService({ _id: sessionStudent.classId }),
      getSessionService({ school: adminId, _id: sessionStudent.session })
    ]);

    if (!section || !classInfo || !session) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Student academic information not found"));
    }

    // Check if there's already a pending request for this student
    const existingRequest = await getTransferCertificateRequestService({
      student: studentId,
      sessionStudent: sessionStudentId,
      school: adminId,
      status: {
        $in: ["submitted", "underReview", "pendingClearance", "approved"]
      }
    });

    if (existingRequest) {
      return res
        .status(StatusCodes.CONFLICT)
        .send(
          error(
            409,
            "Transfer certificate request already exists for this student"
          )
        );
    }

    // Generate unique TC number
    const certificateNumber = generateUniqueTCNumber();

    // Create transfer certificate request
    const requestData = {
      student: studentId,
      sessionStudent: sessionStudentId,
      parent: student.parent,
      schoolParent: student.schoolParent,
      school: adminId,
      session: session._id,
      class: classInfo._id,
      section: section._id,
      requestType: "transfer",
      reason,
      reasonDescription,
      lastAttendanceDate: new Date(lastAttendanceDate),
      conduct,
      promotionStatus,
      clearanceStatus,
      certificateNumber
    };

    const tcRequest =
      await registerTransferCertificateRequestService(requestData);

    return res.status(StatusCodes.CREATED).send(
      success(201, {
        message: "Transfer certificate request submitted successfully",
        requestId: tcRequest._id,
        certificateNumber: tcRequest.certificateNumber
      })
    );
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

// Parent API - Get children's TC requests
export async function getChildrenTCRequestsController(req, res) {
  try {
    const parentId = req.parentId;
    const { page = 1, limit = 10, status, studentId } = req.query;

    // Validate parent
    const parent = await getParentService({ _id: parentId, isActive: true });
    if (!parent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Parent not found"));
    }

    // Get TC requests for parent's children
    const result = await getTransferCertificateRequestsPipelineService([
      {
        $match: {
          parent: convertToMongoId(parentId),
          ...(studentId && { student: convertToMongoId(studentId) }),
          ...(status && { status })
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      {
        $unwind: "$studentInfo"
      }
    ]);

    return res.status(StatusCodes.OK).send(success(200, result));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

// Parent API - Approve TC request (provide consent)
export async function approveParentConsentController(req, res) {
  try {
    const { requestId } = req.params;
    //approvedByParent , rejectedByParent
    const { consent, remarks } = req.body;
    const parentId = req.parentId;

    if (!isValidMongoId(requestId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "Invalid request ID"));
    }

    // Get TC request
    const tcRequest = await getTransferCertificateRequestService({
      _id: requestId,
      parent: parentId
    });

    if (!tcRequest) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Transfer certificate request not found"));
    }

    if (tcRequest.status === "completed" || tcRequest.status === "rejected") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(error(400, "Cannot modify completed or rejected request"));
    }
    const student = await getStudentService({ _id: tcRequest.student });
    const sessionStudent = await getSessionStudentService({
      _id: tcRequest.sessionStudent
    });

    if (!student || !sessionStudent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(error(404, "Student information not found"));
    }

    await updateStudentService(
      { _id: tcRequest.student },
      { isActive: consent === "approvedByParent" ? false : true }
    );
    await updateSessionStudentService(
      { _id: tcRequest.sessionStudent },
      { isActive: consent === "approvedByParent" ? false : true }
    );

    await updateTransferCertificateRequestService(
      { _id: requestId },
      {
        status: consent,
        parentApproved: consent === "approvedByParent",
        parentNotified: true
      }
    );
    return res
      .status(StatusCodes.OK)
      .send(success(200, "TC request updated successfully"));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

// Admin API - Get TC requests with filters
export async function getAdminTCRequestsController(req, res) {
  try {
    const adminId = req.adminId;
    const {
      page = 1,
      limit = 10,
      sessionId,
      classId,
      sectionId,
      sessionStudentId,
      status
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Build match filter
    const matchFilter = {
      school: convertToMongoId(adminId)
    };

    if (sessionId) {
      matchFilter.session = convertToMongoId(sessionId);
    }
    if (classId) {
      matchFilter.class = convertToMongoId(classId);
    }
    if (sectionId) {
      matchFilter.section = convertToMongoId(sectionId);
    }
    if (sessionStudentId) {
      matchFilter.sessionStudent = convertToMongoId(sessionStudentId);
    }

    if (status) {
      const statusArray = status.split(",").map((s) => s.trim());
      matchFilter.status = { $in: statusArray };
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: matchFilter
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
          pipeline: [
            {
              $project: {
                firstname: 1,
                lastname: 1,
                rollNumber: 1,
                dob: 1,
                gender: 1,
                bloodGroup: 1,
                photo: 1,
                address: 1,
                city: 1,
                district: 1,
                state: 1,
                country: 1,
                pincode: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$studentInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "parents",
          localField: "parent",
          foreignField: "_id",
          as: "parentInfo",
          pipeline: [
            {
              $project: {
                fullname: 1,
                phone: 1,
                email: 1,
                address: 1,
                city: 1,
                district: 1,
                state: 1,
                country: 1,
                pincode: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$parentInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "classInfo",
          pipeline: [
            {
              $project: {
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$classInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "sectionInfo",
          pipeline: [
            {
              $project: {
                name: 1,
                startTime: 1,
                studentCount: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$sectionInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sessions",
          localField: "session",
          foreignField: "_id",
          as: "sessionInfo",
          pipeline: [
            {
              $project: {
                name: 1,
                academicStartYear: 1,
                academicEndYear: 1,
                status: 1,
                startDate: 1,
                endDate: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$sessionInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "sessionstudents",
          localField: "sessionStudent",
          foreignField: "_id",
          as: "sessionStudentInfo",
          pipeline: [
            {
              $project: {
                rollNumber: 1,
                enrollmentStatus: 1,
                feeStatus: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$sessionStudentInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $skip: skipNum
      },
      {
        $limit: limitNum
      },
      {
        $project: {
          // Request basic info
          requestId: "$_id",
          status: 1,
          reason: 1,
          reasonDescription: 1,
          requestType: 1,
          priority: 1,
          promotionStatus: 1,
          certificateNumber: 1,
          lastAttendanceDate: 1,
          expectedLeavingDate: 1,
          requestedDate: 1,

          // New school info
          newSchoolName: 1,
          newSchoolAddress: 1,
          newSchoolBoard: 1,
          newSchoolAffiliationNo: 1,

          // Academic info
          currentClass: 1,
          currentSection: 1,
          rollNumber: 1,
          admissionNumber: 1,
          admissionDate: 1,

          // Performance and conduct
          lastExamResult: 1,
          conduct: 1,
          character: 1,

          // Clearance status
          feeStatus: 1,
          pendingFeeAmount: 1,
          feeRemarks: 1,
          libraryStatus: 1,
          libraryRemarks: 1,

          // Documents
          documentsRequired: 1,

          // Approval status
          classTeacherApproval: 1,
          principalApproval: 1,
          accountsApproval: 1,
          librarianApproval: 1,

          // Certificate info
          certificateGeneratedDate: 1,
          certificateIssuedDate: 1,
          certificateIssuedTo: 1,

          // Processing info
          processedDate: 1,
          rejectionReason: 1,
          rejectedDate: 1,
          parentNotified: 1,
          notificationDate: 1,

          // Notes and attachments
          internalNotes: 1,
          attachments: 1,
          statusHistory: 1,

          // Populated data
          student: "$studentInfo",
          parent: "$parentInfo",
          class: "$classInfo",
          section: "$sectionInfo",
          session: "$sessionInfo",
          sessionStudent: "$sessionStudentInfo",
          classTeacher: "$classTeacherInfo",
          principal: "$principalInfo",

          // Timestamps
          createdAt: 1,
          updatedAt: 1
        }
      }
    ];

    // Get total count for pagination
    const countPipeline = [
      {
        $match: matchFilter
      },
      {
        $count: "total"
      }
    ];

    // Execute both pipelines
    const [requests, countResult] = await Promise.all([
      getTransferCertificateRequestsPipelineService(pipeline),
      getTransferCertificateRequestsPipelineService(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return res.status(StatusCodes.OK).send(
      success(200, {
        requests,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRequests: total,
          pageSize: limitNum
        },
        filters: {
          sessionId,
          classId,
          sectionId,
          sessionStudentId
        }
      })
    );
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}
