import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  auctionSheets: defineTable({
    // Basic Auction Information
    lotNumber: v.string(),
    auctionHouseCode: v.optional(v.string()),
    auctionHouseName: v.optional(v.string()),
    auctionDate: v.optional(v.string()),
    auctionTime: v.optional(v.string()),
    auctionLocation: v.optional(v.string()),
    
    // Vehicle Identification
    vehicleRegistrationYear: v.optional(v.number()),
    vehicleRegistrationMonth: v.optional(v.number()),
    firstRegistrationDate: v.optional(v.string()),
    make: v.string(),
    model: v.string(),
    modelCode: v.optional(v.string()),
    vehicleTypeDesignation: v.optional(v.string()), // Full model designation (e.g., "6BA-KF5P")
    chassisNumber: v.optional(v.string()),
    engineCode: v.optional(v.string()),
    displacementCc: v.optional(v.number()),
    fuelType: v.optional(v.string()),
    engineType: v.optional(v.string()), // Turbo, NA, Hybrid, etc.
    seatingCapacity: v.optional(v.number()),
    
    // Vehicle Specifications
    driveType: v.optional(v.string()),
    transmissionType: v.optional(v.string()),
    transmissionSpeeds: v.optional(v.number()),
    doors: v.optional(v.number()),
    steeringPosition: v.optional(v.string()),
    bodyColor: v.optional(v.string()),
    colorCode: v.optional(v.string()),
    interiorColor: v.optional(v.string()),
    
    // Vehicle Dimensions
    vehicleLength: v.optional(v.number()),
    vehicleWidth: v.optional(v.number()),
    vehicleHeight: v.optional(v.number()),
    vehicleWeight: v.optional(v.number()),
    
    // Mileage and Condition
    mileageKm: v.optional(v.number()),
    mileageUnit: v.optional(v.string()),
    mileageAuthenticity: v.optional(v.string()),
    
    // Auction Grades
    overallGrade: v.optional(v.string()),
    exteriorGrade: v.optional(v.string()),
    interiorGrade: v.optional(v.string()),
    exteriorScore: v.optional(v.number()), // Numerical exterior score
    interiorScore: v.optional(v.number()), // Numerical interior score
    engineScore: v.optional(v.number()), // Engine condition score
    
    // Equipment and Features
    equipmentAc: v.optional(v.boolean()),
    equipmentAac: v.optional(v.boolean()),
    equipmentPs: v.optional(v.boolean()),
    equipmentPw: v.optional(v.boolean()),
    equipmentAbs: v.optional(v.boolean()),
    equipmentAirbag: v.optional(v.boolean()),
    equipmentSr: v.optional(v.boolean()),
    equipmentAw: v.optional(v.boolean()),
    equipmentTv: v.optional(v.boolean()),
    equipmentNav: v.optional(v.boolean()),
    equipmentLeather: v.optional(v.boolean()),
    equipmentBsm: v.optional(v.boolean()),
    equipmentRadarCruise: v.optional(v.boolean()),
    equipmentEtc: v.optional(v.boolean()),
    equipmentBackupCamera: v.optional(v.boolean()),
    equipmentPushStart: v.optional(v.boolean()),
    equipmentHidLights: v.optional(v.boolean()),
    equipmentParkingSensors: v.optional(v.boolean()),
    equipmentLaneKeepAssist: v.optional(v.boolean()),
    equipmentCollisionPrevention: v.optional(v.boolean()),
    equipmentOther: v.optional(v.string()),
    
    // Inspection and Registration
    vehicleInspectionDate: v.optional(v.string()),
    shakenExpiryDate: v.optional(v.string()), // JCI expiry date
    registrationNumber: v.optional(v.string()),
    registrationLocation: v.optional(v.string()),
    recallStatus: v.optional(v.boolean()), // Whether recalls addressed
    hasServiceRecords: v.optional(v.boolean()), // Service history availability
    previousOwnerCount: v.optional(v.number()),
    oneOwner: v.optional(v.boolean()),
    nonSmoking: v.optional(v.boolean()),
    repairHistory: v.optional(v.boolean()), // 修復歴有無
    
    // Pricing Information
    startingPrice: v.optional(v.number()),
    reservePrice: v.optional(v.number()),
    averagePrice: v.optional(v.number()),
    finalPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    
    // Sales Information
    recyclingFee: v.optional(v.number()),
    isExportEligible: v.optional(v.boolean()),
    salesPoints: v.optional(v.string()),
    sellerType: v.optional(v.string()), // Dealer, Private, Lease company
    
    // Additional Auction Information
    cornerNumber: v.optional(v.string()), // Physical location at auction
    laneNumber: v.optional(v.string()),
    auctionBlockTime: v.optional(v.string()),
    
    // Vehicle Defects/Damage - Front Area
    frontBumperDefects: v.optional(v.string()),
    hoodDefects: v.optional(v.string()),
    frontLeftFenderDefects: v.optional(v.string()),
    frontRightFenderDefects: v.optional(v.string()),
    frontLeftDoorDefects: v.optional(v.string()),
    frontRightDoorDefects: v.optional(v.string()),
    windshieldDefects: v.optional(v.string()),
    
    // Vehicle Defects/Damage - Side Areas
    leftSideDefects: v.optional(v.string()),
    rightSideDefects: v.optional(v.string()),
    rearLeftDoorDefects: v.optional(v.string()),
    rearRightDoorDefects: v.optional(v.string()),
    slidingDoorLeftDefects: v.optional(v.string()),
    slidingDoorRightDefects: v.optional(v.string()),
    
    // Vehicle Defects/Damage - Rear Area
    rearBumperDefects: v.optional(v.string()),
    trunkDefects: v.optional(v.string()),
    rearLeftFenderDefects: v.optional(v.string()),
    rearRightFenderDefects: v.optional(v.string()),
    rearWindowDefects: v.optional(v.string()),
    
    // Vehicle Defects/Damage - Other Areas
    roofDefects: v.optional(v.string()),
    frontLeftWheelDefects: v.optional(v.string()),
    frontRightWheelDefects: v.optional(v.string()),
    rearLeftWheelDefects: v.optional(v.string()),
    rearRightWheelDefects: v.optional(v.string()),
    interiorDefects: v.optional(v.string()),
    engineDefects: v.optional(v.string()),
    undercarriageDefects: v.optional(v.string()),
    otherDefects: v.optional(v.string()),
    
    // Component Conditions
    tireCondition: v.optional(v.string()),
    tireBrand: v.optional(v.string()),
    batteryCondition: v.optional(v.string()),
    glassCondition: v.optional(v.string()),
    frameChassisCondition: v.optional(v.string()),
    paintThickness: v.optional(v.string()), // Paint meter readings
    
    // Defects Summary
    totalDefectCount: v.optional(v.number()),
    majorDefectsSummary: v.optional(v.string()),
    defectDiagramNotes: v.optional(v.string()),
    
    // Comments and Notes
    inspectorComments: v.optional(v.string()),
    sellerComments: v.optional(v.string()),
    auctionHouseNotes: v.optional(v.string()),
    conditionReport: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    
    // Auction Results
    auctionStatus: v.optional(v.string()),
    bidCount: v.optional(v.number()),
    winningBidderLocation: v.optional(v.string()),
    saleDate: v.optional(v.string()),
    
    // Document References
    auctionSheetImageUrl: v.optional(v.string()),
    vehiclePhotosUrls: v.optional(v.string()),
    documentsUrls: v.optional(v.string()),
    
    // Metadata
    dataSource: v.optional(v.string()),
    qualityScore: v.optional(v.number()),
  })
    .index("by_lot_number", ["lotNumber"])
    .index("by_make_model", ["make", "model"])
    .index("by_auction_date", ["auctionDate"])
    .index("by_overall_grade", ["overallGrade"])
    .index("by_mileage", ["mileageKm"])
    .index("by_vehicle_year", ["vehicleRegistrationYear"])
    .index("by_auction_house", ["auctionHouseCode"])
    .index("by_price_range", ["startingPrice", "finalPrice"])
    .index("by_auction_status", ["auctionStatus", "auctionDate"])
    .index("by_repair_history", ["repairHistory"])
    .index("by_one_owner", ["oneOwner"])
    .index("by_shaken_expiry", ["shakenExpiryDate"])
    .index("by_seller_type", ["sellerType"])
    .index("by_vehicle_type", ["vehicleTypeDesignation"])
    .index("by_seating_capacity", ["seatingCapacity"])
    .searchIndex("search_vehicles", {
      searchField: "make",
      filterFields: ["model", "overallGrade", "auctionHouseCode", "auctionStatus", "repairHistory", "oneOwner", "sellerType", "engineType"]
    }),

  // Extraction jobs tracking
  extractionJobs: defineTable({
    auctionUrl: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    auctionSheetId: v.optional(v.id("auctionSheets")),
    extractedAt: v.optional(v.number()),
    htmlContent: v.optional(v.string()), // Store HTML for debugging
    aiResponse: v.optional(v.string()), // Store AI response for debugging
    retryCount: v.optional(v.number()),
    
    // Additional metadata
    userAgent: v.optional(v.string()),
    requestedBy: v.optional(v.string()),
    priority: v.optional(v.number()), // For job queue prioritization
  })
    .index("by_status", ["status"])
    .index("by_url", ["auctionUrl"])
    .index("by_auction_sheet", ["auctionSheetId"])
    .index("by_created_time", ["_creationTime"])
    .index("by_status_priority", ["status", "priority"]),

  // Stored images from auction sheets
  auctionImages: defineTable({
    auctionSheetId: v.id("auctionSheets"),
    storageId: v.id("_storage"), // Convex file storage ID
    imageType: v.union(
      v.literal("auction_sheet"), // Main auction sheet image
      v.literal("vehicle_photo"), // Vehicle exterior/interior photos
      v.literal("defect_diagram"), // Defect diagram/markup
      v.literal("document") // Additional documents
    ),
    originalUrl: v.string(), // Original URL from auction site
    filename: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    extractedAt: v.number(),
    
    // Image metadata
    description: v.optional(v.string()),
    position: v.optional(v.number()), // Order/position if multiple images
  })
    .index("by_auction_sheet", ["auctionSheetId"])
    .index("by_image_type", ["imageType"])
    .index("by_extracted_time", ["extractedAt"])
    .index("by_storage_id", ["storageId"]),
});