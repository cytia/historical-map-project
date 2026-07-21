import { useEffect, useRef } from "react";
import { PROJECT_LINKS } from "./projectLinks";

interface ProjectPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectPanel({ isOpen, onClose }: ProjectPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="project-panel-backdrop"
          aria-label="关闭关于项目面板"
          onClick={onClose}
        />
      )}
      <aside
        className={`project-panel ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-panel-title"
        aria-hidden={!isOpen}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="panel-close"
          aria-label="关闭关于项目面板"
          onClick={onClose}
        >
          ×
        </button>
        <div className="panel-scrollbar">
          <p className="eyebrow">关于项目</p>
          <h2 id="project-panel-title">历史地图计划</h2>
          <p className="project-intro">
            历史地图计划是一个面向公众与历史爱好者的开源历史地图项目，致力于用可浏览、可查询的地图呈现中国不同历史时期的政区、地点、自然地理与历史事件。
          </p>

          <section className="project-section">
            <h3>当前进度</h3>
            <p>
              首版以公元 1600 年前后为基准，已接入府州县历史地点浏览、地名搜索、代表性时间节点与军事资料入口。
            </p>
            <p>
              项目正在持续完善历史资料、边界内容和更多历史时期。
            </p>
          </section>

          <section className="project-section">
            <h3>支持方式</h3>
            <p>
              历史点位坐标的校验、资料核对、功能开发与版本维护，都需要长期投入。
            </p>
            <p>
              如果项目对你有所帮助，欢迎在 GitHub 点亮一颗 Star，这是对独立开发者最直接、最有力的鼓励，也能帮助更多人发现这款工具。你也可以通过爱发电支持项目的后续开发与维护。
            </p>
          </section>

          <div className="project-panel-actions">
            <a
              className="project-action"
              href={PROJECT_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              访问 GitHub
            </a>
            <a
              className="project-action project-action-primary"
              href={PROJECT_LINKS.afdian}
              target="_blank"
              rel="noopener noreferrer"
            >
              前往爱发电
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
