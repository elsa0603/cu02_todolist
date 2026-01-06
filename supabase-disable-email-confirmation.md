# 關閉電子郵件確認（開發環境）

如果您在開發環境中不想使用電子郵件確認功能，可以在 Supabase Dashboard 中關閉它：

## 步驟

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 前往 **Authentication** > **Settings**
4. 在 **Email Auth** 區塊中，找到 **"Enable email confirmations"** 選項
5. **取消勾選** 此選項
6. 點擊 **Save** 儲存設定

## 注意事項

- 關閉電子郵件確認後，新註冊的用戶將自動確認，無需點擊確認郵件
- 這僅建議用於開發環境，生產環境應保持啟用以確保安全性
- 現有的未確認用戶仍需要確認，或您可以在 Dashboard 中手動確認他們

## 手動確認用戶（可選）

如果您想手動確認現有用戶：

1. 前往 **Authentication** > **Users**
2. 找到要確認的用戶
3. 點擊用戶進入詳細頁面
4. 在 **Email Confirmed** 欄位中，點擊確認圖示

