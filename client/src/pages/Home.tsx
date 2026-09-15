import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Database,
  Download,
  ExternalLink,
  FileText,
  Github,
  Instagram,
  Link2,
  Menu,
  MessageCircle,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Upload,
  X,
  Zap,
} from "lucide-react";

type Kpi = {
  id: string;
  label: string;
  value: number | null;
  unit?: string;
  status: string;
  note: string;
};

type CalendarItem = {
  id: string;
  day: string;
  dateLabel: string;
  platform: string[];
  format: string;
  title: string;
  hook: string;
  objective: string;
  status: string;
  metric: string;
  cta: string;
  keywords: string[];
  whyDifferent: string;
  instagram: { slides: string[] };
  threads: { copy: string };
};

type Insight = {
  id: string;
  level: "주의" | "핵심" | "준비";
  title: string;
  evidence: string;
  analysis: string;
  solution: string;
  owner: string;
};

type DashboardData = {
  meta: {
    title: string;
    week: string;
    updatedAt: string;
    status: string;
    source: string;
  };
  kpis: Kpi[];
  calendar: CalendarItem[];
  insights: Insight[];
  decisionRules: Array<{ signal: string; diagnosis: string; action: string }>;
  automation: Array<{ name: string; status: string; cadence: string; description: string }>;
};

type View = "overview" | "calendar" | "performance" | "search" | "operations";

const navigation: Array<{ id: View; label: string; caption: string; icon: typeof BarChart3 }> = [
  { id: "overview", label: "오늘의 운영", caption: "우선순위와 진행 상태", icon: BarChart3 },
  { id: "calendar", label: "콘텐츠 캘린더", caption: "5일 원고와 승인", icon: CalendarDays },
  { id: "performance", label: "성과 분석", caption: "지표·진단·다음 조치", icon: Target },
  { id: "search", label: "검색 인사이트", caption: "SEO·AEO·GEO 준비도", icon: Search },
  { id: "operations", label: "자동화·운영", caption: "연결 상태와 품질 기준", icon: Settings2 },
];

const contentStatuses = ["기획 완료", "초안 작성", "검수 대기", "발행 완료"];

function loadRecord(key: string) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function formatValue(kpi: Kpi) {
  if (kpi.value === null) return "—";
  return `${kpi.value.toLocaleString("ko-KR")}${kpi.unit ?? ""}`;
}

function statusClass(status: string) {
  return status === "발행 완료" ? "done" : status === "검수 대기" ? "review" : status === "초안 작성" ? "draft" : "planned";
}

function PlatformBadge({ name }: { name: string }) {
  return (
    <span className="platform-badge">
      {name === "Instagram" ? <Instagram size={13} /> : <MessageCircle size={13} />}
      {name}
    </span>
  );
}

function PageHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </header>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState<CalendarItem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [metricEditorOpen, setMetricEditorOpen] = useState(false);
  const [metricValues, setMetricValues] = useState<Record<string, string>>(() => loadRecord("algocracy.metrics"));
  const [statusById, setStatusById] = useState<Record<string, string>>(() => loadRecord("algocracy.statuses"));
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/dashboard.json`)
      .then((response) => {
        if (!response.ok) throw new Error("대시보드 데이터를 불러오지 못했습니다.");
        return response.json();
      })
      .then((payload: DashboardData) => {
        setData(payload);
        setSelected(payload.calendar[0] ?? null);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMetricEditorOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const visibleKpis = useMemo(() => (data?.kpis ?? []).map((kpi) => {
    const raw = metricValues[kpi.id];
    if (raw === undefined || raw === "") return kpi;
    return { ...kpi, value: Number(raw), status: "수동 입력", note: "현재 브라우저에 저장됨" };
  }), [data, metricValues]);

  const pipeline = useMemo(() => {
    const counts = Object.fromEntries(contentStatuses.map((status) => [status, 0])) as Record<string, number>;
    (data?.calendar ?? []).forEach((item) => {
      const status = statusById[item.id] ?? item.status;
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return counts;
  }, [data, statusById]);

  const nextContent = useMemo(() => (data?.calendar ?? []).find((item) => (statusById[item.id] ?? item.status) !== "발행 완료") ?? data?.calendar[0] ?? null, [data, statusById]);
  const recordedMetricCount = visibleKpis.filter((kpi) => kpi.value !== null).length;
  const publishedCount = data?.calendar.filter((item) => (statusById[item.id] ?? item.status) === "발행 완료").length ?? 0;

  const changeView = (next: View) => {
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateContentStatus = (id: string, status: string) => {
    const next = { ...statusById, [id]: status };
    setStatusById(next);
    localStorage.setItem("algocracy.statuses", JSON.stringify(next));
  };

  const saveMetrics = () => {
    localStorage.setItem("algocracy.metrics", JSON.stringify(metricValues));
    setMetricEditorOpen(false);
  };

  const exportPerformanceCsv = () => {
    if (!data) return;
    const recordedAt = new Date().toISOString();
    const header = "metric,value,recorded_at\n";
    const rows = data.kpis.map((kpi) => `${kpi.id},${metricValues[kpi.id] ?? ""},${recordedAt}`).join("\n");
    const url = URL.createObjectURL(new Blob([header + rows + "\n"], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `algocracy-performance-${recordedAt.slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPerformanceCsv = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = { ...metricValues };
      String(reader.result ?? "").split(/\r?\n/).slice(1).forEach((line) => {
        const [metric, value] = line.split(",");
        if (metric && value !== undefined && value.trim() !== "") next[metric.trim()] = value.trim();
      });
      setMetricValues(next);
      localStorage.setItem("algocracy.metrics", JSON.stringify(next));
    };
    reader.readAsText(file, "utf-8");
  };

  if (!data) {
    return <main className="boot-screen"><img src={`${import.meta.env.BASE_URL}brand/algocracy.png`} alt="알고크라시" /><p>운영 현황을 불러오는 중입니다.</p></main>;
  }

  const currentNav = navigation.find((item) => item.id === view)!;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand-block">
          <img src={`${import.meta.env.BASE_URL}brand/algocracy.png`} alt="알고크라시 로고" />
          <div><strong>Algocracy</strong><span>Marketing Operations</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기"><X size={19} /></button>
        </div>

        <div className="workspace-block">
          <span>WORKSPACE</span>
          <strong>@world.needs.u</strong>
          <p>Instagram · Threads</p>
        </div>

        <nav aria-label="주요 화면">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => changeView(item.id)}>
                <Icon size={17} />
                <span><b>{item.label}</b><small>{item.caption}</small></span>
                {item.id === "calendar" && <em>{data.calendar.length}</em>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-status">
          <ShieldCheck size={16} />
          <p><b>데이터 원칙</b><br />확인하지 않은 수치는 비워둡니다.</p>
        </div>
        <a className="repo-link" href="https://github.com/yw8837/algocracy-marketing-dashboard" target="_blank" rel="noreferrer"><Github size={16} /> 저장소 <ArrowRight size={14} /></a>
      </aside>
      {menuOpen && <button className="menu-scrim" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기" />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기"><Menu size={20} /></button>
          <div className="breadcrumb"><span>MARKETING OPERATIONS</span><strong>{currentNav.label}</strong></div>
          <div className="top-actions">
            <span className="updated-at">{data.meta.updatedAt}</span>
            <a href="https://www.instagram.com/world.needs.u/" target="_blank" rel="noreferrer" title="Instagram 열기"><Instagram size={17} /></a>
            <a href="https://www.threads.com/@world.needs.u" target="_blank" rel="noreferrer" title="Threads 열기"><MessageCircle size={17} /></a>
            <button className="primary-action compact" onClick={() => setMetricEditorOpen(true)}><FileText size={15} /> 성과 입력</button>
          </div>
        </header>

        <div className="content">
          {view === "overview" && (
            <>
              <PageHeading eyebrow="WEEK 01 · BASELINE" title="오늘의 운영" copy="발행할 콘텐츠와 빠진 기록부터 확인합니다." action={<button className="secondary-action" onClick={() => changeView("calendar")}><CalendarDays size={16} /> 5일 일정</button>} />

              <section className="alert-strip">
                <div><AlertTriangle size={18} /><div><b>{recordedMetricCount ? "성과 기록을 이어서 입력하세요" : "아직 성과 기준선이 없습니다"}</b><p>{recordedMetricCount ? `${recordedMetricCount}개 지표가 입력됐습니다. 게시물별 24시간·72시간·7일 기록을 유지하세요.` : "첫 게시 후 플랫폼 인사이트에서 확인한 값만 입력하세요."}</p></div></div>
                <button onClick={() => setMetricEditorOpen(true)}>성과 입력 <ChevronRight size={15} /></button>
              </section>

              <section className="metrics" aria-label="핵심 지표">
                {visibleKpis.map((kpi) => <article className="metric" key={kpi.id}><div><span>{kpi.label}</span><strong>{formatValue(kpi)}</strong><small>{kpi.note}</small></div><em className={kpi.value === null ? "pending" : "recorded"}>{kpi.status}</em></article>)}
              </section>

              <div className="overview-layout">
                <section className="work-panel">
                  <div className="section-title"><div><span className="eyebrow">THIS WEEK</span><h2>콘텐츠 진행 현황</h2></div><button onClick={() => changeView("calendar")}>전체 보기 <ChevronRight size={14} /></button></div>
                  <div className="pipeline-strip">{contentStatuses.map((status) => <div key={status}><span className={`status-dot ${statusClass(status)}`} /><p>{status}</p><strong>{pipeline[status]}</strong></div>)}</div>
                  <div className="week-list">
                    {data.calendar.map((item) => {
                      const status = statusById[item.id] ?? item.status;
                      return <button key={item.id} onClick={() => { setSelected(item); changeView("calendar"); }}><span className="day-cell">{item.day}</span><div><b>{item.title}</b><small>{item.format} · {item.platform.join(" + ")}</small></div><em className={`status-tag ${statusClass(status)}`}>{status}</em><ChevronRight size={16} /></button>;
                    })}
                  </div>
                </section>

                <aside className="side-stack">
                  <section className="side-panel next-content">
                    <div className="section-title"><div><span className="eyebrow">NEXT</span><h2>다음 콘텐츠</h2></div><Clock3 size={17} /></div>
                    {nextContent ? <><span className="content-format">{nextContent.day}요일 · {nextContent.format}</span><h3>{nextContent.title}</h3><p>“{nextContent.hook}”</p><div className="mini-meta"><span>판단 지표</span><b>{nextContent.metric}</b></div><button onClick={() => { setSelected(nextContent); changeView("calendar"); }}>원고 확인</button></> : <p>모든 콘텐츠가 발행 완료 상태입니다.</p>}
                  </section>
                  <section className="side-panel">
                    <div className="section-title"><div><span className="eyebrow">CHANNEL RULE</span><h2>채널 역할</h2></div><CheckCircle2 size={17} /></div>
                    <dl className="channel-rules"><div><dt><Instagram size={15} /> Instagram</dt><dd>저장할 수 있는 도구와 체크리스트</dd></div><div><dt><MessageCircle size={15} /> Threads</dt><dd>한 줄로 답할 수 있는 질문과 대화</dd></div></dl>
                  </section>
                </aside>
              </div>
            </>
          )}

          {view === "calendar" && (
            <>
              <PageHeading eyebrow="CONTENT CALENDAR" title="콘텐츠 캘린더" copy="중복 없는 5개 주제의 원고와 진행 상태를 관리합니다." action={<button className="secondary-action" onClick={() => setMetricEditorOpen(true)}><FileText size={16} /> 성과 입력</button>} />
              <div className="calendar-layout">
                <section className="calendar-list" aria-label="콘텐츠 목록">
                  {data.calendar.map((item, index) => {
                    const status = statusById[item.id] ?? item.status;
                    return <button key={item.id} className={selected?.id === item.id ? "selected" : ""} onClick={() => setSelected(item)}><div className="date-cell"><span>0{index + 1}</span><b>{item.day}</b></div><div className="calendar-copy"><div><em className={`status-tag ${statusClass(status)}`}>{status}</em><small>{item.format}</small></div><h3>{item.title}</h3><p>{item.hook}</p><div>{item.platform.map((name) => <PlatformBadge key={name} name={name} />)}</div></div><ChevronRight size={18} /></button>;
                  })}
                </section>
                {selected && <article className="content-detail">
                  <div className="detail-head"><div><span>{selected.day}요일 · {selected.format}</span><h2>{selected.title}</h2></div><em className={`status-tag ${statusClass(statusById[selected.id] ?? selected.status)}`}>{statusById[selected.id] ?? selected.status}</em></div>
                  <div className="hook-box"><small>HOOK</small><strong>{selected.hook}</strong></div>
                  <section className="script-section"><h3><Instagram size={15} /> Instagram</h3><ol>{selected.instagram.slides.map((slide, index) => <li key={slide}><span>{index + 1}</span><p>{slide}</p></li>)}</ol></section>
                  <section className="script-section"><h3><MessageCircle size={15} /> Threads</h3><blockquote>{selected.threads.copy}</blockquote></section>
                  <div className="detail-grid"><div><span>CTA</span><b>{selected.cta}</b></div><div><span>판단 지표</span><b>{selected.metric}</b></div></div>
                  <div className="keyword-row">{selected.keywords.map((keyword) => <span key={keyword}>#{keyword}</span>)}</div>
                  <div className="status-editor"><span>진행 상태</span><div>{contentStatuses.map((status) => <button key={status} className={(statusById[selected.id] ?? selected.status) === status ? "active" : ""} onClick={() => updateContentStatus(selected.id, status)}><Check size={12} />{status}</button>)}</div></div>
                  <div className="evidence-note"><ShieldCheck size={16} /><p><b>중복 방지</b>{selected.whyDifferent}</p></div>
                </article>}
              </div>
            </>
          )}

          {view === "performance" && (
            <>
              <PageHeading eyebrow="PERFORMANCE" title="성과 분석" copy="조회수보다 저장·공유·문의 흐름을 먼저 봅니다." action={<div className="heading-actions"><button className="secondary-action" onClick={() => importInput.current?.click()}><Upload size={15} /> CSV 불러오기</button><button className="primary-action" onClick={() => setMetricEditorOpen(true)}><FileText size={15} /> 성과 입력</button></div>} />
              <input ref={importInput} hidden type="file" accept=".csv,text/csv" onChange={(event) => importPerformanceCsv(event.target.files?.[0])} />
              <section className="metrics performance-metrics">{visibleKpis.map((kpi) => <article className="metric" key={kpi.id}><div><span>{kpi.label}</span><strong>{formatValue(kpi)}</strong><small>{kpi.note}</small></div><em className={kpi.value === null ? "pending" : "recorded"}>{kpi.status}</em></article>)}</section>
              {recordedMetricCount === 0 && <section className="empty-state"><Database size={24} /><div><h2>분석할 실적이 아직 없습니다</h2><p>첫 게시 후 24시간 값을 입력하면 이 화면을 기준선으로 사용할 수 있습니다. 예시 숫자는 넣지 않았습니다.</p></div><button onClick={() => setMetricEditorOpen(true)}>첫 기록 시작</button></section>}
              <section className="analysis-table">
                <div className="section-title"><div><span className="eyebrow">EVIDENCE → ACTION</span><h2>현재 진단과 조치</h2></div><span className="data-note">프로젝트 폴더 점검 기준</span></div>
                <div className="analysis-head"><span>진단</span><span>근거</span><span>해석</span><span>이번 주 조치</span></div>
                {data.insights.map((insight) => <article key={insight.id}><div><em className={`severity ${insight.level}`}>{insight.level}</em><b>{insight.title}</b></div><p>{insight.evidence}</p><p>{insight.analysis}</p><p className="action-copy">{insight.solution}<small>담당 · {insight.owner}</small></p></article>)}
              </section>
              <section className="decision-panel"><div className="section-title"><div><span className="eyebrow">DECISION RULES</span><h2>성과 신호별 다음 행동</h2></div><Target size={18} /></div>{data.decisionRules.map((rule) => <div className="decision-row" key={rule.signal}><b>{rule.signal}</b><p>{rule.diagnosis}</p><p>{rule.action}</p></div>)}</section>
            </>
          )}

          {view === "search" && (
            <>
              <PageHeading eyebrow="SEO · AEO · GEO" title="검색 콘텐츠 준비도" copy="키워드가 아니라 질문과 근거까지 준비됐는지 확인합니다." />
              <section className="source-notice"><Search size={19} /><div><b>검색량·순위 데이터 소스 연결 전</b><p>GSC, GA4, Similarweb, Ahrefs, Semrush 또는 DataForSEO가 연결되기 전에는 검색량과 트래픽을 표시하지 않습니다.</p></div><span>연결 필요</span></section>
              <div className="search-summary"><article><span>SEO</span><strong>{data.calendar.length}</strong><p>주제별 키워드 묶음 준비</p></article><article><span>AEO</span><strong>{data.calendar.filter((item) => `${item.title} ${item.hook}`.includes("?") || `${item.title} ${item.hook}`.includes("무엇") || `${item.title} ${item.hook}`.includes("왜")).length}</strong><p>질문·답변형 제목 적용</p></article><article><span>GEO</span><strong>0</strong><p>외부 출처 연결 완료 항목</p></article></div>
              <section className="keyword-table">
                <div className="section-title"><div><span className="eyebrow">QUERY MAP</span><h2>5일 키워드·답변 구조</h2></div><span className="data-note">검색량 미수집</span></div>
                <div className="keyword-head"><span>콘텐츠</span><span>검색어 묶음</span><span>답변 구조</span><span>근거 상태</span></div>
                {data.calendar.map((item) => <article key={item.id}><div><b>{item.title}</b><small>{item.format}</small></div><div className="keyword-chips">{item.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div><p>{`${item.title} ${item.hook}`.includes("?") ? "질문 → 짧은 답 → 체크" : "결론 → 기준 → 실행"}</p><em className="source-missing">출처 보강</em></article>)}
              </section>
              <section className="search-guidance"><div><h2>콘텐츠 발행 전 확인</h2><p>검색 노출을 위해 문장을 늘리지 않습니다. 제목에는 대상과 문제를 넣고, 본문 첫 두 문장 안에 답을 둡니다.</p></div><ul><li><CheckCircle2 size={15} /> 제목에 실제 검색어 1개</li><li><CheckCircle2 size={15} /> 첫 문장에 결론 또는 질문</li><li><AlertTriangle size={15} /> 수치·제도·절차에는 출처와 확인일</li><li><CheckCircle2 size={15} /> 해시태그는 최대 3개</li></ul></section>
            </>
          )}

          {view === "operations" && (
            <>
              <PageHeading eyebrow="OPERATIONS" title="자동화·운영" copy="연결된 기능과 아직 사람 확인이 필요한 일을 구분합니다." action={<button className="secondary-action" onClick={() => window.location.reload()}><RefreshCw size={15} /> 새로고침</button>} />
              <section className="automation-list">{data.automation.map((item, index) => <article key={item.name}><div className="automation-icon">{index === 0 ? <CheckCircle2 /> : index === 1 ? <FileText /> : index === 2 ? <RefreshCw /> : <Link2 />}</div><div><span>{item.status}</span><h2>{item.name}</h2><p>{item.description}</p></div><small>{item.cadence}</small></article>)}</section>
              <div className="operations-grid">
                <section className="routine-panel"><div className="section-title"><div><span className="eyebrow">WEEKLY ROUTINE</span><h2>매주 같은 순서로 운영</h2></div><Zap size={18} /></div>{["원고·이미지·링크 검수", "게시 URL과 발행 시각 기록", "24h · 72h · 7d 성과 입력", "금요일에 다음 주 조치 확정"].map((step, index) => <div className="routine-row" key={step}><span>0{index + 1}</span><p>{step}</p></div>)}</section>
                <section className="slo-panel"><div className="section-title"><div><span className="eyebrow">OPERATING SLO</span><h2>운영 품질 목표</h2></div><ShieldCheck size={18} /></div><div className="slo-row"><div><b>성과 입력 적시성</b><p>발행 콘텐츠의 24시간 지표를 30시간 안에 기록</p></div><strong>95% 목표</strong><em>측정 전</em></div><div className="slo-row"><div><b>데이터 최신성</b><p>대시보드의 마지막 기록이 7일을 넘지 않음</p></div><strong>7일 이내</strong><em>측정 전</em></div><div className="slo-row"><div><b>출처 누락</b><p>수치·제도·절차 콘텐츠의 출처 미표기</p></div><strong>0건 목표</strong><em>검수 필요</em></div></section>
              </div>
              <section className="integration-panel"><div><span className="eyebrow">DATA SOURCES</span><h2>연결 상태</h2></div>{["Instagram Insights", "Threads Insights", "Google Search Console", "GA4"].map((source) => <div key={source}><Database size={15} /><span>{source}</span><em>연결 전</em></div>)}</section>
            </>
          )}
        </div>
      </main>

      {metricEditorOpen && <div className="modal-layer" role="dialog" aria-modal="true" aria-label="성과 입력"><button className="modal-scrim" onClick={() => setMetricEditorOpen(false)} aria-label="닫기" /><section className="metric-modal"><header><div><span className="eyebrow">PERFORMANCE LOG</span><h2>오늘 확인한 수치</h2><p>플랫폼 인사이트에서 확인한 값만 입력하세요.</p></div><button onClick={() => setMetricEditorOpen(false)} aria-label="닫기"><X size={19} /></button></header><div className="metric-fields">{data.kpis.map((kpi) => <label key={kpi.id}><span>{kpi.label}</span><input type="number" min="0" inputMode="numeric" value={metricValues[kpi.id] ?? ""} onChange={(event) => setMetricValues((current) => ({ ...current, [kpi.id]: event.target.value }))} placeholder="미수집" /></label>)}</div><div className="form-notice"><AlertTriangle size={16} /><p>수집하지 못한 값은 빈칸으로 두세요. Instagram과 Threads 조회수는 합산하지 않습니다.</p></div><footer><button className="secondary-action" onClick={exportPerformanceCsv}><Download size={15} /> CSV 내보내기</button><button className="primary-action" onClick={saveMetrics}>저장하기</button></footer></section></div>}
    </div>
  );
}
