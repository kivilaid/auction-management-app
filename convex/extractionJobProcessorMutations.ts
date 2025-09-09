import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Internal action to retry failed jobs automatically
export const retryFailedJobs = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting automatic retry of failed jobs");
    
    // Get failed jobs that have been retried less than 3 times
    const failedJobs = await ctx.runQuery(internal.extractionJobProcessorMutations.getRetriableFailedJobs);
    
    console.log(`Found ${failedJobs.length} jobs eligible for retry`);
    
    for (const job of failedJobs) {
      try {
        // Only retry if retry count is less than 3 and job is older than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if ((job.retryCount || 0) < 3 && job._creationTime < oneHourAgo) {
          console.log(`Retrying job ${job._id} (attempt ${(job.retryCount || 0) + 1})`);
          
          // Increment retry count and reset status
          await ctx.runMutation(internal.auctionExtractionMutations.incrementRetryCount, {
            jobId: job._id,
          });
          
          // Schedule the extraction action with default credentials (would need to be configured)
          // Note: In production, you'd store encrypted credentials or use a service account
          await ctx.scheduler.runAfter(0, internal.auctionExtraction.extractAuctionData, {
            auctionUrl: job.auctionUrl,
            username: "kivilaid", // This should be configurable/encrypted in production
            password: "L00serl00ser", // This should be configurable/encrypted in production
            priority: job.priority || 1,
            requestedBy: "auto-retry",
          });
        }
      } catch (error) {
        console.error(`Error retrying job ${job._id}:`, error);
      }
    }
    
    console.log("Completed automatic retry process");
  },
});

// Internal action to cleanup old completed jobs
export const cleanupOldJobs = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting cleanup of old extraction jobs");
    
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Get old completed jobs
    const oldJobs = await ctx.runQuery(internal.extractionJobProcessorMutations.getOldCompletedJobs, {
      beforeTimestamp: thirtyDaysAgo,
    });
    
    console.log(`Found ${oldJobs.length} old jobs to clean up`);
    
    for (const job of oldJobs) {
      try {
        // Delete the job record
        await ctx.runMutation(internal.extractionJobProcessorMutations.deleteJob, {
          jobId: job._id,
        });
        
        console.log(`Deleted old job ${job._id}`);
      } catch (error) {
        console.error(`Error deleting job ${job._id}:`, error);
      }
    }
    
    console.log("Completed cleanup process");
  },
});

// Internal query to get failed jobs eligible for retry
export const getRetriableFailedJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("extractionJobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .filter((q) => q.lt(q.field("retryCount"), 3))
      .take(10); // Limit to 10 jobs per run
  },
});

// Internal query to get old completed jobs
export const getOldCompletedJobs = internalMutation({
  args: {
    beforeTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("extractionJobs")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .filter((q) => q.lt(q.field("_creationTime"), args.beforeTimestamp))
      .take(50); // Limit to 50 jobs per cleanup run
  },
});

// Internal mutation to delete a job
export const deleteJob = internalMutation({
  args: {
    jobId: v.id("extractionJobs"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.jobId);
  },
});

// Internal action to handle job queue priority processing
export const processJobQueue = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Processing job queue");
    
    // Get pending jobs ordered by priority and creation time
    const pendingJobs = await ctx.runQuery(internal.extractionJobProcessorMutations.getPendingJobsByPriority);
    
    if (pendingJobs.length === 0) {
      console.log("No pending jobs to process");
      return;
    }
    
    // Process up to 5 jobs concurrently
    const jobsToProcess = pendingJobs.slice(0, 5);
    
    console.log(`Processing ${jobsToProcess.length} jobs`);
    
    const processingPromises = jobsToProcess.map(async (job: any) => {
      try {
        // Update status to processing
        await ctx.runMutation(internal.auctionExtractionMutations.updateJobStatus, {
          jobId: job._id,
          status: "processing",
        });
        
        // Schedule the extraction action
        await ctx.scheduler.runAfter(0, internal.auctionExtraction.extractAuctionData, {
          auctionUrl: job.auctionUrl,
          username: "kivilaid", // This should be configurable in production
          password: "L00serl00ser", // This should be configurable in production
          priority: job.priority || 1,
          requestedBy: job.requestedBy || "queue-processor",
        });
        
        console.log(`Scheduled processing for job ${job._id}`);
      } catch (error) {
        console.error(`Error processing job ${job._id}:`, error);
        
        // Mark job as failed
        await ctx.runMutation(internal.auctionExtractionMutations.updateJobStatus, {
          jobId: job._id,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    });
    
    await Promise.all(processingPromises);
    
    console.log("Completed job queue processing");
  },
});

// Internal query to get pending jobs by priority
export const getPendingJobsByPriority = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("extractionJobs")
      .withIndex("by_status_priority", (q) => q.eq("status", "pending"))
      .order("desc") // High priority first
      .take(10);
  },
});

// Health check function to monitor system status
export const getSystemHealth = internalMutation({
  args: {},
  handler: async (ctx) => {
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      totalAuctionSheets: 0,
      totalImages: 0,
    };
    
    // Count jobs by status
    const jobs = await ctx.db.query("extractionJobs").collect();
    jobs.forEach(job => {
      stats[job.status]++;
    });
    
    // Count auction sheets and images
    const auctionSheets = await ctx.db.query("auctionSheets").collect();
    stats.totalAuctionSheets = auctionSheets.length;
    
    const images = await ctx.db.query("auctionImages").collect();
    stats.totalImages = images.length;
    
    return stats;
  },
});