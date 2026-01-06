-- 更新 RLS 政策：所有人可查看和排序，但只能關閉自己的任務
-- 請在 Supabase SQL Editor 中執行此腳本

-- 步驟 1: 刪除舊的 RLS 政策
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
DROP POLICY IF EXISTS "Anyone can view all todos" ON todos;
DROP POLICY IF EXISTS "Anyone can update sort_order" ON todos;
DROP POLICY IF EXISTS "Users can update own completed" ON todos;
DROP POLICY IF EXISTS "Anyone can update sort_order, users can update own completed" ON todos;

-- 步驟 2: 建立輔助函數來檢查更新類型
-- 這個函數會檢查是否只更新了 sort_order（不更新 completed）
CREATE OR REPLACE FUNCTION check_sort_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果 completed 欄位被改變，且不是任務擁有者，則拒絕
  IF OLD.completed IS DISTINCT FROM NEW.completed THEN
    IF auth.uid() != OLD.user_id THEN
      RAISE EXCEPTION '只能更新自己的任務的完成狀態';
    END IF;
  END IF;
  
  -- 如果 content, category, user_id 被改變，拒絕（除非是擁有者且只更新 completed）
  IF OLD.content IS DISTINCT FROM NEW.content OR 
     OLD.category IS DISTINCT FROM NEW.category OR
     OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    IF auth.uid() != OLD.user_id THEN
      RAISE EXCEPTION '只能更新自己的任務';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 步驟 3: 建立觸發器
DROP TRIGGER IF EXISTS check_todo_update ON todos;
CREATE TRIGGER check_todo_update
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION check_sort_order_update();

-- 步驟 4: 建立新的 RLS 政策

-- 政策 1: 所有人可以查看所有任務
CREATE POLICY "Anyone can view all todos"
  ON todos FOR SELECT
  USING (true);

-- 政策 2: 用戶只能新增自己的任務
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 政策 3: 允許所有人更新（觸發器會處理詳細的權限檢查）
CREATE POLICY "Anyone can update todos"
  ON todos FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 政策 4: 用戶只能刪除自己的任務
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- 完成！現在：
-- ✅ 所有人可以看到所有任務
-- ✅ 所有人可以拖動排序（更新 sort_order）- 觸發器允許
-- ✅ 只有任務擁有者可以標記完成/未完成（更新 completed）- 觸發器檢查
-- ✅ 只有任務擁有者可以刪除任務
