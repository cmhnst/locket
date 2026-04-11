// ========================================
// Locket Gold - Firestore Response Modifier
// ⚡ Performance: Fast & Smooth
// 🔐 Intercept Firestore user document to inject Gold status
// 📅 Version: 1.0 (2026-04-11)
// 👤 Author: z3rokaze
// 🔄 Changelog:
//   v1.0 - Initial: Inject Gold/premium flags into Firestore user doc
//        - Handles both REST and gRPC-web JSON responses
//        - Sets is_gold, is_premium, subscription_tier fields
// ========================================

(function () {
  "use strict";

  let responseObj;
  try {
    responseObj = JSON.parse($response.body);
  } catch (e) {
    // If response is not JSON (binary protobuf), pass through
    $done({});
    return;
  }

  // ========= Inject Gold Flags ========= //
  const goldFields = {
    "is_gold": true,
    "is_premium": true,
    "premium": true,
    "gold": true,
    "subscription_tier": "gold",
    "subscription_status": "active",
    "subscription_type": "lifetime",
    "has_premium": true,
    "has_gold": true,
    "premium_type": "gold",
    "entitlement": "gold",
    "premium_expiry": "2099-12-31T23:59:59Z",
    "premium_expires_at": "2099-12-31T23:59:59Z"
  };

  // ========= Deep Inject Helper ========= //
  const injectGold = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;

    // Inject gold flags at current level
    Object.keys(goldFields).forEach(key => {
      // Only set if field exists or we're at a user/account level document
      if (obj.hasOwnProperty(key)) {
        obj[key] = goldFields[key];
      }
    });

    // Check for Firestore document "fields" structure
    if (obj.fields) {
      // Firestore REST API format: { fields: { fieldName: { booleanValue: true } } }
      const firestoreGoldFields = {
        "is_gold": { booleanValue: true },
        "is_premium": { booleanValue: true },
        "premium": { booleanValue: true },
        "gold": { booleanValue: true },
        "has_premium": { booleanValue: true },
        "has_gold": { booleanValue: true },
        "subscription_tier": { stringValue: "gold" },
        "subscription_status": { stringValue: "active" },
        "subscription_type": { stringValue: "lifetime" },
        "premium_type": { stringValue: "gold" },
        "entitlement": { stringValue: "gold" },
        "premium_expiry": { stringValue: "2099-12-31T23:59:59Z" },
        "premium_expires_at": { stringValue: "2099-12-31T23:59:59Z" }
      };

      Object.keys(firestoreGoldFields).forEach(key => {
        if (obj.fields.hasOwnProperty(key)) {
          obj.fields[key] = firestoreGoldFields[key];
        }
      });

      // Also force-add essential gold fields even if not present
      obj.fields["is_gold"] = { booleanValue: true };
      obj.fields["is_premium"] = { booleanValue: true };
      obj.fields["gold"] = { booleanValue: true };
      obj.fields["premium"] = { booleanValue: true };
      obj.fields["subscription_tier"] = { stringValue: "gold" };
      obj.fields["subscription_status"] = { stringValue: "active" };
    }

    // Recurse into nested objects and arrays
    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => injectGold(item));
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        obj[key] = injectGold(obj[key]);
      }
    });

    return obj;
  };

  // ========= Apply Gold Injection ========= //
  responseObj = injectGold(responseObj);

  // ========= Return Response ========= //
  $done({ body: JSON.stringify(responseObj) });
})();
