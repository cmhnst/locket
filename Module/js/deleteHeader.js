// ========================================
// RevenueCat ETag Header Remover
// 🔐 Remove ETag cache headers for RevenueCat
// 📅 Version: 5.2.0 (2026-04-13)
// 👤 Author: Nguyễn Ngọc Anh Tú (z3rokaze)
// ========================================

function setHeaderValue(e,a,d){var r=a.toLowerCase();r in e?e[r]=d:e[a]=d}var modifiedHeaders=$request.headers;setHeaderValue(modifiedHeaders,"X-RevenueCat-ETag",""),$done({headers:modifiedHeaders});
