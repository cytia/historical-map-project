import { Button } from "./components/Button";
import { ExternalLink } from "./components/ExternalLink";
import { PROJECT_LINKS } from "./projectLinks";

interface ProjectActionsProps {
  onAbout: () => void;
}

export function ProjectActions({ onAbout }: ProjectActionsProps) {
  return (
    <nav className="project-actions" aria-label="项目入口">
      <Button variant="action" onClick={onAbout}>
        关于项目
      </Button>
      <ExternalLink href={PROJECT_LINKS.github}>
        GitHub
      </ExternalLink>
      <ExternalLink href={PROJECT_LINKS.afdian} emphasis>
        支持项目
      </ExternalLink>
    </nav>
  );
}
