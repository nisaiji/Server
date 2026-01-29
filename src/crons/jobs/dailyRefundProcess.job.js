import { convertToMongoId } from "../../services/mongoose.services.js";
import { getSessionStudentsService } from "../../services/v2/sessionStudent.service.js";
import { getAdminsService } from "../../services/admin.services.js";
import { getSessionService } from "../../services/session.services.js";
import { getSessionStudentWalletService, updateSessionStudentWalletService } from "../../services/sessionStudentWallet.services.js";
import { getStudentFeeInstallmentsService, updateStudentFeeInstallmentService } from "../../services/studentFeeInstallment.service.js";

export async function refundJob() {
  console.log('Starting RefundJob...');
  
  try {
    const schools = await getAdminsService({});
    console.log(`Processing ${schools.length} schools`);
    
    for (const school of schools) {
      const currentSession = await getSessionService({ school: school['_id'], status: 'active' });
      if (!currentSession) {
        console.log(`No active session for school ${school._id}`);
        continue;
      }
      
      const sessionStudents = await getSessionStudentsService({
        school: convertToMongoId(school['_id']), 
        session: convertToMongoId(currentSession['_id'])
      });
      console.log(`School ${school._id}: ${sessionStudents.length} students`);
      
      for (const sessionStudent of sessionStudents) {
        const sessionStudentWallet = await getSessionStudentWalletService({sessionStudent: sessionStudent._id});
        let refundableBalance = sessionStudentWallet?.refundableBalance || 0;
        if (!sessionStudentWallet || refundableBalance === 0) continue;
        
        const paidInstallments = await getStudentFeeInstallmentsService(
          { sessionStudent: sessionStudent._id },
          {},
          { dueDate: -1 }
        );

        console.log(`paid installments count: ${paidInstallments.length}`);

        for (const installment of paidInstallments) {
          if (refundableBalance > 0) {
            const installmentPaidAmount = installment.amountPaid || 0;
            if (installmentPaidAmount === 0) continue;
            
            const refundAmount = Math.min(refundableBalance, installmentPaidAmount);
            const newInstallmentAmountPaid = installmentPaidAmount - refundAmount;
            refundableBalance -= refundAmount;
            
            await updateStudentFeeInstallmentService(
              { _id: installment._id },
              { 
                status: newInstallmentAmountPaid === 0 ? 'unpaid' : 'partial',
                amountPaid: newInstallmentAmountPaid
              }
            );
        
            if (refundableBalance === 0) break;
          }
        }

        await updateSessionStudentWalletService(
          { sessionStudent: sessionStudent._id },
          { refundableBalance: 0 }
        );
      }
    }
  } catch (error) {
    console.error('Error in refund:', error);
  }
}
