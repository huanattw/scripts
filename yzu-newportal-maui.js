const LEGACY_PREFIX =
  "https://portalx.yzu.edu.tw/NewPortal/api/Auth/";

const MAUI_PREFIX =
  "https://portalx.yzu.edu.tw/NewPortalMaui/api/Auth/";

const MAUI_APP_ID = "MauiYzu20250930";
const MAUI_AUTHORIZATION =
  "Basic WXp1QXBwQ2FsbDohQCMkX1l6dUFwcF9JUzUyMDE=";

// 雙重保險：不是舊 NewPortal API 就完全不處理
if (!$request.url.startsWith(LEGACY_PREFIX)) {
  $done({});
} else {
  const url = $request.url.replace(LEGACY_PREFIX, MAUI_PREFIX);
  const headers = { ...$request.headers };

  setHeader(headers, "Content-Type", "application/x-www-form-urlencoded");
  setHeader(headers, "Accept", "application/json");
  setHeader(headers, "Authorization", MAUI_AUTHORIZATION);

  // 修改 body 後移除舊 Content-Length，讓 Surge 重新計算
  deleteHeader(headers, "Content-Length");

  let body = $request.body || "";

  const pathname = new URL(url).pathname;

  if (
    pathname.endsWith("/RSAkeybyAppID") ||
    pathname.endsWith("/UserAccessToken")
  ) {
    body = replaceFormValue(body, "AppID", MAUI_APP_ID);
  }

  // CheckUserToken 只改 URL/Header，Token body 保持不變
  $done({
    url,
    headers,
    body
  });
}

function replaceFormValue(body, key, value) {
  const encodedKey = encodeURIComponent(key);
  const encodedValue = encodeURIComponent(value);
  const pattern = new RegExp(`(^|&)${encodedKey}=[^&]*`);

  if (pattern.test(body)) {
    return body.replace(pattern, `$1${encodedKey}=${encodedValue}`);
  }

  return body
    ? `${body}&${encodedKey}=${encodedValue}`
    : `${encodedKey}=${encodedValue}`;
}

function setHeader(headers, name, value) {
  deleteHeader(headers, name);
  headers[name] = value;
}

function deleteHeader(headers, name) {
  const target = name.toLowerCase();

  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === target) {
      delete headers[key];
    }
  }
}