# 배포 기록

## GitHub

- 소유자: `yw8837`
- 저장소: `algocracy-marketing-dashboard`
- 설명: `Instagram·Threads 콘텐츠 캘린더, 성과 분석, SEO/AEO/GEO 및 자동화 운영 대시보드`
- 공개 범위: Public
- 자동 README·gitignore·license 생성: 사용 안 함
- 생성 요청일: 2026-09-15

로컬 소스는 `pnpm verify`로 데이터 집계, TypeScript 검사와 production build를 통과한 뒤 push한다.

저장소가 `https://github.com/yw8837/algocracy-marketing-dashboard`에 생성된 것을 확인했다. CLI 인증 토큰은 만료 상태이고 기존 SSH 키도 권한이 없어, 로그인된 GitHub 웹의 `/upload` 경로를 대체 업로드 수단으로 확인했다.

GitHub 웹 파일 입력에 전체 프로젝트 디렉터리를 직접 전달하는 방식은 커밋 단계에서 HTTP 400으로 실패했다. GitHub 웹 업로드는 디렉터리 직접 선택 대신 개별 파일 또는 하위 경로별 업로드가 필요하므로 해당 방식은 사용하지 않는다.
