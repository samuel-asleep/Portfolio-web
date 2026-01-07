import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Plus, Pencil, Trash2, ExternalLink, Github, Upload, Link as LinkIcon, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectFormData {
  title: string;
  description: string;
  longDescription: string;
  image: string;
  imageData?: string;
  tags: string;
  liveUrl: string;
  githubUrl: string;
  order: number;
}

interface ProjectsManagerProps {
  // No props needed - auth via session cookie
}

export default function ProjectsManager({}: ProjectsManagerProps = {}) {
  const { toast } = useToast();
  const csrfToken = useCsrfToken();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    tags: "",
    liveUrl: "",
    githubUrl: "",
    order: 0,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectFormData }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      longDescription: "",
      image: "",
      imageData: undefined,
      tags: "",
      liveUrl: "",
      githubUrl: "",
      order: projects.length,
    });
    setEditingProject(null);
    setSelectedFile(null);
    setImagePreview("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "", imageData: undefined });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', selectedFile);

      const response = await fetch('/api/projects/upload-image', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageData } = await response.json();
      return imageData;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        longDescription: project.longDescription || "",
        image: project.image || "",
        imageData: project.imageData || undefined,
        tags: project.tags.join(", "),
        liveUrl: project.liveUrl || "",
        githubUrl: project.githubUrl || "",
        order: project.order,
      });
      // Set preview to imageData first, then fall back to image URL
      if (project.imageData) {
        setImagePreview(project.imageData);
      } else if (project.image) {
        setImagePreview(project.image);
      }
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csrfToken) {
      toast({
        title: "Error",
        description: "Security token not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    let imageData = formData.imageData;
    let image = formData.image;

    if (selectedFile) {
      const uploadedData = await uploadImage();
      if (uploadedData) {
        imageData = uploadedData;
        image = ""; // Clear URL if we have data
      } else {
        return;
      }
    }

    const dataToSubmit = { 
      ...formData, 
      image: image || "", 
      imageData: imageData 
    };

    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        data: dataToSubmit,
      });
    } else {
      createProjectMutation.mutate(dataToSubmit);
    }
  };

  const handleDelete = (id: string) => {
    if (!csrfToken) {
      toast({
        title: "Error",
        description: "Security token not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Manage Projects</h2>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-project">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No projects yet. Click "Add Project" to create one!
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="p-4 space-y-3" data-testid={`card-project-${project.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate" data-testid={`text-project-title-${project.id}`}>
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-project-description-${project.id}`}>
                    {project.description}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenDialog(project)}
                    data-testid={`button-edit-${project.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(project.id)}
                    data-testid={`button-delete-${project.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(project.liveUrl || project.githubUrl) && (
                <div className="flex gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      data-testid={`link-live-${project.id}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Live
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      data-testid={`link-github-${project.id}`}
                    >
                      <Github className="h-3 w-3" />
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-project-form">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject ? "Update your project details" : "Add a new project to your portfolio"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="project-title">Title *</Label>
              <Input
                id="project-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E-Commerce Platform"
                required
                data-testid="input-project-title"
              />
            </div>

            <div>
              <Label htmlFor="project-description">Short Description *</Label>
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A modern e-commerce solution with real-time inventory"
                rows={2}
                required
                data-testid="input-project-description"
              />
            </div>

            <div>
              <Label htmlFor="project-long-description">Full Description</Label>
              <Textarea
                id="project-long-description"
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                placeholder="Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL..."
                rows={4}
                data-testid="input-project-long-description"
              />
            </div>

            <div>
              <Label>Project Image</Label>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" data-testid="tab-upload-image">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url" data-testid="tab-url-image">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Image URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      id="project-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                      data-testid="input-project-image-file"
                    />
                    {(selectedFile || imagePreview) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRemoveImage}
                        data-testid="button-remove-image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        data-testid="img-preview"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload an image file (max 5MB). Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-3">
                  <Input
                    id="project-image-url"
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value, imageData: undefined });
                      setImagePreview(e.target.value);
                      setSelectedFile(null);
                    }}
                    placeholder="https://example.com/project-image.jpg"
                    data-testid="input-project-image-url"
                  />
                  {formData.image && (
                    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview("")}
                        data-testid="img-url-preview"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter a direct URL to an image hosted elsewhere
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Label htmlFor="project-tags">Tags (comma-separated)</Label>
              <Input
                id="project-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="React, Node.js, PostgreSQL"
                data-testid="input-project-tags"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate tags with commas: React, TypeScript, Next.js
              </p>
            </div>

            <div>
              <Label htmlFor="project-live-url">Live Demo URL</Label>
              <Input
                id="project-live-url"
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://example.com"
                data-testid="input-project-live-url"
              />
            </div>

            <div>
              <Label htmlFor="project-github-url">GitHub URL</Label>
              <Input
                id="project-github-url"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username/repo"
                data-testid="input-project-github-url"
              />
            </div>

            <div>
              <Label htmlFor="project-order">Display Order</Label>
              <Input
                id="project-order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                placeholder="0"
                data-testid="input-project-order"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Projects are displayed in ascending order (0, 1, 2, ...). Lower numbers appear first.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-project"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending || uploadingImage}
                data-testid="button-save-project"
              >
                {uploadingImage
                  ? "Uploading..."
                  : createProjectMutation.isPending || updateProjectMutation.isPending
                  ? "Saving..."
                  : editingProject
                  ? "Update Project"
                  : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
