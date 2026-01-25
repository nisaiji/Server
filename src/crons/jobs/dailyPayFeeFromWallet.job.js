import { convertToMongoId } from "../../services/mongoose.services.js";
import { getSessionStudentsService } from "../../services/v2/sessionStudent.service.js";
import { getAdminsService } from "../../services/admin.services.js";
import { getSessionService } from "../../services/session.services.js";
import { getSessionStudentWalletService, updateSessionStudentWalletService } from "../../services/sessionStudentWallet.services.js";
import { getStudentFeeInstallmentsService, updateStudentFeeInstallmentService } from "../../services/studentFeeInstallment.service.js";

export async function payFeeFromWalletJob() {
  console.log('Starting payFeeFromWalletJob...');
  let totalProcessed = 0, totalPaid = 0;
  
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
        let walletBalance = sessionStudentWallet?.balance || 0;
        if (!sessionStudentWallet || walletBalance === 0) continue;
        
        const unpaidInstallments = await getStudentFeeInstallmentsService(
          { sessionStudent: sessionStudent._id, status: { $ne: 'paid' } },
          {},
          { dueDate: 1 }
        );

        console.log(`unpaid installments count: ${unpaidInstallments.length}`)
        
        let studentPaidCount = 0;
        for (const installment of unpaidInstallments) {
          if (walletBalance > 0) {
            const amountToPay = Math.min(walletBalance, installment.totalPayable);
            const currentPaid = installment.amountPaid || 0;
            const newAmountPaid = currentPaid + amountToPay;
            const isFullyPaid = newAmountPaid >= installment.totalPayable;
            
            await updateStudentFeeInstallmentService(
              { _id: installment._id },
              { 
                status: isFullyPaid ? 'paid' : 'partial',
                paidDate: isFullyPaid ? new Date() : installment.paidDate,
                amountPaid: newAmountPaid
              }
            );
            
            walletBalance -= amountToPay;
            
            await updateSessionStudentWalletService(
              { sessionStudent: sessionStudent._id },
              { balance: walletBalance }
            );
            
            studentPaidCount++;
            if (isFullyPaid) totalPaid++;
            
            console.log(`Installment ${installment._id}: Paid ${amountToPay}, Status: ${isFullyPaid ? 'paid' : 'partial'}`);
            
            if (walletBalance === 0) break;
          }
        }
        
        if (studentPaidCount > 0) {
          console.log(`Student ${sessionStudent._id}: Processed ${studentPaidCount} installments, remaining balance: ${walletBalance}`);
        }
        totalProcessed++;
      }
    }
    
    console.log(`Job completed: ${totalProcessed} students processed, ${totalPaid} installments fully paid`);
  } catch (error) {
    console.error('Error in payFeeFromWalletJob:', error);
  }
}
