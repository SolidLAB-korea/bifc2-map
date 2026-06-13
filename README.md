# BIFC2 상가 안내지도 웹앱

BIFC2 건물의 상가와 편의시설을 검색하고 층별 지도에서 위치를 확인할 수 있는 React 기반 웹앱입니다.

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

기본 비밀번호는 `bifc2-admin`입니다.

배포 전에 `.env` 파일을 만들고 아래 값을 원하는 비밀번호로 바꿔 빌드하세요.

```bash
VITE_ADMIN_PASSWORD=원하는_비밀번호
```

정적 프론트엔드 앱의 관리자 비밀번호는 완전한 서버 보안이 아닙니다. 현재 운영 방식은 로컬에서 데이터를 수정하고 Git으로 커밋/배포하는 흐름을 기준으로 합니다.

## 지도 이미지

층별 지도 이미지는 아래 위치에 넣으면 자동으로 사용됩니다.

- `public/maps/floor-1f.png`
- `public/maps/floor-2f.png`
- `public/maps/floor-3f.png`

## GitHub 업로드

```bash
git remote add origin https://github.com/사용자명/저장소명.git
git branch -M main
git push -u origin main
```
