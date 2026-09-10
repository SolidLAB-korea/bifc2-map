# BIFC 주차 할인 등록

관리자가 차량번호 끝 4자리를 입력하면 젤룸파킹 화면에서 차량을 조회하고 `관리자할인`을 적용하는 로컬 웹앱입니다. 완료 기록이 있는 동일 4자리 번호는 다시 적용하지 않고 `이미 처리된 차량`으로 보여 줍니다.

## 실행

```powershell
cd parking-automation
npm install
npx playwright install chromium
Copy-Item .env.example .env
npm start
```

`.env`에 주차 사이트 URL과 관리자 계정을 넣은 뒤 `http://127.0.0.1:4310`을 엽니다. UI의 설정 화면으로 넣은 계정은 서버 재시작 전까지만 메모리에 존재하며 브라우저에는 저장되지 않습니다.

## 텔레그램 봇으로 운영하기

1. Telegram의 `@BotFather`에서 봇을 만들고 토큰을 발급합니다.
2. 봇을 사용할 개인 대화 또는 그룹에 추가합니다. 그룹이라면 BotFather에서 해당 봇의 **Group Privacy**를 꺼야 일반 차량번호 메시지를 받을 수 있습니다.
3. 봇이 있는 채팅방에서 `/start`를 한 번 보낸 뒤 `npm run telegram:discover`를 실행하여 채팅방 ID를 확인합니다.
4. `.env`에 토큰과 허용할 채팅방 ID를 넣고 실행합니다. 지정하지 않은 대화의 메시지는 무시합니다.

```ini
TELEGRAM_BOT_TOKEN=BotFather에서_발급한_토큰
TELEGRAM_ALLOWED_CHAT_IDS=-1001234567890
```

```powershell
npm run telegram
```

허용된 채팅방에 `869버6163`처럼 차량번호 전체를 보내면 봇이 끝 4자리로 할인 등록을 하고 완료·중복·실패 결과를 답합니다. 봇이 꺼져 있던 동안 도착한 메시지는 늦은 할인 처리를 방지하기 위해 자동으로 무시합니다.

## 상시 가동 배포

GitHub Actions는 실행 시간 제한이 있어 장기 폴링 봇을 상시 실행하는 용도로 적합하지 않습니다. 이 프로젝트에는 Playwright 브라우저가 포함된 Docker 웹 서비스 설정이 있습니다. 한 인스턴스에서 웹앱·API·텔레그램 봇을 함께 실행하고 할인 이력을 영구 디스크에 보관합니다.

1. GitHub에 이 폴더를 포함해 푸시합니다.
2. Render에서 **New + → Blueprint**를 선택하고 GitHub 저장소를 연결합니다.
3. Blueprint Path에 `parking-automation/render.yaml`을 입력합니다. 이 설정은 웹 서비스의 루트 디렉터리를 자동으로 `parking-automation`으로 지정합니다.
4. 아래 환경변수를 Render의 Environment 화면에 입력합니다. 비밀번호·토큰을 코드나 GitHub에 저장하지 마세요.

```ini
PARKING_SITE_URL=http://211.35.216.149:84
PARKING_ADMIN_ID=
PARKING_ADMIN_PASSWORD=
PARKING_HEADLESS=true
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_CHAT_IDS=
APP_ACCESS_TOKEN=충분히_긴_무작위_관리자_접속키
```

5. 배포가 성공하면 Render가 제공한 웹 주소를 열어 설정 화면에서 `APP_ACCESS_TOKEN`과 같은 관리자 접속 키를 입력합니다. 텔레그램에서 `/status`를 보내 응답을 확인합니다.
6. 상시 실행을 원하면 Render의 절전 없는 유료 Web Service 요금제를 선택하세요. 무료 웹 서비스는 유휴 상태에서 잠들 수 있습니다. 이후 GitHub `main` 브랜치에 푸시할 때마다 Render가 자동으로 새 버전을 배포합니다.

## 운영 전 확인

제공된 화면을 기준으로 `조회 → 차량 선택 → 확인 → 관리자할인 → 할인적용`을 자동화합니다. 대상 사이트가 사내망 또는 특정 IP 허용 환경에 있을 수 있으므로, 실제 사용할 PC에서 한 대의 테스트 차량으로 먼저 실행 결과를 확인하세요. 로그인 화면의 입력 요소가 일반 형식이 아니거나 버튼 텍스트가 다르면 `server.mjs`의 로그인 선택자를 해당 화면에 맞게 조정해야 합니다.
