"use strict";

const ledgerEvent = require('../models/ledgerEvent.model');
const feeInstallments = require('../models/feeInstallment.model');


//TODO: need to add date and academic filtering where applicable
class BalanceService {

    // Advance = sum(PaymentReceived) - sum(AdvanceAppliedToInstallment) - sum(RefundIssued);
    async getStudentAdvanceBalance(studentId) {
        try {
            const result = await ledgerEvent.aggregate([
                { $match: { studentId, eventType: { $in: ['PaymentReceived', 'AdvanceAppliedToInstallment', 'RefundIssued'] } } },
                {
                    $group: {
                        _id: "$eventType",
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            const paymentReceived = 0, advanceApplied = 0, refundIssued = 0;
            for (const record of result) {
                if (record._id === 'PaymentReceived') paymentReceived = record.total;
                if (record._id === 'AdvanceAppliedToInstallment') advanceApplied = record.total;
                if (record._id === 'RefundIssued') refundIssued = record.total;
            }

            return paymentReceived - advanceApplied - refundIssued;

        } catch (error) {
            throw new Error("Error calculating advance balance: " + error.message);
        }
    }

    // outstanding principle per installment = principalAmount - AdvanceAppliedToInstallment - concessionsGranted
    async getInstallmentPrincipleOutstanding(feeInstallmentId) {
        try {
            const installment = await feeInstallments.findById(feeInstallmentId);
            if (!installment) {
                throw new Error("Installment not found");
            }

            const result = await ledgerEvent.aggregate([
                { $match: { feeInstallmentId, eventType: { $in: ['AdvanceAppliedToInstallment', 'ConcessionGranted'] } } },
                {
                    $group: {
                        _id: "$eventType",
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            let advanceApplied = 0, concessionsGranted = 0;
            for (const record of result) {
                if (record._id === 'AdvanceAppliedToInstallment') advanceApplied = record.total;
                if (record._id === 'ConcessionGranted') concessionsGranted = record.total;
            }

            return Math.max(installment.principalAmount - advanceApplied - concessionsGranted, 0);
        } catch (error) {
            throw new Error("Error calculating outstanding principle: " + error.message);
        }
    }

    //Late fee outstanding per installment = lateFeeAccured - LateFeeWaived
    async getInstallmentLateFeeOutstanding(feeInstallmentId) {
        try {
            const result = await ledgerEvent.aggregate([
                { $match: { feeInstallmentId, eventType: { $in: ['LateFeeAccrued', 'LateFeeWaived'] } } },
                {
                    $group: {
                        _id: "$eventType",
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            let accured = 0, waived = 0;
            for (const record of result) {
                if (record._id === 'LateFeeAccrued') accured = record.total;
                if (record._id === 'LateFeeWaived') waived = record.total;
            }
            return Math.max(accured - waived, 0);
        } catch (error) {
            throw new Error("Error calculating total outstanding principle: " + error.message);
        }
    }
}

module.exports = new BalanceService();