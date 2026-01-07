import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./fileStorage";
import { insertProfileSchema, insertProjectSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for profile image uploads to data/uploads
const uploadDir = path.join(process.cwd(), "data", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const projectUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Authentication middleware - requires admin login via session
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Unauthorized - Please login first' });
  }
  next();
}

// Check if ADMIN_KEY is configured
function isAdminKeyConfigured(): boolean {
  return !!process.env.ADMIN_KEY && process.env.ADMIN_KEY.length > 0;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get CSRF middleware from app (set in index.ts)
  const csrfProtection = app.get('csrfProtection');
  
  // Serve uploaded files from data/uploads
  app.use('/data/uploads', express.static(uploadDir));
  
  // Legacy compatibility - serve from /uploads as well
  app.use('/uploads', express.static(uploadDir));

  // Get CSRF token endpoint (for clients to obtain token)
  app.get('/api/csrf-token', (req, res) => {
    res.json({ token: res.locals.csrfToken });
  });

  // Admin login endpoint (with CSRF protection)
  app.post('/api/admin/login', csrfProtection, (req, res) => {
    if (!isAdminKeyConfigured()) {
      return res.status(403).json({ error: 'Admin access is not configured' });
    }
    
    const { key } = req.body;
    
    if (!key || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Invalid admin key' });
    }
    
    req.session.authenticated = true;
    res.json({ success: true });
  });

  // Admin logout endpoint (with CSRF protection)
  app.post('/api/admin/logout', csrfProtection, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });

  // Check admin authentication status
  app.get('/api/admin/status', (req, res) => {
    res.json({ 
      authenticated: !!req.session.authenticated,
      configured: isAdminKeyConfigured(),
    });
  });

  // Public config endpoint (safe subset of profile + projects metadata)
  app.get('/api/config', async (req, res) => {
    try {
      const profile = await storage.getProfile();
      const projects = await storage.getProjects();
      
      res.json({
        profile: profile ? {
          name: profile.name,
          title: profile.title,
          bio: profile.bio,
          profileImage: profile.profileImage,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          github: profile.github,
          linkedin: profile.linkedin,
          twitter: profile.twitter,
        } : null,
        projectCount: projects.length,
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  });

  // Get portfolio profile (public)
  app.get('/api/profile', async (req, res) => {
    try {
      const profile = await storage.getProfile();
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update portfolio profile (protected with CSRF)
  app.post('/api/profile', requireAuth, csrfProtection, upload.single('profileImage'), async (req, res) => {
    try {
      // Get existing profile to preserve image if no new one provided
      const existingProfile = await storage.getProfile();
      
      const profileData = {
        name: req.body.name || '',
        title: req.body.title || '',
        bio: req.body.bio || '',
        email: req.body.email || '',
        phone: req.body.phone || '',
        location: req.body.location || '',
        github: req.body.github || '',
        linkedin: req.body.linkedin || '',
        twitter: req.body.twitter || '',
        profileImage: undefined as string | undefined,
      };

      // Priority 1: Check if a direct image URL was provided (non-empty)
      const hasImageUrl = req.body.profileImageUrl && req.body.profileImageUrl.trim().length > 0;
      
      if (hasImageUrl) {
        const imageUrl = req.body.profileImageUrl.trim();
        
        // Basic URL validation
        try {
          const url = new URL(imageUrl);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are allowed' });
          }
          profileData.profileImage = imageUrl;
        } catch {
          return res.status(400).json({ error: 'Invalid image URL provided' });
        }
      }
      // Priority 2: Check if a file was uploaded
      else if (req.file) {
        profileData.profileImage = `/data/uploads/${req.file.filename}`;
      }
      // Priority 3: Keep existing image if no new one provided
      else if (existingProfile?.profileImage) {
        profileData.profileImage = existingProfile.profileImage;
      }

      // Validate the data
      const validated = insertProfileSchema.parse(profileData);
      
      // Update profile in storage
      const updatedProfile = await storage.updateProfile(validated);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid profile data', details: error });
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Get all projects (public)
  app.get('/api/projects', async (req, res) => {
    try {
      const projectsList = await storage.getProjects();
      res.json(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get a single project (public)
  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  // Upload project image (protected with CSRF) - converts to base64 for storage in config
  app.post('/api/projects/upload-image', requireAuth, csrfProtection, (req, res, next) => {
    projectUpload.single('image')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 5MB limit' });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        if (err.message === 'Only image files are allowed') {
          return res.status(400).json({ error: 'Only image files are allowed (JPG, PNG, GIF, WebP)' });
        }
        console.error('Error uploading project image:', err);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      try {
        // Convert image to base64
        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const dataUri = `data:${mimeType};base64,${imageBase64}`;
        
        // Return the base64 data URI
        res.json({ imageData: dataUri });
      } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to process image' });
      }
    });
  });

  // Create a new project (protected with CSRF)
  app.post('/api/projects', requireAuth, csrfProtection, async (req, res) => {
    try {
      // Parse order: validate it's a finite number
      let order = 0;
      if (req.body.order !== undefined && req.body.order !== null && req.body.order !== '') {
        const parsedOrder = Number(req.body.order);
        if (!Number.isFinite(parsedOrder) || parsedOrder < 0) {
          return res.status(400).json({ error: 'Order must be a valid non-negative number' });
        }
        order = Math.floor(parsedOrder);
      }

      // Parse tags if it's a string
      const projectData = {
        ...req.body,
        tags: typeof req.body.tags === 'string' 
          ? req.body.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
          : req.body.tags || [],
        order,
      };

      const validated = insertProjectSchema.parse(projectData);
      const newProject = await storage.createProject(validated);
      res.json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid project data', details: error });
      }
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Update a project (protected with CSRF)
  app.patch('/api/projects/:id', requireAuth, csrfProtection, async (req, res) => {
    try {
      const projectData: any = { ...req.body };
      
      // Parse tags if it's a string
      if (typeof projectData.tags === 'string') {
        projectData.tags = projectData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      }
      
      // Validate and parse order if provided
      if (projectData.order !== undefined && projectData.order !== null && projectData.order !== '') {
        const parsedOrder = Number(projectData.order);
        if (!Number.isFinite(parsedOrder) || parsedOrder < 0) {
          return res.status(400).json({ error: 'Order must be a valid non-negative number' });
        }
        projectData.order = Math.floor(parsedOrder);
      } else if ('order' in projectData) {
        // If order was explicitly sent but is empty/invalid, remove it from update
        delete projectData.order;
      }

      // Remove undefined values to prevent null writes
      Object.keys(projectData).forEach(key => {
        if (projectData[key] === undefined) {
          delete projectData[key];
        }
      });

      const validated = insertProjectSchema.partial().parse(projectData);
      const updatedProject = await storage.updateProject(req.params.id, validated);
      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid project data', details: error });
      }
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Delete a project (protected with CSRF)
  app.delete('/api/projects/:id', requireAuth, csrfProtection, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
