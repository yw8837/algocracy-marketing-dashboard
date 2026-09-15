# Algocracy Marketing Operations

`@world.needs.u` Instagram·Threads 운영을 위한 독립형 마케팅 대시보드입니다. **오늘 발행할 콘텐츠, 5일 원고, 성과 기록, 원인 분석, SEO·AEO·GEO 준비도, 자동화 상태**를 화면별로 나눠 관리합니다.

## 현재 동작하는 기능

- 5일 콘텐츠 원고와 채널별 카피 확인
- 콘텐츠 진행 상태 변경과 브라우저 저장
- 실제 지표 입력과 CSV 내보내기·불러오기
- 증거 → 해석 → 이번 주 조치 형태의 성과 진단
- SEO·AEO·GEO 콘텐츠 준비도와 출처 누락 표시
- Instagram·Threads·GSC·GA4 연결 상태 표시
- GitHub push 검증, 주간 집계, Pages 배포 워크플로
- Docker 실행, 운영 데이터 백업·복구

수집하지 않은 숫자는 `0`으로 처리하지 않고 `수집 전`으로 표시합니다. Instagram과 Threads 조회수는 합산하지 않으며 클릭을 문의로 간주하지 않습니다.

## 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 검증과 빌드

```bash
node scripts/build-insights.mjs
pnpm check
pnpm build
```

production 실행:

```bash
pnpm start
```

## Docker

```bash
cp ENVIRONMENT.example .env
docker build -t algocracy-marketing-dashboard .
docker run --rm -p 3000:3000 --env-file .env algocracy-marketing-dashboard
```

## 운영 데이터

| 목적 | 파일 |
|---|---|
| 5일 콘텐츠·진단·운영 상태 | `client/public/data/dashboard.json` |
| 콘텐츠 운영표 | `data/content-calendar.csv` |
| 장기 보관 성과 기록 | `data/performance.csv` |
| 주간 집계 결과 | `client/public/data/insights.json` |
| 집계 로직 | `scripts/build-insights.mjs` |
| 운영자 사용법 | `docs/OPERATIONS_GUIDE.md` |
| 제품 단계별 확장 | `docs/ROADMAP.md` |
| 디자인 기준 | `docs/DESIGN_SYSTEM.md` |

화면에서 입력한 성과와 콘텐츠 상태는 현재 브라우저의 `localStorage`에 보관됩니다. 팀 공유가 필요하면 CSV로 내려받아 `data/performance.csv`에 통합하고, 다음 단계에서 로그인·데이터베이스를 연결합니다.

## 백업과 복구

```bash
chmod +x scripts/backup.sh scripts/restore.sh
./scripts/backup.sh
./scripts/restore.sh backups/algocracy-marketing-YYYYMMDDTHHMMSSZ.tar.gz
```

## 배포

GitHub Pages는 `.github/workflows/deploy-pages.yml`을 사용합니다. 일반 서버는 Dockerfile을 사용합니다. Vercel·Netlify·Cloudflare Pages에서는 `pnpm build` 후 `dist/public`을 정적 산출물로 배포할 수 있습니다.

## 아직 연결이 필요한 기능

Instagram·Threads 자동 수집, Google Search Console, GA4, Similarweb/Ahrefs/Semrush/DataForSEO는 계정 권한과 데이터 소스 선택이 필요합니다. 연결 전에는 대시보드가 수치를 만들지 않고 `연결 전` 상태로 유지됩니다.
