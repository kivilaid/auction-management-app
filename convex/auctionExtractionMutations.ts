import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { AuctionSheetData } from "./openai";

// Internal mutations (only callable from actions/other mutations)

export const createExtractionJob = internalMutation({
  args: {
    auctionUrl: v.string(),
    priority: v.optional(v.number()),
    requestedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("extractionJobs", {
      auctionUrl: args.auctionUrl,
      status: "pending",
      priority: args.priority || 1,
      requestedBy: args.requestedBy,
      retryCount: 0,
      userAgent: "Mozilla/5.0 (compatible; AutoWorldJapan Bot/1.0)",
    });
  },
});

export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("extractionJobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    auctionSheetId: v.optional(v.id("auctionSheets")),
    extractedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      status: args.status,
    };
    
    if (args.errorMessage !== undefined) {
      updateData.errorMessage = args.errorMessage;
    }
    
    if (args.auctionSheetId !== undefined) {
      updateData.auctionSheetId = args.auctionSheetId;
    }
    
    if (args.extractedAt !== undefined) {
      updateData.extractedAt = args.extractedAt;
    }
    
    await ctx.db.patch(args.jobId, updateData);
  },
});

export const updateJobHtmlContent = internalMutation({
  args: {
    jobId: v.id("extractionJobs"),
    htmlContent: v.string(),
    aiResponse: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      htmlContent: args.htmlContent,
      aiResponse: args.aiResponse,
    });
  },
});

export const incrementRetryCount = internalMutation({
  args: {
    jobId: v.id("extractionJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    
    await ctx.db.patch(args.jobId, {
      retryCount: (job.retryCount || 0) + 1,
      status: "pending",
      errorMessage: undefined,
    });
  },
});

export const createAuctionSheet = internalMutation({
  args: {
    data: v.any(), // AuctionSheetData type
    sourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const data = args.data as AuctionSheetData;
    
    // Convert extracted data to match our schema field names
    const auctionSheetData = {
      lotNumber: data.lot_number,
      auctionHouseCode: data.auction_house_code,
      auctionHouseName: data.auction_house_name,
      auctionDate: data.auction_date,
      auctionLocation: data.auction_location,
      vehicleRegistrationYear: data.vehicle_registration_year,
      vehicleRegistrationMonth: data.vehicle_registration_month,
      make: data.make,
      model: data.model,
      modelCode: data.model_code,
      chassisNumber: data.chassis_number,
      engineCode: data.engine_code,
      displacementCc: data.displacement_cc,
      fuelType: data.fuel_type,
      driveType: data.drive_type,
      transmissionType: data.transmission_type,
      transmissionSpeeds: data.transmission_speeds,
      doors: data.doors,
      steeringPosition: data.steering_position,
      bodyColor: data.body_color,
      colorCode: data.color_code,
      interiorColor: data.interior_color,
      mileageKm: data.mileage_km,
      mileageUnit: data.mileage_unit,
      mileageAuthenticity: data.mileage_authenticity,
      overallGrade: data.overall_grade,
      exteriorGrade: data.exterior_grade,
      interiorGrade: data.interior_grade,
      equipmentAc: data.equipment_ac,
      equipmentAac: data.equipment_aac,
      equipmentPs: data.equipment_ps,
      equipmentPw: data.equipment_pw,
      equipmentAbs: data.equipment_abs,
      equipmentAirbag: data.equipment_airbag,
      equipmentSr: data.equipment_sr,
      equipmentAw: data.equipment_aw,
      equipmentTv: data.equipment_tv,
      equipmentNav: data.equipment_nav,
      equipmentLeather: data.equipment_leather,
      equipmentBsm: data.equipment_bsm,
      equipmentRadarCruise: data.equipment_radar_cruise,
      equipmentOther: data.equipment_other,
      vehicleInspectionDate: data.vehicle_inspection_date,
      registrationNumber: data.registration_number,
      registrationLocation: data.registration_location,
      startingPrice: data.starting_price,
      reservePrice: data.reserve_price,
      averagePrice: data.average_price,
      finalPrice: data.final_price,
      currency: data.currency,
      recyclingFee: data.recycling_fee,
      isExportEligible: data.is_export_eligible,
      salesPoints: data.sales_points,
      frontBumperDefects: data.front_bumper_defects,
      hoodDefects: data.hood_defects,
      frontLeftFenderDefects: data.front_left_fender_defects,
      frontRightFenderDefects: data.front_right_fender_defects,
      frontLeftDoorDefects: data.front_left_door_defects,
      frontRightDoorDefects: data.front_right_door_defects,
      windshieldDefects: data.windshield_defects,
      leftSideDefects: data.left_side_defects,
      rightSideDefects: data.right_side_defects,
      rearLeftDoorDefects: data.rear_left_door_defects,
      rearRightDoorDefects: data.rear_right_door_defects,
      slidingDoorLeftDefects: data.sliding_door_left_defects,
      slidingDoorRightDefects: data.sliding_door_right_defects,
      rearBumperDefects: data.rear_bumper_defects,
      trunkDefects: data.trunk_defects,
      rearLeftFenderDefects: data.rear_left_fender_defects,
      rearRightFenderDefects: data.rear_right_fender_defects,
      rearWindowDefects: data.rear_window_defects,
      roofDefects: data.roof_defects,
      frontLeftWheelDefects: data.front_left_wheel_defects,
      frontRightWheelDefects: data.front_right_wheel_defects,
      rearLeftWheelDefects: data.rear_left_wheel_defects,
      rearRightWheelDefects: data.rear_right_wheel_defects,
      interiorDefects: data.interior_defects,
      engineDefects: data.engine_defects,
      undercarriageDefects: data.undercarriage_defects,
      otherDefects: data.other_defects,
      totalDefectCount: data.total_defect_count,
      majorDefectsSummary: data.major_defects_summary,
      defectDiagramNotes: data.defect_diagram_notes,
      inspectorComments: data.inspector_comments,
      sellerComments: data.seller_comments,
      auctionHouseNotes: data.auction_house_notes,
      conditionReport: data.condition_report,
      additionalNotes: data.additional_notes,
      auctionStatus: data.auction_status,
      bidCount: data.bid_count,
      winningBidderLocation: data.winning_bidder_location,
      saleDate: data.sale_date,
      auctionSheetImageUrl: sourceUrl, // Store the source URL
      dataSource: "ai_extraction",
      qualityScore: 8, // High quality since it's AI extracted
    };
    
    return await ctx.db.insert("auctionSheets", auctionSheetData);
  },
});

export const createImageRecord = internalMutation({
  args: {
    auctionSheetId: v.id("auctionSheets"),
    storageId: v.id("_storage"),
    imageType: v.union(
      v.literal("auction_sheet"),
      v.literal("vehicle_photo"),
      v.literal("defect_diagram"),
      v.literal("document")
    ),
    originalUrl: v.string(),
    filename: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    description: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auctionImages", {
      auctionSheetId: args.auctionSheetId,
      storageId: args.storageId,
      imageType: args.imageType,
      originalUrl: args.originalUrl,
      filename: args.filename,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      description: args.description,
      position: args.position,
      extractedAt: Date.now(),
    });
  },
});

export const getExtractionJob = query({
  args: {
    jobId: v.id("extractionJobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Public mutations and queries

export const scheduleAuctionExtraction = mutation({
  args: {
    auctionUrl: v.string(),
    username: v.string(),
    password: v.string(),
    priority: v.optional(v.number()),
    requestedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if URL is already being processed or completed
    const existingJob = await ctx.db
      .query("extractionJobs")
      .withIndex("by_url", (q) => q.eq("auctionUrl", args.auctionUrl))
      .filter((q) => q.neq(q.field("status"), "failed"))
      .first();
    
    if (existingJob) {
      if (existingJob.status === "completed") {
        return {
          success: true,
          jobId: existingJob._id,
          auctionSheetId: existingJob.auctionSheetId,
          message: "Auction data already extracted",
          alreadyExists: true,
        };
      } else {
        return {
          success: true,
          jobId: existingJob._id,
          message: "Extraction already in progress",
          inProgress: true,
        };
      }
    }
    
    // Schedule the extraction action
    const jobId = await ctx.scheduler.runAfter(0, internal.auctionExtraction.extractAuctionData, {
      auctionUrl: args.auctionUrl,
      username: args.username,
      password: args.password,
      priority: args.priority,
      requestedBy: args.requestedBy,
    });
    
    return {
      success: true,
      jobId,
      message: "Extraction scheduled successfully",
    };
  },
});

export const getExtractionJobs = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("extractionJobs");
    
    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else {
      query = query.withIndex("by_created_time");
    }
    
    const jobs = await query
      .order("desc")
      .take(args.limit || 50);
    
    // Include auction sheet data for completed jobs
    const jobsWithSheets = await Promise.all(
      jobs.map(async (job) => {
        if (job.status === "completed" && job.auctionSheetId) {
          const auctionSheet = await ctx.db.get(job.auctionSheetId);
          return { ...job, auctionSheet };
        }
        return job;
      })
    );
    
    return jobsWithSheets;
  },
});

export const getAuctionImages = query({
  args: {
    auctionSheetId: v.id("auctionSheets"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auctionImages")
      .withIndex("by_auction_sheet", (q) => q.eq("auctionSheetId", args.auctionSheetId))
      .collect();
  },
});

export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});