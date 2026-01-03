import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { getPaymentTransactionPipelineService, getPaymentTransactionService } from "../../services/paymentTransaction.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";

export async function schoolPaymentsController(req, res) {
  try {
    const {sessionId, classId, sectionId } = req.query;
    const schoolId = req.adminId;
    
    const matchQuery = {};
    if (schoolId) matchQuery.school = convertToMongoId(schoolId);
    if (sessionId) matchQuery.session = convertToMongoId(sessionId);
    if (classId) matchQuery.classId = convertToMongoId(classId);
    if (sectionId) matchQuery.section = convertToMongoId(sectionId);
    matchQuery.status = "paid";

    const collectedFee = await getPaymentTransactionPipelineService([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ])
    const data = {
      collectedFee: collectedFee[0].totalAmount,
      pending: 1000,
      overdue:1000,
      refunded: 1000
    }
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }  
}

export async function daywisePaymentsSummaryController(req, res) {
  try {
    const {startDate, endDate} = req.body;
    console.log({startDate: new Date(startDate), endDate: new Date(endDate)})
    const payments = await getPaymentTransactionPipelineService([
      {
        $match: {
          status: "paid",
          paidAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$paidAt"
            }
          },
          totalAmount: { $sum: "$amount" },
          TransactionCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
    
    return res.status(StatusCodes.OK).send(success(200, { payments }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function monthwisePaymentsSummaryController(req, res) {
  try {
    const { sessionId } = req.body;
    const adminId = req.adminId;
    const payments = await getPaymentTransactionPipelineService([
      {
        $match: {
          status: "paid",
          session: convertToMongoId(sessionId),
          school: convertToMongoId(adminId)
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$paidAt"
            }
          },
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
    
    return res.status(StatusCodes.OK).send(success(200, { payments }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function paymentsByPaymentModesController(req, res) {
  try {
    const {startDate, endDate} = req.body;
    const payments = await getPaymentTransactionPipelineService([
      {
        $match: {
          status: "paid",
          paymentMethod: { $exists: true },
          paidAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
    return res.status(StatusCodes.OK).send(success(200, payments));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function paymentTransactionsController(req, res) {
  try {
    const {sessionId, classId, sectionId, sessionStudentId } = req.query;
    const schoolId = req.adminId;
    
    const matchQuery = {};
    if (schoolId) matchQuery.school = convertToMongoId(schoolId);
    if (sessionId) matchQuery.session = convertToMongoId(sessionId);
    if (classId) matchQuery.classId = convertToMongoId(classId);
    if (sectionId) matchQuery.section = convertToMongoId(sectionId);
    if (sessionStudentId) matchQuery.sessionStudent = convertToMongoId(sessionStudentId);

    const data = await getPaymentTransactionPipelineService([
      { $match: matchQuery },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section"
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
        $lookup: {
          from: "sessions",
          localField: "session",
          foreignField: "_id",
          as: "session"
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
        $project: {
          amount: 1,
          status: 1,
          paymentMethod: 1,
          paidAt: 1,
          createdAt: 1,
          paymentReferenceId: 1,
          paymentInvoiceId: 1,
          transactionId: 1,
          zohoPaymentId: 1,
          sectionName: { $arrayElemAt: ["$section.name", 0] },
          sectionId: { $arrayElemAt: ["$section._id", 0] },
          className: { $arrayElemAt: ["$class.name", 0] },
          classId: { $arrayElemAt: ["$class._id", 0] },
          session: {
              $concat: [
                { $toString: { $arrayElemAt: ["$session.academicStartYear", 0] } },
                "-",
                { $toString: { $arrayElemAt: ["$session.academicEndYear", 0] } }
              ]
            },
          sessionEndYear: { $arrayElemAt: ["$session.endYear", 0] },
          sessionName: { $arrayElemAt: ["$session.name", 0] },
          studentFirstname: { $arrayElemAt: ["$student.firstname", 0] },
          studentLastname: { $arrayElemAt: ["$student.lastname", 0] }
        }
      }
    ]);

    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

// export async function sessionStudentTransactionsController(req, res) {
//   try {
//     const { sessionStudentId } = req.params;
//     const adminId = req.adminId;
//     const data = await getPaymentTransactionPipelineService([
//       {
//         $match: {
//           // school: convertToMongoId(adminId),
//           sessionStudent: convertToMongoId(sessionStudentId)
//         } 
//       },
//       {
//         $lookup: {
//           from: "sections",
//           localField: "section",
//           foreignField: "_id",
//           as: "section"
//         }
//       },
//       {
//         $lookup: {
//           from: "classes",
//           localField: "classId",
//           foreignField: "_id",
//           as: "class"
//         }
//       },
//       {
//         $lookup: {
//           from: "sessions",
//           localField: "session",
//           foreignField: "_id",
//           as: "session"
//         }
//       },
//       {
//         $lookup: {
//           from: "students",
//           localField: "student",
//           foreignField: "_id",
//           as: "student"
//         }
//       },
//       {
//         $project: {
//           amount: 1,
//           status: 1,
//           paymentMethod: 1,
//           paidAt: 1,
//           createdAt: 1,
//           paymentReferenceId: 1,
//           paymentInvoiceId: 1,
//           transactionId: 1,
//           zohoPaymentId: 1,
//           sectionName: { $arrayElemAt: ["$section.name", 0] },
//           sectionId: { $arrayElemAt: ["$section._id", 0] },
//           className: { $arrayElemAt: ["$class.name", 0] },
//           classId: { $arrayElemAt: ["$class._id", 0] },
//           session: {
//               $concat: [
//                 { $toString: { $arrayElemAt: ["$session.academicStartYear", 0] } },
//                 "-",
//                 { $toString: { $arrayElemAt: ["$session.academicEndYear", 0] } }
//               ]
//             },
//           sessionEndYear: { $arrayElemAt: ["$session.endYear", 0] },
//           sessionName: { $arrayElemAt: ["$session.name", 0] },
//           studentFirstname: { $arrayElemAt: ["$student.firstname", 0] },
//           studentLastname: { $arrayElemAt: ["$student.lastname", 0] }
//         }
//       }
//     ]);
//     return res.status(StatusCodes.OK).send(success(200, data));
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
//   }
// }

export async function sessionStudentFeesController(req, res) {
  try {
    const { sessionStudentId } = req.params;
    const adminId = req.adminId;
    const data = await getPaymentTransactionPipelineService([
      {
        $match: {
          // school: convertToMongoId(adminId),
          sessionStudent: convertToMongoId(sessionStudentId)
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
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class"
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
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $project: {
          amount: 1,
          status: 1,
          paymentMethod: 1,
          paidAt: 1,
          createdAt: 1,
          paymentReferenceId: 1,
          paymentInvoiceId: 1,
          transactionId: 1,
          zohoPaymentId: 1,
          sectionName: { $arrayElemAt: ["$section.name", 0] },
          sectionId: { $arrayElemAt: ["$section._id", 0] },
          className: { $arrayElemAt: ["$class.name", 0] },
          classId: { $arrayElemAt: ["$class._id", 0] },
          session: {
              $concat: [
                { $toString: { $arrayElemAt: ["$session.academicStartYear", 0] } },
                "-",
                { $toString: { $arrayElemAt: ["$session.academicEndYear", 0] } }
              ]
            },
          sessionEndYear: { $arrayElemAt: ["$session.endYear", 0] },
          sessionName: { $arrayElemAt: ["$session.name", 0] },
          studentFirstname: { $arrayElemAt: ["$student.firstname", 0] },
          studentLastname: { $arrayElemAt: ["$student.lastname", 0] }
        }
      }
    ]);
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

// export async function sectionFeeSummaryController(req, res) {
//   try {
//       // return section fee summary
//       // 1. Collected fee
//       // 2. Expected fee
//       // 3. Pending fee
//       const data = {
//         collectedFee: 1000,
//         expectedFee: 1000,
//         pendingFee: 1000
//       }
//     return res.status(StatusCodes.OK).send(success(200, data));
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
//   }
// }

// export async function sectionStudentsWithPaymentController(req, res) {
//   try {
//     // return list of students with payment status
//     const data = [
//       {
//         studentId: "string",
//         name: "string",
//         paymentStatus: "paid/pending/overdue"
//       }
//     ]
//     return res.status(StatusCodes.OK).send(success(200, data));
//   } catch (err) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
//   }
// }