import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initializeData } from "./data";
import { loadRuntimeIndex } from "./dataRepository";
import "./styles.css";
import { applyTheme } from "./theme";

applyTheme(document.documentElement);

const root = createRoot(document.getElementById("root")!);

async function start() {
  const runtimeIndex = await loadRuntimeIndex();
  initializeData(runtimeIndex);
  const { default: App } = await import("./App");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start().catch(() => {
  root.render(
    <main className="app-shell">
      <div className="map map-loading" role="alert">历史数据载入失败，请刷新后重试。</div>
    </main>,
  );
});
