import { getAdminsService } from "../../services/admin.services.js"
import { calculateDaysBetweenDates } from "../../services/celender.service.js";
import { getFeeInstallmentsService } from "../../services/feeStructure/feeInstallment.service.js";
import { getSchoolFeeStructureService } from "../../services/feeStructure/schoolFeeStructure.services.js";
import { getSectionFeeStructuresService } from "../../services/feeStructure/sectionFeeStructure.services.js";
import { getSessionService } from "../../services/session.services.js";
import { getStudentFeeInstallmentService, registerStudentFeeInstallmentService, updateStudentFeeInstallmentService } from "../../services/studentFeeInstallment.service.js";
import { getSessionStudentsService } from "../../services/v2/sessionStudent.service.js";

export async function dailyFeeCalculatorJob() {
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
  } catch (err) {
    console.error('Daily fee calculator job failed:', err); 
    throw err;
  }
}
