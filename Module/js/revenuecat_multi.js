// ========================================
// RevenueCat Multi-App Premium Unlocker
// ⚡ Performance: Ultra-Fast & Universal
// 🔐 Supports: Locket, VSCO, Mojo, HTTPBot, 1Blocker, Structured, Splice, Facetune
// 📅 Version: 3.0 (2026-04-08)
// 👤 Author: z3rokaze
// 🔄 Changelog:
//   v3.0 - Added non_subscriptions, management_url, first_seen, request_date
//        - Enhanced Locket Gold with lifetime + all entitlements
//        - Improved response structure to match RevenueCat API v1 spec
//        - Added original_application_version for store validation
//        - Better error handling with try-catch-finally
// ========================================

(function () {
  'use strict';

  // ========= Constants ========= //
  const PURCHASE_DATE = "2024-01-01T00:00:00Z";
  const EXPIRES_DATE = "2099-12-31T23:59:59Z";
  const NOW = new Date().toISOString();

  // ========= App Configurations (Updated 2026-04-08) ========= //
  const APP_CONFIGS = {
    'Locket': {
      entitlements: ['Gold', 'pro', 'premium'],
      products: ['locket.premium.yearly', 'locket.premium.monthly', 'locket.premium.lifetime'],
      lifetime: 'locket.premium.lifetime'
    },
    'VSCO': {
      entitlements: ['membership', 'plus'],
      products: ['VSCOANNUAL', 'VSCOCAM02BUALL', 'VSCOCAM02BULE0001', 'VSCOCAM02BUXXCC01']
    },
    'Mojo': {
      entitlements: ['pro'],
      products: ['revenuecat.pro.yearly']
    },
    'HTTPBot': {
      entitlements: ['rc_lifetime'],
      products: ['com.behindtechlines.HTTPBot.prounlock']
    },
    '1Blocker': {
      entitlements: ['premium'],
      products: ['blocker.ios.subscription.yearly']
    },
    'Structured': {
      entitlements: ['pro'],
      products: ['structured.pro.yearly']
    },
    'Splice': {
      entitlements: ['premium'],
      products: ['splice.subscription.yearly']
    },
    'Facetune': {
      entitlements: ['facetune.premium'],
      products: ['facetune.subscription.yearly']
    }
  };

  // ========= Get User-Agent ========= //
  const headers = $request.headers;
  const ua = headers["User-Agent"] || headers["user-agent"] || "";

  // ========= Parse Response ========= //
  let responseObj;
  try {
    responseObj = JSON.parse($response.body);
  } catch (e) {
    responseObj = {};
  }

  // ========= Ensure Full Structure (RevenueCat API v1 Spec) ========= //
  if (!responseObj.subscriber) responseObj.subscriber = {};
  const sub = responseObj.subscriber;
  if (!sub.subscriptions) sub.subscriptions = {};
  if (!sub.entitlements) sub.entitlements = {};
  if (!sub.non_subscriptions) sub.non_subscriptions = {};
  if (!sub.original_app_user_id) sub.original_app_user_id = "$RCAnonymousID:premium";
  if (!sub.original_application_version) sub.original_application_version = "1.0";
  if (!sub.first_seen) sub.first_seen = PURCHASE_DATE;
  if (!sub.management_url) sub.management_url = "https://apps.apple.com/account/subscriptions";
  if (!sub.original_purchase_date) sub.original_purchase_date = PURCHASE_DATE;

  // Add request-level fields
  responseObj.request_date = NOW;
  responseObj.request_date_ms = Date.now();

  // ========= Helper Functions ========= //
  const createSubscription = (productId) => ({
    is_sandbox: false,
    ownership_type: "PURCHASED",
    billing_issues_detected_at: null,
    period_type: "normal",
    expires_date: EXPIRES_DATE,
    grace_period_expires_date: null,
    unsubscribe_detected_at: null,
    original_purchase_date: PURCHASE_DATE,
    purchase_date: PURCHASE_DATE,
    store: "app_store",
    product_plan_identifier: productId
  });

  const createEntitlement = (productId) => ({
    grace_period_expires_date: null,
    purchase_date: PURCHASE_DATE,
    product_identifier: productId,
    expires_date: EXPIRES_DATE
  });

  const createNonSubscription = (productId) => [{
    id: "rc_" + Date.now().toString(36),
    is_sandbox: false,
    purchase_date: PURCHASE_DATE,
    store: "app_store",
    product_id: productId
  }];

  // ========= Apply Config ========= //
  const applyConfig = (config) => {
    // Add subscriptions
    config.products.forEach(pid => {
      sub.subscriptions[pid] = createSubscription(pid);
    });
    // Add entitlements
    const primaryProduct = config.products[0];
    config.entitlements.forEach(ent => {
      sub.entitlements[ent] = createEntitlement(primaryProduct);
    });
    // Add lifetime as non_subscription if applicable
    if (config.lifetime) {
      sub.non_subscriptions[config.lifetime] = createNonSubscription(config.lifetime);
    }
  };

  // ========= Detect App & Apply ========= //
  let detected = false;

  // Priority order: specific match first
  const appKeys = Object.keys(APP_CONFIGS);
  for (let i = 0; i < appKeys.length; i++) {
    const appName = appKeys[i];
    if (ua.includes(appName) || (appName === '1Blocker' && ua.includes('blocker')) || (appName === 'Mojo' && ua.includes('mojo'))) {
      applyConfig(APP_CONFIGS[appName]);
      detected = true;
      break;
    }
  }

  // Default fallback → Locket (most common use case)
  if (!detected) {
    applyConfig(APP_CONFIGS['Locket']);
  }

  $done({ body: JSON.stringify(responseObj) });

})();
