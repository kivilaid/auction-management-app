"use server";

import { api } from "../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface ExtractionJobResult {
  success: boolean;
  jobId?: string;
  auctionSheetId?: string;
  message: string;
  error?: string;
  alreadyExists?: boolean;
  inProgress?: boolean;
}

export async function scheduleAuctionExtraction(formData: FormData): Promise<ExtractionJobResult> {
  try {
    const auctionUrl = formData.get("auctionUrl") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const priority = parseInt(formData.get("priority") as string) || 1;
    const requestedBy = formData.get("requestedBy") as string || "admin";

    if (!auctionUrl || !username || !password) {
      return {
        success: false,
        message: "Missing required fields: auctionUrl, username, or password",
      };
    }

    // Validate URL format
    if (!auctionUrl.includes("autoworldjapan.com")) {
      return {
        success: false,
        message: "Invalid auction URL. Must be from autoworldjapan.com",
      };
    }

    // Schedule the extraction
    const result = await convex.mutation(api.auctionExtractionMutations.scheduleAuctionExtraction, {
      auctionUrl,
      username,
      password,
      priority,
      requestedBy,
    });

    return result;
  } catch (error) {
    console.error("Error scheduling auction extraction:", error);
    return {
      success: false,
      message: "Failed to schedule extraction",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getExtractionJobStatus(jobId: string) {
  try {
    const job = await convex.query(api.auctionExtractionMutations.getExtractionJob, { 
      jobId: jobId as any 
    });
    
    if (!job) {
      return { success: false, message: "Job not found" };
    }

    return {
      success: true,
      job: {
        id: job._id,
        auctionUrl: job.auctionUrl,
        status: job.status,
        errorMessage: job.errorMessage,
        auctionSheetId: job.auctionSheetId,
        extractedAt: job.extractedAt,
        retryCount: job.retryCount,
        createdAt: job._creationTime,
      },
    };
  } catch (error) {
    console.error("Error getting job status:", error);
    return {
      success: false,
      message: "Failed to get job status",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getExtractionJobs(limit?: number, status?: string) {
  try {
    const jobs = await convex.query(api.auctionExtractionMutations.getExtractionJobs, {
      limit,
      status: status as any,
    });

    return {
      success: true,
      jobs: jobs.map(job => ({
        id: job._id,
        auctionUrl: job.auctionUrl,
        status: job.status,
        errorMessage: job.errorMessage,
        auctionSheetId: job.auctionSheetId,
        extractedAt: job.extractedAt,
        retryCount: job.retryCount,
        createdAt: job._creationTime,
        auctionSheet: job.auctionSheet ? {
          id: job.auctionSheet._id,
          lotNumber: job.auctionSheet.lotNumber,
          make: job.auctionSheet.make,
          model: job.auctionSheet.model,
          overallGrade: job.auctionSheet.overallGrade,
          mileageKm: job.auctionSheet.mileageKm,
        } : undefined,
      })),
    };
  } catch (error) {
    console.error("Error getting extraction jobs:", error);
    return {
      success: false,
      message: "Failed to get extraction jobs",
      error: error instanceof Error ? error.message : String(error),
      jobs: [],
    };
  }
}

export async function retryFailedExtraction(formData: FormData) {
  try {
    const jobId = formData.get("jobId") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!jobId || !username || !password) {
      return {
        success: false,
        message: "Missing required fields: jobId, username, or password",
      };
    }

    // Note: This would require an action call since retryFailedJob is an action
    // For now, we'll redirect to schedule a new extraction
    const job = await convex.query(api.auctionExtractionMutations.getExtractionJob, {
      jobId: jobId as any,
    });

    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    // Schedule a new extraction instead of retrying the old one
    const result = await convex.mutation(api.auctionExtractionMutations.scheduleAuctionExtraction, {
      auctionUrl: job.auctionUrl,
      username,
      password,
      priority: job.priority || 1,
      requestedBy: job.requestedBy || "retry",
    });

    return {
      ...result,
      message: result.message + " (as retry)",
    };
  } catch (error) {
    console.error("Error retrying extraction:", error);
    return {
      success: false,
      message: "Failed to retry extraction",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}