'use strict';

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'sharedri'],

  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info'
  },

  // Do not capture all request headers by default.
  allow_all_headers: false,

  attributes: {
    // Prevent sensitive headers from being sent to New Relic.
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie',
      'request.headers.x-*',

      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie',
      'response.headers.x-*'
    ]
  },

  // Capture useful transaction information.
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    explain_enabled: false
  },

  // Capture errors.
  error_collector: {
    enabled: true,
    ignore_status_codes: [404]
  },

  // Distributed tracing.
  distributed_tracing: {
    enabled: true
  },

  // Browser monitoring is normally disabled for a backend API.
  browser_monitoring: {
    enabled: false
  }
};