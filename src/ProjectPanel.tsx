import { useEffect, useRef } from "react";
import { Button } from "./components/Button";
import { ExternalLink } from "./components/ExternalLink";
import { PanelCloseButton } from "./components/PanelCloseButton";
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
        <Button
          variant="backdrop"
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
        <PanelCloseButton
          ref={closeButtonRef}
          label="关闭关于项目面板"
          onClick={onClose}
        />
        <div className="panel-scrollbar">
          <p className="eyebrow">关于项目</p>
          <h2 id="project-panel-title">历史地图计划</h2>
          <p className="project-intro">
            历史地图计划是一个面向公众与历史爱好者的开源历史地图项目，致力于用可浏览、可查询的地图呈现中国不同历史时期的政区、地点、自然地理与历史事件。
          </p>

          <section className="project-section">
            <h3>当前进度</h3>
            <p>
              已完成明代两京十三布政司辖下府、州、县共 1,563 个历史点位的坐标审核与录入；依据万历六年记录，已完成全国及各省人口、田土、赋税数据的整理与录入。
            </p>
            <p>
              下一步将制作人口、田土、赋税着色地图，并开展全国都司、行都司、留守司及其下辖卫所的坐标审核与录入。
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
            <ExternalLink href={PROJECT_LINKS.github}>
              访问 GitHub
            </ExternalLink>
            <ExternalLink href={PROJECT_LINKS.afdian} emphasis>
              前往爱发电
            </ExternalLink>
          </div>
        </div>
      </aside>
    </>
  );
}
