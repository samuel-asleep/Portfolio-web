import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    twitter: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const { data: profile } = useQuery<Profile>({
    queryKey: ['/api/profile'],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        twitter: profile.twitter || "",
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Portfolio information updated successfully!",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter your API key",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (profileImage) {
      data.append('profileImage', profileImage);
    }

    updateProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen py-20 px-6 lg:px-8" data-testid="section-admin">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8" data-testid="text-admin-heading">
          Admin Dashboard
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Authentication</h2>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your admin API key"
                  data-testid="input-api-key"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Your API key should be set in the .env file as ADMIN_API_KEY
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profileImage">Profile Photo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                      data-testid="input-profile-image"
                    />
                    <Button type="button" variant="outline" size="icon" data-testid="button-upload-image">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {profileImage && (
                    <p className="text-sm text-muted-foreground mt-2" data-testid="text-image-name">
                      Selected: {profileImage.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Creative Developer & Designer"
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    data-testid="input-bio"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="San Francisco, CA"
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourusername"
                    data-testid="input-github"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourusername"
                    data-testid="input-linkedin"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/yourusername"
                    data-testid="input-twitter"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save">
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
