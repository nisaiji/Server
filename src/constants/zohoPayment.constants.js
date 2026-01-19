const scopes = [
  "ZohoPay.payments.CREATE",
  "ZohoPay.payments.READ",
  "ZohoPay.payments.UPDATE",
  "ZohoPay.refunds.CREATE",
  "ZohoPay.refunds.READ",
  "ZohoPay.customers.CREATE",
  "ZohoPay.payouts.READ"
];

const sandboxScopes = [
  "ZohoPaySandbox.payments.CREATE",
  "ZohoPaySandbox.payments.READ",
  "ZohoPaySandbox.payments.UPDATE",
  "ZohoPaySandbox.refunds.CREATE",
  "ZohoPaySandbox.refunds.READ",
  "ZohoPaySandbox.customers.CREATE",
  "ZohoPaySandbox.payouts.READ"
]

export const zohoTokenPath = "/oauth/v2/token";
export const zohoRevokeRefreshTokenPath = "/oauth/v2/token/revoke";
export const zohoCreatePaymentSessionPath = "/api/v1/paymentsessions";
export const zohoCreatePaymentLinkPath = "/api/v1/paymentlinks";
export const zohoCreateRefundPath = "/api/v1/payments/{paymentId}/refunds";

export const ZOHO_PAYMENT_SCOPES = scopes.join(",");
export const ZOHO_PAYMENT_SANDBOX_SCOPES = sandboxScopes.join(",");
