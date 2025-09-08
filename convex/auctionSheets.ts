import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all auction sheets
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auctionSheets").collect();
  },
});

// Query to get auction sheets by make and model
export const getByMakeModel = query({
  args: { 
    make: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("auctionSheets");
    
    if (args.make) {
      query = query.filter((q) => q.eq(q.field("make"), args.make));
    }
    
    if (args.model) {
      query = query.filter((q) => q.eq(q.field("model"), args.model));
    }
    
    return await query.collect();
  },
});

// Query to get auction sheet by ID
export const getById = query({
  args: { id: v.id("auctionSheets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query to get auction sheet by lot number
export const getByLotNumber = query({
  args: { lotNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auctionSheets")
      .filter((q) => q.eq(q.field("lotNumber"), args.lotNumber))
      .first();
  },
});

// Search auction sheets
export const search = query({
  args: { 
    searchTerm: v.string(),
    grade: v.optional(v.string()),
    auctionHouse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("auctionSheets")
      .withSearchIndex("search_vehicles", (q) => {
        let search = q.search("make", args.searchTerm);
        
        if (args.grade) {
          search = search.eq("overallGrade", args.grade);
        }
        
        if (args.auctionHouse) {
          search = search.eq("auctionHouseCode", args.auctionHouse);
        }
        
        return search;
      })
      .collect();
    
    return results;
  },
});

// Mutation to create a new auction sheet
export const create = mutation({
  args: {
    lotNumber: v.string(),
    make: v.string(),
    model: v.string(),
    auctionHouseCode: v.optional(v.string()),
    auctionDate: v.optional(v.string()),
    vehicleRegistrationYear: v.optional(v.number()),
    mileageKm: v.optional(v.number()),
    overallGrade: v.optional(v.string()),
    exteriorGrade: v.optional(v.string()),
    interiorGrade: v.optional(v.string()),
    startingPrice: v.optional(v.number()),
    equipmentAc: v.optional(v.boolean()),
    equipmentNav: v.optional(v.boolean()),
    isExportEligible: v.optional(v.boolean()),
    inspectorComments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if lot number already exists
    const existing = await ctx.db
      .query("auctionSheets")
      .filter((q) => q.eq(q.field("lotNumber"), args.lotNumber))
      .first();
    
    if (existing) {
      throw new Error(`Auction sheet with lot number ${args.lotNumber} already exists`);
    }
    
    const auctionSheetId = await ctx.db.insert("auctionSheets", {
      ...args,
      auctionStatus: "upcoming",
      dataSource: "manual_entry",
      qualityScore: 5,
    });
    
    return auctionSheetId;
  },
});

// Mutation to update an auction sheet
export const update = mutation({
  args: {
    id: v.id("auctionSheets"),
    updates: v.object({
      auctionStatus: v.optional(v.string()),
      finalPrice: v.optional(v.number()),
      bidCount: v.optional(v.number()),
      winningBidderLocation: v.optional(v.string()),
      saleDate: v.optional(v.string()),
      additionalNotes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
    return args.id;
  },
});

// Mutation to delete an auction sheet
export const remove = mutation({
  args: { id: v.id("auctionSheets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});