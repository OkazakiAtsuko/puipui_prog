// 将来、スコアの保存/共有(DB連携)を実装する際にここから設定値を取り出す。
// 現状はどの値も未設定で構わない(1人プレイはDB不要)。.env.local は git 管理対象外。

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export const isDbConfigured = Boolean(firebaseConfig.projectId || apiBaseUrl)