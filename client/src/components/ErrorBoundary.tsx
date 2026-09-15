import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="not-found">
        <div className="not-found-mark"><AlertTriangle size={24} /></div>
        <span>APPLICATION ERROR</span>
        <h1>화면을 불러오지 못했습니다</h1>
        <p>입력한 데이터는 브라우저에 남아 있습니다. 페이지를 다시 불러와 주세요.</p>
        <button onClick={() => window.location.reload()}><RotateCcw size={16} /> 다시 불러오기</button>
      </main>
    );
  }
}
