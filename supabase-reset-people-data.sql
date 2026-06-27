-- Bondyの人物データを初期化します。
-- ログイン用のAuthユーザーは残し、アプリ内のプロフィール・つながり・追加企業候補を消します。

delete from public.connection_requests;
delete from public.profiles;
delete from public.companies;
