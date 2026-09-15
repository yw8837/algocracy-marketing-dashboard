import { ArrowLeft, SearchX } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="not-found">
      <div className="not-found-mark"><SearchX size={24} /></div>
      <span>404</span>
      <h1>요청한 화면을 찾을 수 없습니다</h1>
      <p>주소를 다시 확인하거나 오늘의 운영 화면으로 돌아가세요.</p>
      <button onClick={() => setLocation("/")}><ArrowLeft size={16} /> 오늘의 운영으로</button>
    </main>
  );
}
