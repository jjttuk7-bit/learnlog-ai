-- 전체 앱 soft delete 지원
ALTER TABLE captures ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE diary_entries ADD COLUMN deleted_at TIMESTAMPTZ;
