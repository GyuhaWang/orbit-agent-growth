# Orbit 배포

## GitHub Actions로 EC2에 배포

공개 이미지가 이미 `ghcr.io/gyuhawang/orbit-agent-growth:latest`에 게시되어 있습니다. GitHub 저장소 Settings → Secrets and variables → Actions에 다음 세 값을 등록한 뒤 `Deploy Orbit` 워크플로우를 수동 실행합니다.

- `ORBIT_DEPLOY_HOST`: Orbit을 실행할 서버의 공인 IP 또는 호스트명
- `ORBIT_DEPLOY_USER`: Docker 실행 권한이 있는 SSH 사용자
- `ORBIT_DEPLOY_SSH_KEY`: 위 사용자의 개인 키 전체 내용

워크플로우는 `orbit`이라는 별도 컨테이너와 `orbit_data` 볼륨만 생성합니다. 기본 포트는 `4173`이고, 배포 후 `http://HOST:4173/health`가 정상인지 확인합니다.

## Render로 배포

Render에서 `New → Blueprint`를 선택하고 이 저장소를 연결하면 [render.yaml](./render.yaml) 설정으로 바로 배포할 수 있습니다. 무료 플랜은 서비스가 절전될 수 있으므로 7일 모집 캠페인에서는 유료 웹 서비스나 별도 호스팅을 권장합니다.

## 도메인 연결

운영에서는 리버스 프록시에서 HTTPS 도메인을 `127.0.0.1:4173`으로 연결합니다. 가입 링크는 `https://도메인/?ref=채널명` 형식으로 만들어 채널별 전환을 측정합니다. 현재 앱에는 이메일 인증과 관리자 인증이 없으므로 공개 운영 전에는 이 두 기능을 추가해야 합니다.
