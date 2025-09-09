import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { extractAuctionSheetData, type AuctionSheetData } from "./openai";

// Action to extract auction sheet data from URL
export const extractAuctionData = action({
  args: {
    auctionUrl: v.string(),
    username: v.string(),
    password: v.string(),
    priority: v.optional(v.number()),
    requestedBy: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    jobId?: any;
    auctionSheetId?: any;
    message: string;
    error?: string;
  }> => {
    console.log(`Starting auction data extraction for: ${args.auctionUrl}`);
    
    // Create extraction job record
    const jobId = await ctx.runMutation(internal.auctionExtractionMutations.createExtractionJob, {
      auctionUrl: args.auctionUrl,
      priority: args.priority || 1,
      requestedBy: args.requestedBy,
    });

    try {
      // Update job status to processing
      await ctx.runMutation(internal.auctionExtractionMutations.updateJobStatus, {
        jobId,
        status: "processing",
      });

      // Authenticate and fetch auction page content
      const htmlContent = await fetchAuctionPage(args.auctionUrl, args.username, args.password);
      
      // Extract data using OpenAI
      const extractedData = await extractAuctionSheetData(htmlContent, args.auctionUrl);
      
      // Store HTML content for debugging
      await ctx.runMutation(internal.auctionExtractionMutations.updateJobHtmlContent, {
        jobId,
        htmlContent: htmlContent.substring(0, 50000), // Limit HTML storage size
        aiResponse: JSON.stringify(extractedData, null, 2),
      });

      // Create auction sheet record
      const auctionSheetId = await ctx.runMutation(internal.auctionExtractionMutations.createAuctionSheet, {
        data: extractedData,
        sourceUrl: args.auctionUrl,
      });

      // Update job as completed
      await ctx.runMutation(internal.auctionExtractionMutations.updateJobStatus, {
        jobId,
        status: "completed",
        auctionSheetId,
        extractedAt: Date.now(),
      });

      // Schedule image extraction as a separate task
      await ctx.scheduler.runAfter(0, internal.auctionExtraction.extractImagesFromPage, {
        auctionSheetId,
        auctionUrl: args.auctionUrl,
        username: args.username,
        password: args.password,
        htmlContent,
      });

      console.log(`Successfully extracted auction data. Job ID: ${jobId}, Sheet ID: ${auctionSheetId}`);
      
      return {
        success: true,
        jobId,
        auctionSheetId,
        message: "Auction data extracted successfully",
      };

    } catch (error) {
      console.error(`Error extracting auction data:`, error);
      
      // Update job as failed
      await ctx.runMutation(internal.auctionExtractionMutations.updateJobStatus, {
        jobId,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        jobId,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// Action to extract and store images from auction page
export const extractImagesFromPage = action({
  args: {
    auctionSheetId: v.id("auctionSheets"),
    auctionUrl: v.string(),
    username: v.string(),
    password: v.string(),
    htmlContent: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Starting image extraction for auction sheet: ${args.auctionSheetId}`);
    
    try {
      // Parse HTML to find image URLs
      const imageUrls = extractImageUrls(args.htmlContent, args.auctionUrl);
      
      console.log(`Found ${imageUrls.length} images to extract`);
      
      for (const imageInfo of imageUrls) {
        try {
          // Download image with authentication
          const imageBuffer = await downloadImageWithAuth(
            imageInfo.url, 
            args.username, 
            args.password
          );
          
          // Store image in Convex storage
          const storageId = await ctx.storage.store(new Blob([imageBuffer], {
            type: imageInfo.mimeType || 'image/jpeg'
          }));
          
          // Create image record
          await ctx.runMutation(internal.auctionExtractionMutations.createImageRecord, {
            auctionSheetId: args.auctionSheetId,
            storageId,
            imageType: imageInfo.type,
            originalUrl: imageInfo.url,
            filename: imageInfo.filename,
            mimeType: imageInfo.mimeType,
            fileSize: imageBuffer.byteLength,
            description: imageInfo.description,
            position: imageInfo.position,
          });
          
          console.log(`Stored image: ${imageInfo.filename} (${imageBuffer.byteLength} bytes)`);
          
        } catch (imageError) {
          console.error(`Failed to download image ${imageInfo.url}:`, imageError);
          // Continue with other images even if one fails
        }
      }
      
      console.log(`Completed image extraction for auction sheet: ${args.auctionSheetId}`);
      
    } catch (error) {
      console.error(`Error extracting images for auction sheet ${args.auctionSheetId}:`, error);
    }
  },
});

// Action to retry failed extraction jobs
export const retryFailedJob = action({
  args: {
    jobId: v.id("extractionJobs"),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const job = await ctx.runQuery(internal.auctionExtractionMutations.getExtractionJob, {
      jobId: args.jobId,
    });
    
    if (!job) {
      throw new Error("Job not found");
    }
    
    if (job.status !== "failed") {
      throw new Error("Can only retry failed jobs");
    }
    
    // Increment retry count
    await ctx.runMutation(internal.auctionExtractionMutations.incrementRetryCount, {
      jobId: args.jobId,
    });
    
    // Retry the extraction
    return await extractAuctionData({
      auctionUrl: job.auctionUrl,
      username: args.username,
      password: args.password,
      priority: job.priority,
      requestedBy: job.requestedBy,
    });
  },
});

// Helper function to fetch auction page with authentication
async function fetchAuctionPage(url: string, username: string, password: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please check username and password.');
    }
    throw new Error(`Failed to fetch auction page: ${response.status} ${response.statusText}`);
  }

  const content = await response.text();
  
  if (content.includes('ログイン') || content.includes('Login')) {
    throw new Error('Authentication required or session expired');
  }

  return content;
}

// Helper function to extract image URLs from HTML content
function extractImageUrls(htmlContent: string, baseUrl: string): Array<{
  url: string;
  type: "auction_sheet" | "vehicle_photo" | "defect_diagram" | "document";
  filename?: string;
  mimeType?: string;
  description?: string;
  position?: number;
}> {
  const imageUrls: Array<{
    url: string;
    type: "auction_sheet" | "vehicle_photo" | "defect_diagram" | "document";
    filename?: string;
    mimeType?: string;
    description?: string;
    position?: number;
  }> = [];

  const baseUrlObj = new URL(baseUrl);
  
  // Common image patterns to look for
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  let position = 0;

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    let fullUrl: string;
    
    // Handle relative URLs
    if (src.startsWith('http')) {
      fullUrl = src;
    } else if (src.startsWith('//')) {
      fullUrl = baseUrlObj.protocol + src;
    } else if (src.startsWith('/')) {
      fullUrl = baseUrlObj.origin + src;
    } else {
      fullUrl = baseUrlObj.origin + '/' + src;
    }
    
    // Skip very small images (likely icons or UI elements)
    if (src.includes('icon') || src.includes('button') || src.includes('logo')) {
      continue;
    }
    
    // Determine image type based on URL patterns
    let type: "auction_sheet" | "vehicle_photo" | "defect_diagram" | "document" = "vehicle_photo";
    let description = "";
    
    if (src.includes('auction') || src.includes('sheet')) {
      type = "auction_sheet";
      description = "Auction sheet image";
    } else if (src.includes('defect') || src.includes('damage')) {
      type = "defect_diagram";
      description = "Defect diagram";
    } else if (src.includes('photo') || src.includes('image')) {
      type = "vehicle_photo";
      description = "Vehicle photo";
    }
    
    // Extract filename from URL
    const urlParts = fullUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || `image_${position}.jpg`;
    
    // Determine MIME type from file extension
    const mimeType = filename.endsWith('.png') ? 'image/png' : 
                    filename.endsWith('.gif') ? 'image/gif' : 
                    filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    
    imageUrls.push({
      url: fullUrl,
      type,
      filename,
      mimeType,
      description,
      position: position++,
    });
  }
  
  return imageUrls;
}

// Helper function to download images with authentication
async function downloadImageWithAuth(url: string, username: string, password: string): Promise<ArrayBuffer> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
      'Referer': url.split('/').slice(0, 3).join('/'),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return buffer;
}