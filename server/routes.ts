import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for profile image uploads
const uploadDir = path.join(process.cwd(), "uploads");
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

// API key authentication middleware
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Get portfolio profile
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

  // Update portfolio profile (protected)
  app.post('/api/profile', requireApiKey, upload.single('profileImage'), async (req, res) => {
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
        profileData.profileImage = `/uploads/${req.file.filename}`;
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

  const httpServer = createServer(app);

  return httpServer;
}
