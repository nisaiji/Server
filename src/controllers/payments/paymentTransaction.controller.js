import { convertToMongoId } from "../../services/mongoose.services.js";
import { getPaymentTransactionPipelineService } from "../../services/paymentTransaction.service.js";
import { getSessionStudentService } from "../../services/v2/sessionStudent.service.js";
import { error, success } from "../../utills/responseWrapper.js";

export async function getPaymentTransactionOfSessionStudentForParentController(req, res) {
  try {
    const { sessionStudentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const parentId = req.parentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessionStudent = await getSessionStudentService({_id: sessionStudentId});
    if (!sessionStudent) {
      return res.status(404).send(error(404, "Session Student not found"));
    }
    const paymentTransactions = await getPaymentTransactionPipelineService([
      {
        $match: {
          sessionStudent: convertToMongoId(sessionStudentId),
          parent: convertToMongoId(parentId)
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    return res.status(200).send(success(200, {paymentTransactions, page, limit}));
    
  } catch (err) {
    return res.status(500).send(error(500, err.message));
  }
}
