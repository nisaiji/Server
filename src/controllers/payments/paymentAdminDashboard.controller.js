import { StatusCodes } from "http-status-codes";
import { error, success } from "../../utills/responseWrapper.js";
import { getPaymentTransactionPipelineService, getPaymentTransactionService } from "../../services/paymentTransaction.service.js";
import { convertToMongoId } from "../../services/mongoose.services.js";
import { countClassService } from "../../services/class.sevices.js";
import { sendPushNotification } from "../../config/firebase.config.js";

export async function schoolPaymentsController(req, res) {
  try {
    const { sessionId, classId, sectionId } = req.query;
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
      collectedFee: collectedFee[0]?.totalAmount,
      pending: 1000,
      overdue: 1000,
      refunded: 1000,
    };
    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function daywisePaymentsSummaryController(req, res) {
  try {
    const { startDate, endDate } = req.body;
    console.log({ startDate: new Date(startDate), endDate: new Date(endDate) })
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
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
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
    const { startDate, endDate } = req.body;
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
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function paymentTransactionsController(req, res) {
  try {
    const { sessionId, classId, sectionId, sessionStudentId } = req.query;
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
          paymentLinkId: 1,

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
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function classMonthlyCollectionController(req, res) {
  try {
    const { classId } = req.params;
    const adminId = req.adminId;

    const data = await getPaymentTransactionPipelineService([
      {
        $match: {
          classId: convertToMongoId(classId),
          school: convertToMongoId(adminId),
          status: "paid"
        }
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "sectionData"
        }
      },
      {
        $group: {
          _id: {
            section: "$section",
            sectionName: { $arrayElemAt: ["$sectionData.name", 0] },
            month: {
              $dateToString: {
                format: "%Y-%m",
                date: "$paidAt"
              }
            }
          },
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.section",
          sectionName: { $first: "$_id.sectionName" },
          monthlyData: {
            $push: {
              month: "$_id.month",
              totalAmount: "$totalAmount",
              transactionCount: "$transactionCount"
            }
          }
        }
      },
      {
        $sort: { sectionName: 1 }
      }
    ]);

    return res.status(StatusCodes.OK).send(success(200, data));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
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
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function parentFeeReminderController(req, res) {
  try {
    const { sessionStudentId } = req.params;
    const adminId = req.adminId;

    const parentData = await getSessionStudentsPipelineService([
      {
        $match: {
          _id: convertToMongoId(sessionStudentId),
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
        $lookup: {
          from: "schoolparents",
          localField: "student.schoolParent",
          foreignField: "_id",
          as: "schoolParent"
        }
      },
      {
        $lookup: {
          from: "parents",
          localField: "schoolParent.parent",
          foreignField: "_id",
          as: "parent"
        }
      },
      {
        $project: {
          fcmToken: { $arrayElemAt: ["$parent.fcmToken", 0] },
          studentName: {
            $concat: [
              { $arrayElemAt: ["$student.firstname", 0] },
              " ",
              { $arrayElemAt: ["$student.lastname", 0] }
            ]
          }
        }
      }
    ]);

    if (!parentData[0]?.fcmToken) {
      return res.status(StatusCodes.BAD_REQUEST).send(error(400, "Bad Request"));
    }

    const { fcmToken, studentName } = parentData[0];
    const title = "Fee Reminder";
    const description = `Please pay the pending fees for ${studentName}`;

    await sendPushNotification(fcmToken, title, description);

    return res.status(StatusCodes.OK).send(success(200, "Fee reminder sent successfully"));
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

// }

/* Class-Wise Reports */
export async function classWiseSummaryController(req, res) {
  try {
    const { sessionID } = req.query;

    const totalClasses = await countClassService({ sessionID });
    // TODO get highestCollection, lowestCollection, overallPaid from payment collection data using sessionID
    let results = {
      totalClasses,
      highestCollection: {
        class: "3rd",
        amount: 500000,
      },
      lowestCollection: {
        class: "Nursery",
        amount: 80000,
      },
      overallPaid: {
        totalExpected: 1000000,
        totalCollected: 800000,
        percentage: 80,
      },
    };

    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function classWiseChartController(req, res) {
  try {
    const { sessionID } = req.query;
    let results = [
      { class: "Nursery", amount: 900000 },
      { class: "LKG", amount: 800000 },
      { class: "UKG", amount: 900000 },
      { class: "1st Grade", amount: 500000 },
      { class: "2nd Grade", amount: 400000 },
      { class: "3rd Grade", amount: 300000 },
      { class: "4th Grade", amount: 200000 },
      { class: "5th Grade", amount: 100000 },
      { class: "6th Grade", amount: 100000 },
      { class: "7th Grade", amount: 100000 },
      { class: "8th Grade", amount: 100000 },
      { class: "9th Grade", amount: 100000 },
      { class: "10th Grade", amount: 100000 },
      { class: "11th Grade", amount: 100000 },
      { class: "12th Grade", amount: 100000 },
    ];

    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function classWiseTransactionsController(req, res) {
  try {
    const { sessionID } = req.query;
    let results = [
      {
        class: "Nursery",
        totalFees: 200000,
        paidFees: 150000,
        pendingFees: 50000,
        paidCount: 50,
        unPaidCount: 10,
        dueDate: "2024-06-30",
      },
      {
        class: "LKG",
        totalFees: 240000,
        paidFees: 100000,
        pendingFees: 51000,
        paidCount: 50,
        unPaidCount: 10,
        dueDate: "2024-06-30",
      },
      {
        class: "UKG",
        totalFees: 200500,
        paidFees: 110000,
        pendingFees: 70000,
        paidCount: 50,
        unPaidCount: 10,
        dueDate: "2024-06-30",
      },
      {
        class: "1st Grade",
        totalFees: 300000,
        paidFees: 250000,
        pendingFees: 50000,
        paidCount: 60,
        unPaidCount: 5,
        dueDate: "2024-06-30",
      },
      {
        class: "2nd Grade",
        totalFees: 250000,
        paidFees: 200000,
        pendingFees: 50000,
        paidCount: 55,
        unPaidCount: 8,
        dueDate: "2024-06-30",
      },
      {
        class: "3rd Grade",
        totalFees: 220000,
        paidFees: 180000,
        pendingFees: 40000,
        paidCount: 52,
        unPaidCount: 12,
        dueDate: "2024-06-30",
      },
      {
        class: "4th Grade",
        totalFees: 210000,
        paidFees: 160000,
        pendingFees: 50000,
        paidCount: 50,
        unPaidCount: 15,
        dueDate: "2024-06-30",
      },
      {
        class: "5th Grade",
        totalFees: 200000,
        paidFees: 150000,
        pendingFees: 50000,
        paidCount: 48,
        unPaidCount: 18,
        dueDate: "2024-06-30",
      },
      {
        class: "6th Grade",
        totalFees: 190000,
        paidFees: 140000,
        pendingFees: 50000,
        paidCount: 45,
        unPaidCount: 20,
        dueDate: "2024-06-30",
      },
      {
        class: "7th Grade",
        totalFees: 180000,
        paidFees: 130000,
        pendingFees: 50000,
        paidCount: 42,
        unPaidCount: 22,
        dueDate: "2024-06-30",
      },
      {
        class: "8th Grade",
        totalFees: 170000,
        paidFees: 120000,
        pendingFees: 50000,
        paidCount: 40,
        unPaidCount: 25,
        dueDate: "2024-06-30",
      },
      {
        class: "9th Grade",
        totalFees: 160000,
        paidFees: 110000,
        pendingFees: 50000,
        paidCount: 38,
        unPaidCount: 28,
        dueDate: "2024-06-30",
      },
      {
        class: "10th Grade",
        totalFees: 150000,
        paidFees: 100000,
        pendingFees: 50000,
        paidCount: 35,
        unPaidCount: 30,
        dueDate: "2024-06-30",
      },
      {
        class: "11th Grade",
        totalFees: 140000,
        paidFees: 90000,
        pendingFees: 50000,
        paidCount: 32,
        unPaidCount: 33,
        dueDate: "2024-06-30",
      },
      {
        class: "12th Grade",
        totalFees: 130000,
        paidFees: 80000,
        pendingFees: 50000,
        paidCount: 30,
        unPaidCount: 35,
        dueDate: "2024-06-30",
      },
    ];

    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

/* Periodically Reports */
export async function periodicallySummaryController(req, res) {
  try {
    /*
    sessionId: mongoID
    classId: mongoID,
    periodType: yearly | monthly | weekly
    */
    const { sessionID, classID, periodType } = req.query;

    let results = {
      totalExpected: { amount: 1000000, students: 640 },
      totalCollected: { amount: 800000, students: 500 },
      pendingPayments: { amount: 80000, students: 100 },
      refundedAmount: { amount: 80000, students: 40 },
    };
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function periodicallyChartController(req, res) {
  try {
    /*
    sessionId: mongoID
    classId: mongoID,
    periodType: numeric: [yearly, monthly, weekly]


    Blue bars (Expected)
    Green bars (Collected)
    Orange line (Refunds / Variance)
    */
    const { sessionID, classId, periodType } = req.query;

    let results;

    switch (periodType) {
      case "monthly":
        //todo add check for sessionID and classId
        // modify results for monthly data
        results = [
          {
            period: "January",
            expected: 80000,
            collected: 70000,
            refunds: 5000,
          },
          {
            period: "February",
            expected: 90000,
            collected: 85000,
            refunds: 3000,
          },
          { period: "March", expected: 95000, collected: 90000, refunds: 4000 },
          {
            period: "April",
            expected: 100000,
            collected: 95000,
            refunds: 2000,
          },
          { period: "May", expected: 110000, collected: 105000, refunds: 6000 },
          {
            period: "June",
            expected: 120000,
            collected: 115000,
            refunds: 7000,
          },
        ];
        break;
      case "weekly":
        // modify results for weekly data
        results = 70;
        break;
      case "yearly":
      default:
        // default to yearly data
        results = [
          {
            label: "2020",
            collected: 250000,
            expected: 300000,
            refunds: 50000,
          },
          {
            label: "2021",
            collected: 280000,
            expected: 320000,
            refunds: 40000,
          },
          {
            label: "2022",
            collected: 300000,
            expected: 350000,
            refunds: 50000,
          },
          {
            label: "2023",
            collected: 350000,
            expected: 400000,
            refunds: 50000,
          },
          {
            label: "2024",
            collected: 400000,
            expected: 450000,
            refunds: 50000,
          },
          {
            label: "2025",
            collected: 450000,
            expected: 500000,
            refunds: 50000,
          },
        ];
    }
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function periodicallyTransactionsController(req, res) {
  try {
    /*
    sessionId: mongoID
    classId: mongoID,
    */
    const { sessionID, classId } = req.query;

    let results = [
      {
        year: "2020",
        feesExpected: 180000,
        feesCollected: 150000,
        familiarMode: "Credit Card",
        refunds: 30000,
      },
      {
        year: "2021",
        feesExpected: 220000,
        feesCollected: 210000,
        familiarMode: "Net Banking",
        refunds: 10000,
      },
      {
        year: "2022",
        feesExpected: 200000,
        feesCollected: 200000,
        familiarMode: "UPI",
        refunds: 50000,
      },
      {
        year: "2023",
        feesExpected: 240000,
        feesCollected: 240000,
        familiarMode: "Net Banking",
        refunds: 70000,
      },
      {
        year: "2024",
        feesExpected: 260000,
        feesCollected: 250000,
        familiarMode: "Credit Card",
        refunds: 10000,
      },
      {
        year: "2025",
        feesExpected: 300000,
        feesCollected: 290000,
        familiarMode: "UPI",
        refunds: 20000,
      },
    ];
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

/* Payment-Mode Reports */
export async function paymentModeSummaryController(req, res) {
  try {
    /*
    sessionId: mongoID
    classId: mongoID,
    periodType: yearly | monthly | weekly
    */
    const { session, class: classId } = req.query;

    let results = {
      totalAmount: 100000,
      modes: [
        { mode: "UPI", amount: 50000, transactions: 50 },
        { mode: "Credit Card", amount: 20000, transactions: 20 },
        { mode: "Net Banking", amount: 20000, transactions: 20 },
        { mode: "Others", amount: 10000, transactions: 30 },
      ],
    };
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function paymentModeTransactionsController(req, res) {
  try {
    const { session, class: classId } = req.query;

    let results = [
      {
        mode: "UPI",
        transactions: 50,
        totalAmount: 50000,
      },
      {
        mode: "Net Banking",
        transactions: 20,
        totalAmount: 20000,
      },
      {
        mode: "Credit Card",
        transactions: 20,
        totalAmount: 20000,
      },
      {
        mode: "Others",
        transactions: 30,
        totalAmount: 10000,
      },
    ];
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

/* Fees Summary Reports */
export async function feesSummaryController(req, res) {
  try {
    const { session, class: classId } = req.query;

    let results = {
      totalExpected: {
        amount: 1000000,
        students: 640,
      },
      totalCollected: {
        amount: 800000,
        students: 500,
      },
      pending: {
        amount: 80000,
        students: 100,
      },
      overdue: {
        amount: 80000,
        students: 40,
      },
      totalFees: 2000000,
    };
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function feesTransactionsController(req, res) {
  try {
    const { session, class: classId } = req.query;

    let results = {
      total: 18,
      data: [
        {
          studentName: "Anushka Mishra",
          studentID: "68a9a4eef727e99a02b477f4",
          installmentID: "68a9a4eef727e99a02b477f5",
          class: "1 A",
          amount: 7000,
          dueDate: "2025-11-09",
          daysOverdue: 0,
          status: "PENDING",
        },
        {
          studentName: "Vaibhav Trivedi",
          studentID: "68a9a4eef727e99a02b477f4",
          installmentID: "68a9a4eef727e99a02b477f5",
          class: "2 B",
          amount: 8000,
          dueDate: "2025-11-04",
          daysOverdue: 9,
          status: "OVERDUE",
        },
      ],
    };

    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function sendReminderController(req, res) {
  try {
    // TODO Implementation for sending reminders using installmentId
    const { installmentID } = req.body;
    return res
      .status(StatusCodes.OK)
      .send(success(200, { message: "Reminders sent successfully" }));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

/* Refund and Failed Reports */
export async function refundFailedSummaryController(req, res) {
  try {
    const { sessionID } = req.query;
    let results = {
      totalExpected: {
        amount: 100000,
        students: 640,
      },
      totalCollected: {
        amount: 43000,
        students: 500,
      },
      refunded: {
        amount: 7000,
        transactions: 40,
      },
      failed: {
        amount: 50000,
        transactions: 50,
      },
    };
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function refundFailedChartController(req, res) {
  try {
    const { sessionID, classID, periodType } = req.query;

    let results;

    switch (periodType) {
      case "monthly":
        //todo add check for sessionID and classID
        // modify results for monthly data
        results = [
          {
            period: "January",
            refunded: 5000,
            failed: 3000,
          },
          {
            period: "February",
            refunded: 6000,
            failed: 2000,
          },
          { period: "March", refunded: 4000, failed: 1000 },
          {
            period: "April",
            refunded: 7000,
            failed: 4000,
          },
          { period: "May", refunded: 6000, failed: 3000 },
          {
            period: "June",
            refunded: 8000,
            failed: 5000,
          },
        ];
        break;
      case "weekly":
        // modify results for weekly data
        results = [
          {
            period: "Monday",
            refunded: 5000,
            failed: 3000,
          },
          {
            period: "Tuesday",
            refunded: 6000,
            failed: 2000,
          },
          { period: "Wednesday", refunded: 4000, failed: 1000 },
          {
            period: "Thursday",
            refunded: 7000,
            failed: 4000,
          },
          { period: "Friday", refunded: 6000, failed: 3000 },
          {
            period: "Saturday",
            refunded: 8000,
            failed: 5000,
          },
        ];
        break;
      case "yearly":
      default:
        // default to yearly data
        results = [
          {
            label: "2020",
            refunded: 50000,
            failed: 20000,
          },
          {
            label: "2021",
            refunded: 40000,
            failed: 15000,
          },
          {
            label: "2022",
            refunded: 60000,
            failed: 25000,
          },
          {
            label: "2023",
            refunded: 70000,
            failed: 30000,
          },
          {
            label: "2024",
            refunded: 80000,
            failed: 35000,
          },
        ];
    }
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}

export async function refundFailedTransactionsController(req, res) {
  try {
    const { sessionID, classID } = req.query;

    let results = {
      total: 18,
      data: [
        {
          transactionId: "12128CNN",
          studentName: "Anushka Mishra",
          class: "1 A",
          amount: 7000,
          dateTime: "2025-01-04T00:12:03",
          mode: "UPI",
          status: "FAILED",
        },
        {
          transactionId: "123FRT67",
          studentName: "Vaibhav Trivedi",
          class: "2 B",
          amount: 8000,
          dateTime: "2025-05-06T08:45:00",
          mode: "NET_BANKING",
          status: "FAILED",
        },
        {
          transactionId: "563YTU86",
          studentName: "Janvi Mittal",
          class: "11 B",
          amount: 24000,
          dateTime: "2025-03-05T20:03:00",
          mode: "CREDIT_CARD",
          status: "REFUNDED",
        },
      ],
    };
    return res.status(StatusCodes.OK).send(success(200, results));
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(error(500, err.message));
  }
}
