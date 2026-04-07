// ========================================
// Locket Gold Premium - Enhanced Version
// ⚡ Performance: Fast & Smooth
// 🔐 Lifetime Premium Unlock - Full API v1 Spec
// 📅 Version: 2.0 (2026-04-08)
// 👤 Author: z3rokaze
// 🔄 Changelog:
//   v2.0 - Full RevenueCat API v1 response structure
//        - Added non_subscriptions for lifetime purchase
//        - Added management_url, first_seen, request_date
//        - Triple entitlements: Gold + pro + premium
//        - All 3 product IDs: yearly + monthly + lifetime
//        - original_application_version for store validation
// ========================================

(function () {
  "use strict";

  // ========= Constants ========= //
  const PURCHASE_DATE = "2024-01-01T00:00:00Z";
  const EXPIRES_DATE = "2099-12-31T23:59:59Z";
  const NOW = new Date().toISOString();

  // ========= Locket Product IDs ========= //
  const PRODUCTS = [
    "locket.premium.lifetime",
    "locket.premium.yearly",
    "locket.premium.monthly"
  ];

  // ========= Locket Entitlements ========= //
  const ENTITLEMENTS = ["Gold", "pro", "premium"];

  // ========= Parse Response ========= //
  let responseObj;
  try {
    responseObj = JSON.parse($response.body);
  } catch (e) {
    responseObj = {};
  }

  // ========= Ensure Full Structure (RevenueCat API v1) ========= //
  if (!responseObj.subscriber) responseObj.subscriber = {};
  const sub = responseObj.subscriber;

  if (!sub.subscriptions) sub.subscriptions = {};
  if (!sub.entitlements) sub.entitlements = {};
  if (!sub.non_subscriptions) sub.non_subscriptions = {};
  if (!sub.original_app_user_id) sub.original_app_user_id = "$RCAnonymousID:locket_gold";
  if (!sub.original_application_version) sub.original_application_version = "1.0";
  if (!sub.first_seen) sub.first_seen = PURCHASE_DATE;
  if (!sub.management_url) sub.management_url = "https://apps.apple.com/account/subscriptions";
  if (!sub.original_purchase_date) sub.original_purchase_date = PURCHASE_DATE;

  // Request-level fields
  responseObj.request_date = NOW;
  responseObj.request_date_ms = Date.now();

  // ========= Subscription Data ========= //
  const subscriptionData = {
    is_sandbox: false,
    ownership_type: "PURCHASED",
    billing_issues_detected_at: null,
    period_type: "normal",
    expires_date: EXPIRES_DATE,
    grace_period_expires_date: null,
    unsubscribe_detected_at: null,
    original_purchase_date: PURCHASE_DATE,
    purchase_date: PURCHASE_DATE,
    store: "app_store"
  };

  // ========= Apply All Products ========= //
  for (let i = 0; i < PRODUCTS.length; i++) {
    sub.subscriptions[PRODUCTS[i]] = Object.assign({}, subscriptionData, {
      product_plan_identifier: PRODUCTS[i]
    });
  }

  // ========= Apply All Entitlements ========= //
  const primaryProduct = PRODUCTS[0]; // lifetime
  for (let i = 0; i < ENTITLEMENTS.length; i++) {
    sub.entitlements[ENTITLEMENTS[i]] = {
      grace_period_expires_date: null,
      purchase_date: PURCHASE_DATE,
      product_identifier: primaryProduct,
      expires_date: EXPIRES_DATE
    };
  }

  // ========= Non-Subscription (Lifetime Purchase) ========= //
  sub.non_subscriptions["locket.premium.lifetime"] = [{
    id: "locket_lifetime_" + Date.now().toString(36),
    is_sandbox: false,
    purchase_date: PURCHASE_DATE,
    store: "app_store"
  }];

  // ========= Return Response ========= //
  $done({ body: JSON.stringify(responseObj) });
})();
