import { StatusCodes } from "http-status-codes";
import { getPaymentTransactionPipelineService } from "../../../services/paymentTransaction.service.js";
import { error, success } from "../../../utills/responseWrapper.js";
import { convertToMongoId } from "../../../services/mongoose.services.js";



export async function getPaymentAdminDashboardData(req, res) {
  try {
    const {startDate, endDate, sessionId, classId, sectionId, studentId} = req.query;
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

    return res.status(200).send(success(200, {totalAmount, totalTransactions, pendingAmount}));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment admin dashboard data' });
  }
}

export async function getTransactionsController(req, res) {
  try {
    const {startDate, status, endDate, sessionId, classId, sectionId, studentId, page = 1, limit = 10 } = req.query;
    const adminId = req.adminId;

    const filter = { school: convertToMongoId(adminId) };
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    
    if(sessionId) filter.session = sessionId;
    if(classId) filter.classId = classId;
    if(sectionId) filter.section = sectionId;
    if(studentId) filter.student = studentId;
    if(status) filter.status = status;

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