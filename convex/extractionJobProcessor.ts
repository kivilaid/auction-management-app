import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Cron job to process failed jobs and cleanup old ones
const crons = cronJobs();

// Process failed jobs every 30 minutes
crons.interval(
  "retry-failed-jobs",
  { minutes: 30 },
  internal.extractionJobProcessor.retryFailedJobs
);

// Cleanup old completed jobs once per day
crons.interval(
  "cleanup-old-jobs",
  { hours: 24 },
  internal.extractionJobProcessor.cleanupOldJobs
);

export default crons;