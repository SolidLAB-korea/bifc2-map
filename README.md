# BIFC2 스퀘어가든 안내지도 웹앱

BIFC2 건물의 스퀘어가든과 편의시설을 검색하고 층별 지도에서 위치를 확인할 수 있는 React 기반 웹앱입니다.

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 관리자 모드

홈 화면의 `매장 데이터 관리` 영역은 관리자 비밀번호 입력 후 사용할 수 있습니다.

비밀번호는 github settings에서 설정 후 사용하시면 됩니다. 

정적 프론트엔드 앱의 관리자 비밀번호는 완전한 서버 보안이 아닙니다. Supabase 연결 후에는 관리자 메뉴에서 추가/수정/삭제한 매장 정보가 DB에 저장되어 모든 사용자에게 반영됩니다.

## Supabase DB 연결

1. Supabase 프로젝트를 만듭니다.
2. Supabase SQL Editor에서 `supabase/schema.sql` 내용을 실행합니다.
3. 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 입력합니다.

```bash
VITE_ADMIN_PASSWORD=원하는_관리자_비밀번호
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. 다시 빌드하고 GitHub에 배포합니다.

```bash
npm run build
```

환경변수가 없으면 앱은 기존처럼 브라우저 localStorage에 임시 저장합니다.

## 지도 이미지

층별 지도 이미지는 아래 위치에 넣으면 자동으로 사용됩니다.

- `public/maps/floor-1f.png`
- `public/maps/floor-2f.png`
- `public/maps/floor-3f.png`

## GitHub 업로드

```bash
git remote add origin https://github.com/SolidLAB-korea/bifc2-map.git
git branch -M main
git push -u origin main
```
