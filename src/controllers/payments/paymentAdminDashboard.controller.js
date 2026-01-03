import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { getPaymentTransactionPipelineService, getPaymentTransactionService } from "../../services/paymentTransaction.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";

export async function schoolPaymentsController(req, res) {
  try {
    // const adminId = req.adminId;
    // returns data for school:
    // 1. collected fees
    // 2. pending payments
    // 3. overdue payments
    // 4. refunded amount
    const collectedFee = await getPaymentTransactionPipelineService([
      {
        $match: {
          // school: convertToMongoId(adminId),
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ])
    console.log(JSON.stringify(collectedFee));
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

export async function monthlyPaymentsSummaryController(req, res) {
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
    // return payment-transactions for
    // section
    // class
    // school
    const data = await getPaymentTransactionService({});
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function sectionFeeSummaryController(req, res) {
  try {
      // return section fee summary
      // 1. Collected fee
      // 2. Expected fee
      // 3. Pending fee
      const data = {
        collectedFee: 1000,
        expectedFee: 1000,
        pendingFee: 1000
      }
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function sectionStudentsWithPaymentController(req, res) {
  try {
    // return list of students with payment status
    const data = [
      {
        studentId: "string",
        name: "string",
        paymentStatus: "paid/pending/overdue"
      }
    ]
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}