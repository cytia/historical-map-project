import { PROJECT_LINKS } from "./projectLinks";

interface ProjectActionsProps {
  onAbout: () => void;
}

export function ProjectActions({ onAbout }: ProjectActionsProps) {
  return (
    <nav className="project-actions" aria-label="项目入口">
      <button type="button" className="project-action" onClick={onAbout}>
        关于项目
      </button>
      <a
        className="project-action"
        href={PROJECT_LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
      <a
        className="project-action project-action-primary"
        href={PROJECT_LINKS.afdian}
        target="_blank"
        rel="noopener noreferrer"
      >
        支持项目
      </a>
    </nav>
  );
}
