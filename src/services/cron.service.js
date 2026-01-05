import dayjs from 'dayjs';
import ledgerEventModel from '../models/ledgerEvent.model';
import {
    getStudentAdvanceBalance,
    getInstallmentPrincipleOutstanding
} from './balance.service.js';
import { getFeeInstallmentsService } from './feeStructure/feeInstallment.service.js';
import { getSchoolFeeStructureService } from './feeStructure/schoolFeeStructure.service.js';
import mongoose from 'mongoose';

export async function processDueDateCron() {
    const today = dayjs().startOf('day');
    const tommorrow = today.add(1, 'day');

    //All instaments whose due date is today
    const dueInstallments = await getFeeInstallmentsService({
        dueDate: { $gte: today.toDate(), $lt: tommorrow.toDate() },
    });

    for (const installment of dueInstallments) {
        // Idempotency: ensure we are doing this only once per installment
        const alreadyApplied = await ledgerEventModel.exists({
            eventType: 'AdvanceAppliedToInstallment',
            feeInstallmentId: installment._id,
        });
        if (alreadyApplied) continue;

        const principalOutStanding = await getInstallmentPrincipleOutstanding(installment._id);
        if (principalOutStanding <= 0) continue; // nothing to apply

        const studentAdvance = await getStudentAdvanceBalance(installment.studentId);
        if (studentAdvance <= 0) continue; // no advance to apply

        const amountToApply = Math.min(studentAdvance, principalOutStanding);
        if (amountToApply <= 0) continue;

        await ledgerEventModel.create({
            eventType: 'AdvanceAppliedToInstallment',
            studentId: installment.studentId,
            feeInstallmentId: installment._id,
            amount: amountToApply,
            actorType: 'system_cron',
            actorId: new mongoose.Types.ObjectId(), // system actor id
            reason: 'Auto-apply advance on due date',
            metadata: { runDate: today.toDate() },
        });
    }

}

function truncateToTwoDecimals(num) {
    return Math.trunc(num * 100) / 100;
}

export async function processLateFeeCron() {
    const today = dayjs().startOf('day');
    const yesterday = today.subtract(1, 'day');

    const overdeueInstallments = await getFeeInstallmentsService.find({dueDate: { $lt: today.toDate() }});

    for(const installment of overdeueInstallments) {
        const principalOutStanding = await getInstallmentPrincipleOutstanding(installment._id);
        if(principalOutStanding <= 0) continue; // nothing to apply
        const fs = await getSchoolFeeStructureService({_id: installment.feeStructure});
        if (!fs || !fs.lateFeePercent) continue;
    }
}