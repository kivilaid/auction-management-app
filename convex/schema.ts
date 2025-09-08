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
    make: v.string(),
    model: v.string(),
    modelCode: v.optional(v.string()),
    chassisNumber: v.optional(v.string()),
    engineCode: v.optional(v.string()),
    displacementCc: v.optional(v.number()),
    fuelType: v.optional(v.string()),
    
    // Vehicle Specifications
    driveType: v.optional(v.string()),
    transmissionType: v.optional(v.string()),
    transmissionSpeeds: v.optional(v.number()),
    doors: v.optional(v.number()),
    steeringPosition: v.optional(v.string()),
    bodyColor: v.optional(v.string()),
    colorCode: v.optional(v.string()),
    interiorColor: v.optional(v.string()),
    
    // Mileage and Condition
    mileageKm: v.optional(v.number()),
    mileageUnit: v.optional(v.string()),
    mileageAuthenticity: v.optional(v.string()),
    
    // Auction Grades
    overallGrade: v.optional(v.string()),
    exteriorGrade: v.optional(v.string()),
    interiorGrade: v.optional(v.string()),
    
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
    equipmentOther: v.optional(v.string()),
    
    // Inspection and Registration
    vehicleInspectionDate: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    registrationLocation: v.optional(v.string()),
    
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
    .searchIndex("search_vehicles", {
      searchField: "make",
      filterFields: ["model", "overallGrade", "auctionHouseCode", "auctionStatus"]
    }),
});