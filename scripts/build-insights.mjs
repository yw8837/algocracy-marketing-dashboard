import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "data", "performance.csv");
const target = path.join(root, "client", "public", "data", "insights.json");

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

const raw = fs.readFileSync(source, "utf8").trimEnd();
const lines = raw.split(/\r?\n/).filter(Boolean);
const headers = splitCsvLine(lines[0] ?? "");
const rows = lines.slice(1).map((line) => {
  const values = splitCsvLine(line);
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
});

const metricKeys = ["views", "reach", "saves", "shares", "comments", "profile_visits", "link_clicks", "inquiries"];
const numeric = (value) => (value === "" || value == null ? null : Number(value));
const validRows = rows.filter((row) => row.content_id && row.platform && row.published_at);

if (validRows.length === 0) {
  const empty = {
    generatedAt: new Date().toISOString(),
    status: "empty",
    message: "아직 발행된 콘텐츠 성과 데이터가 없습니다.",
    records: 0,
    totals: Object.fromEntries(metricKeys.map((key) => [key === "profile_visits" ? "profileVisits" : key === "link_clicks" ? "linkClicks" : key, null])),
    winner: null,
    recommendations: [
      "게시 후 24시간·72시간·7일 값을 data/performance.csv에 기록하세요.",
      "수집하지 않은 값은 0이 아니라 빈칸으로 두세요."
    ]
  };
  fs.writeFileSync(target, `${JSON.stringify(empty, null, 2)}\n`);
  console.log("No performance rows. Empty insight state preserved.");
  process.exit(0);
}

const totals = Object.fromEntries(metricKeys.map((key) => [key, validRows.reduce((sum, row) => sum + (numeric(row[key]) ?? 0), 0)]));
const scored = validRows.map((row) => {
  const reach = numeric(row.reach);
  const saves = numeric(row.saves);
  const shares = numeric(row.shares);
  const saveRate = reach && saves != null ? saves / reach : null;
  const shareRate = reach && shares != null ? shares / reach : null;
  return { ...row, saveRate, shareRate, score: (saveRate ?? 0) + (shareRate ?? 0) };
});
const winner = [...scored].sort((a, b) => b.score - a.score)[0] ?? null;

const result = {
  generatedAt: new Date().toISOString(),
  status: "ready",
  message: `${validRows.length}개 기록을 집계했습니다.`,
  records: validRows.length,
  totals: {
    views: totals.views,
    reach: totals.reach,
    saves: totals.saves,
    shares: totals.shares,
    profileVisits: totals.profile_visits,
    linkClicks: totals.link_clicks,
    inquiries: totals.inquiries
  },
  winner: winner ? {
    contentId: winner.content_id,
    platform: winner.platform,
    checkpointHours: Number(winner.checkpoint_hours || 0),
    saveRate: winner.saveRate,
    shareRate: winner.shareRate
  } : null,
  recommendations: [
    "도달보다 저장률·공유율을 먼저 비교하세요.",
    "Instagram과 Threads의 조회수는 합산하지 마세요.",
    "클릭을 문의나 결제로 간주하지 마세요."
  ]
};

fs.writeFileSync(target, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Built insights from ${validRows.length} performance rows.`);
