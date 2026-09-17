# Orbit — 7일 100명 런치

Orbit은 한 줄의 목표를 AI 에이전트 팀이 나눠 실행하는 서비스입니다. 랜딩 페이지에서 실제 베타 신청을 받고 추천 코드도 저장합니다.

## 실행

```bash
npm run dev
```

브라우저에서 `http://127.0.0.1:4173`을 엽니다. 공개 랜딩은 `/`, 운영 대시보드는 `/index.html`입니다.

`POST /api/signup`이 `data/waitlist.json`에 이름·이메일·추천 코드를 저장합니다. 같은 이메일은 중복 가입되지 않습니다.

에이전트 협업 API도 제공합니다. `POST /api/tasks`로 작업을 만들고, `GET /api/tasks`·`GET /api/agents`로 큐와 역할별 상태를 조회하며, `PATCH /api/tasks/:id`로 `queued`, `working`, `review`, `done`, `blocked` 상태를 갱신합니다. 외부 에이전트 연결 전에는 인증과 rate limit을 추가해야 합니다.

출시·운영 계획은 [LAUNCH_PLAN.md](./LAUNCH_PLAN.md), 컨테이너 배포는 [Dockerfile](./Dockerfile)을 참고하세요.

GitHub Actions를 이용한 격리 배포는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

`main`에 push하면 GitHub Actions가 `ghcr.io/<owner>/<repo>:latest` 이미지를 빌드·게시합니다.

현재는 데모 데이터와 브라우저 상호작용만 포함되어 있습니다. 실제 운영에는 인증, 서버 DB, 이메일/메시지 발송 동의, rate limit, 중복·봇 검증, 분석 이벤트 저장소를 연결해야 합니다.
