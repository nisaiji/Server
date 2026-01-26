import { StatusCodes } from "http-status-codes";
import { getAdminsService } from "../services/admin.services.js"; 
import { calculateDaysBetweenDates } from "../services/celender.service.js"; 
import { getFeeInstallmentsService } from "../services/feeStructure/feeInstallment.service.js"; 
import { getSchoolFeeStructureService } from "../services/feeStructure/schoolFeeStructure.services.js"; 
import { getSectionFeeStructuresService } from "../services/feeStructure/sectionFeeStructure.services.js"; 
import { getSessionService } from "../services/session.services.js"; 
import { getStudentFeeInstallmentService, getStudentFeeInstallmentsService, registerStudentFeeInstallmentService, updateStudentFeeInstallmentService } from "../services/studentFeeInstallment.service.js";
import { getSessionStudentsService } from "../services/v2/sessionStudent.service.js";
import { getSessionStudentWalletService, updateSessionStudentWalletService } from "../services/sessionStudentWallet.services.js";
import { convertToMongoId } from "../services/mongoose.services.js";


export async function dailyFeeCalculatorJobController(req, res) {
  try {
    const schools = await getAdminsService({});
    for (const school of schools) {
      const currentSession = await getSessionService({ school: school['_id'] });
      const schoolFeeStructure = await getSchoolFeeStructureService({ school: school['_id'], session: currentSession['_id'] });
      if (schoolFeeStructure) {
        const lateFeePercent = schoolFeeStructure?.lateFeePercent;
        const sectionFeeStructures = await getSectionFeeStructuresService({ school: school['_id'], session: currentSession['_id'], schoolFeeStructure: schoolFeeStructure['_id'] });

        console.log(`sectionFeeStructure: ${sectionFeeStructures}`)

        for (const sectionFeeStructure of sectionFeeStructures) {

          const sectionFeeInstallments = await getFeeInstallmentsService({ sectionFeeStructure: sectionFeeStructure['_id'], dueDate: { $lte: new Date() } });
          const sectionSessionStudents = await getSessionStudentsService({ school: school['_id'], session: currentSession['_id'], section: sectionFeeStructure['section'] });
          
          console.log(`sectionFeeInstallments: ${sectionFeeInstallments}`)
          console.log(`sectionSessionStudents: ${sectionSessionStudents}`)

          for (const installment of sectionFeeInstallments) {
            for (const sectionSessionStudent of sectionSessionStudents) {

              console.log(`session-student : ${sectionSessionStudent.id} ,installment-id: ${installment._id}`);

              let studentFeeInstallment = await getStudentFeeInstallmentService({ sessionStudent: sectionSessionStudent['_id'], feeInstallment: installment['_id'], status: { $ne: 'paid' } });

              if (!studentFeeInstallment) {
                studentFeeInstallment = await registerStudentFeeInstallmentService({
                  feeInstallment: installment._id,
                  sessionStudent: sectionSessionStudent._id,
                  student: sectionSessionStudent.student,
                  school: sectionSessionStudent.school,
                  session: sectionSessionStudent.session,
                  classId: sectionSessionStudent.classId,
                  section: sectionSessionStudent.section,
                  month: installment.installmentNumber,
                  baseAmount: installment.amount,
                  dueDate: installment.dueDate
                });
              }
                                                    
              // Only calculate late fee if past due date and not already calculated today
              console.log(`StudentFeeInstallment : ${studentFeeInstallment}`);
              const today = new Date();
              const lastCalculated = studentFeeInstallment.lastLateFeeCalculatedDate || installment.dueDate;
              if (today > new Date(installment.dueDate) && 
                  (!studentFeeInstallment.lastLateFeeCalculatedDate || 
                   new Date(studentFeeInstallment.lastLateFeeCalculatedDate).toDateString() !== today.toDateString())) {
                
                const fineableAmount = studentFeeInstallment.baseAmount - (studentFeeInstallment.amountPaid || 0);
                const fineableDays = calculateDaysBetweenDates(lastCalculated, today);
                const lateFee = Math.round(fineableAmount * (lateFeePercent/ 100 / 365) * fineableDays);
                
                if (lateFee > 0) {
                  console.log(`For student: ${sectionSessionStudent.student} :-`);
                  console.log({lateFee, fineableAmount, fineableDays, lastCalculated, today});
                  const studentFeeInstallmentPayload = {
                    lastLateFeeCalculatedDate: today,
                    lateFeeApplied: (studentFeeInstallment.lateFeeApplied || 0) + lateFee,
                    totalPayable: (studentFeeInstallment.totalPayable || studentFeeInstallment.baseAmount) + lateFee
                  };
                  await updateStudentFeeInstallmentService({ _id: studentFeeInstallment._id }, studentFeeInstallmentPayload);
                }
              }
            }
          }
        }
      }
    }
    return res.status(StatusCodes.OK).send("success");
  } catch (err) {
    console.error('Daily fee calculator job failed:', err); 
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err)
  }
}

export async function payFeeFromWalletJobController(req, res) {
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
    return res.status(200).send("success");
  } catch (error) {
    console.error('Error in payFeeFromWalletJob:', error);
    return res.status(500).send(error);
  }
}

