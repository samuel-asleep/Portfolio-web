import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
}

interface PortfolioProps {
  projects?: Project[];
}

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A modern e-commerce solution with real-time inventory",
    longDescription: "Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL. Features include real-time inventory tracking, secure payment processing, and an intuitive admin dashboard.",
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    id: "2",
    title: "AI Content Generator",
    description: "AI-powered tool for creating marketing content",
    longDescription: "Developed an AI-powered content generation platform using GPT-4 API. Enables marketers to create high-quality content with custom brand voice and SEO optimization.",
    tags: ["TypeScript", "OpenAI", "Next.js"],
  },
  {
    id: "3",
    title: "Task Management App",
    description: "Collaborative project management with real-time updates",
    longDescription: "Created a collaborative task management application with real-time synchronization using WebSockets. Includes features like team boards, time tracking, and analytics.",
    tags: ["React", "WebSocket", "MongoDB"],
  },
];

export default function Portfolio({ projects = defaultProjects }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="portfolio" className="py-20 px-6 lg:px-8" data-testid="section-portfolio">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center" data-testid="text-portfolio-heading">
          Featured Work
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          A selection of projects showcasing my expertise in modern web development
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden cursor-pointer hover:scale-105 hover-elevate active-elevate-2 transition-all duration-300 group"
              onClick={() => setSelectedProject(project)}
              data-testid={`card-project-${project.id}`}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 animate-gradient" />
                )}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-foreground font-semibold">View Details</p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-foreground" data-testid={`text-project-title-${project.id}`}>
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid={`text-project-description-${project.id}`}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag.toLowerCase()}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-project-details">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl" data-testid="text-dialog-title">{selectedProject.title}</DialogTitle>
                <DialogDescription data-testid="text-dialog-description">
                  {selectedProject.longDescription || selectedProject.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-md overflow-hidden">
                  {selectedProject.image ? (
                    <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 animate-gradient" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  {selectedProject.liveUrl && (
                    <Button asChild data-testid="button-live-demo">
                      <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {selectedProject.githubUrl && (
                    <Button variant="outline" asChild data-testid="button-github">
                      <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
