import { StatusCodes } from "http-status-codes";
import { getPaymentTransactionPipelineService } from "../../../services/paymentTransaction.service.js";
import { error, success } from "../../../utills/responseWrapper.js";
import { convertToMongoId } from "../../../services/mongoose.services.js";
import { getSectionsPipelineService } from "../../../services/section.services.js";
import { getSessionStudentsPipelineService } from "../../../services/v2/sessionStudent.service.js";



export async function getPaymentAdminDashboardData(req, res) {
  try {
    const { startDate, endDate, sessionId, classId, sectionId, studentId } = req.query;
    const adminId = req.adminId;
    const filter = { status: 'paid', school: convertToMongoId(adminId) };
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    if (sessionId) filter.session = sessionId;
    if (classId) filter.classId = classId;
    if (sectionId) filter.section = sectionId;
    if (studentId) filter.student = studentId;

    const paymentTransactions = await getPaymentTransactionPipelineService([
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const totalAmount = paymentTransactions[0]?.totalAmount || 0;
    const totalTransactions = paymentTransactions[0]?.totalTransactions || 0;

    return res.status(200).send(success(200, { totalAmount, totalTransactions, pendingAmount }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment admin dashboard data' });
  }
}

export async function getTransactionsController(req, res) {
  try {
    const { startDate, status, endDate, sessionId, classId, sectionId, sessionStudentId, page = 1, limit = 10 } = req.query;
    const adminId = req.adminId;

    const filter = { school: convertToMongoId(adminId) };
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    if (sessionId) filter.session = sessionId;
    if (classId) filter.classId = classId;
    if (sectionId) filter.section = sectionId;
    if (sessionStudentId) filter.sessionStudent = sessionStudentId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const paymentTransactions = await getPaymentTransactionPipelineService([
      {
        $match: filter
      },
      {
        $sort: { date: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const totalCount = await getPaymentTransactionPipelineService([
      { $match: filter },
      { $count: "total" }
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    return res.status(StatusCodes.OK).send(success(200, {
      transactions: paymentTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount: total,
        pageLimit: parseInt(limit)
      }
    }));

  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function daywisePaymentsSummaryController(req, res) {
  try {
    const { startDate, endDate, sessionId, classId, sectionId } = req.body;
    const adminId = req.adminId;
    const payments = await getPaymentTransactionPipelineService([
      {
        $match: {
          status: "paid",
          school: convertToMongoId(adminId),
          ...(sessionId && { session: convertToMongoId(sessionId) }),
          ...(classId && { classId: convertToMongoId(classId) }),
          ...(sectionId && { section: convertToMongoId(sectionId) }),
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
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function paymentsByPaymentModesController(req, res) {
  try {
    const { startDate, endDate, sessionId, classId, sectionId } = req.body;
    const adminId = req.adminId;
    const payments = await getPaymentTransactionPipelineService([
      {
        $match: {
          status: "paid",
          school: convertToMongoId(adminId),
          ...(sessionId && { session: convertToMongoId(sessionId) }),
          ...(classId && { classId: convertToMongoId(classId) }),
          ...(sectionId && { section: convertToMongoId(sectionId) }),
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

export async function sectionsReportController(req, res) {
  try {
    const { sessionId } = req.query;
    const adminId = req.adminId;

    const currentDate = new Date();

    const pipeline = [
      {
        $match: {
          session: convertToMongoId(sessionId),
          admin: convertToMongoId(adminId)
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "classDetails"
        }
      },
      {
        $unwind: "$classDetails"
      },
      {
        $lookup: {
          from: "feeinstallments",
          let: { sectionId: "$_id", sessionId: "$session" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$section", "$$sectionId"] },
                    { $lte: ["$dueDate", currentDate] }
                  ]
                }
              }
            },
            { $sort: { dueDate: -1 } },
            { $limit: 1 }
          ],
          as: "latestInstallment"
        }
      },
      {
        $lookup: {
          from: "studentfeeinstallments",
          let: { 
            sectionId: "$_id", 
            sessionId: "$session",
            latestInstallmentId: { $arrayElemAt: ["$latestInstallment._id", 0] }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$section", "$$sectionId"] },
                    { $eq: ["$feeInstallment", "$$latestInstallmentId"] },
                    { $eq: ["$status", "paid"] }
                  ]
                }
              }
            }
          ],
          as: "paidStudents"
        }
      },
      {
        $lookup: {
          from: "sessionstudents",
          let: { sectionId: "$_id", sessionId: "$session" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$section", "$$sectionId"] },
                    { $eq: ["$session", "$$sessionId"] }
                  ]
                }
              }
            }
          ],
          as: "totalStudents"
        }
      },
      {
        $addFields: {
          paidStudentsCount: { $size: "$paidStudents" },
          totalStudentsCount: { $size: "$totalStudents" },
          unpaidStudentsCount: {
            $subtract: [
              { $size: "$totalStudents" },
              { $size: "$paidStudents" }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          classId: "$classDetails._id",
          className: "$classDetails.name",
          sectionStudentCount: "$studentCount",
          paidStudentsCount: 1,
          unpaidStudentsCount: 1,
          totalStudentsCount: 1,
        }
      }
    ];

    const sections = await getSectionsPipelineService(pipeline);

    return res.status(StatusCodes.OK).send(success(200, { sections }));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function sectionStudentsFeeInstallmentsController(req, res) {
  try {
    const { sessionId, sectionId } = req.query;
    const adminId = req.adminId;

    const pipeline = [
      {
        $match: {
          session: convertToMongoId(sessionId),
          section: convertToMongoId("689ee11474d391f6f87fd2dc"),
          school: convertToMongoId(adminId)
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
        $unwind: "$student"
      },
      {
        $lookup: {
          from: "studentfeeinstallments",
          let: { sessionStudentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$sessionStudent", "$$sessionStudentId"] }
              }
            },
            {
              $lookup: {
                from: "feeinstallments",
                localField: "feeInstallment",
                foreignField: "_id",
                as: "feeInstallment"
              }
            },
            {
              $unwind: "$feeInstallment"
            }
          ],
          as: "studentFeeInstallments"
        }
      },
    ];

    const sessionStudents = await getSessionStudentsPipelineService(pipeline);

    return res.status(StatusCodes.OK).send(success(200, sessionStudents ));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getTotalRefundedAmountController(req, res) {
  try {
    const { startDate, endDate, sessionId, classId, sectionId, studentId } = req.query;
    const adminId = req.adminId;
    const filter = { status: 'refunded', school: convertToMongoId(adminId) };
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    if (sessionId) filter.session = sessionId;
    if (classId) filter.classId = classId;
    if (sectionId) filter.section = sectionId;
    if (studentId) filter.student = studentId;

    const paymentTransactions = await getPaymentTransactionPipelineService([
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalRefundedAmount: { $sum: '$amount' },
          totalRefundedTransactions: { $sum: 1 }
        }
      }
    ]);

    const totalRefundedAmount = paymentTransactions[0]?.totalRefundedAmount || 0;
    const totalRefundedTransactions = paymentTransactions[0]?.totalRefundedTransactions || 0;

    return res.status(200).send(success(200, { totalRefundedAmount, totalRefundedTransactions }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment admin dashboard data' });
  }
}