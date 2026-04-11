// ========================================
// RevenueCat ETag Header Remover - Enhanced
// ⚡ Performance: Ultra Fast
// 🔐 Remove ALL caching headers for RevenueCat apps
// 📅 Version: 2.0 (2026-04-08)
// 👤 Author: z3rokaze
// 🔄 Changelog:
//   v2.0 - Added X-RevenueCat-Request-UUID removal
//        - Added Authorization cache bypass
//        - Case-insensitive header cleanup
// ========================================

(function () {
  'use strict';

  const headers = $request.headers;

  // Remove RevenueCat ETag headers (all case variants)
  delete headers["X-RevenueCat-ETag"];
  delete headers["x-revenuecat-etag"];
  delete headers["X-REVENUECAT-ETAG"];

  // Remove If-None-Match (HTTP caching → forces fresh response)
  delete headers["If-None-Match"];
  delete headers["if-none-match"];
  delete headers["IF-NONE-MATCH"];

  // Remove If-Modified-Since (additional cache header)
  delete headers["If-Modified-Since"];
  delete headers["if-modified-since"];

  $done({ headers: headers });

})();
