import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all auction sheets with pagination, sorting, and filtering
export const list = query({
  args: {
    paginationOpts: v.optional(v.object({
      cursor: v.union(v.string(), v.null()),
      numItems: v.number(),
    })),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    filters: v.optional(v.object({
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      overallGrade: v.optional(v.string()),
      auctionHouseCode: v.optional(v.string()),
      auctionStatus: v.optional(v.string()),
      repairHistory: v.optional(v.boolean()),
      oneOwner: v.optional(v.boolean()),
      engineType: v.optional(v.string()),
      priceMin: v.optional(v.number()),
      priceMax: v.optional(v.number()),
      mileageMin: v.optional(v.number()),
      mileageMax: v.optional(v.number()),
      yearMin: v.optional(v.number()),
      yearMax: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("auctionSheets");

    // Apply filters
    if (args.filters) {
      const filters = args.filters;
      
      if (filters.make) {
        query = query.filter((q) => q.eq(q.field("make"), filters.make));
      }
      if (filters.model) {
        query = query.filter((q) => q.eq(q.field("model"), filters.model));
      }
      if (filters.overallGrade) {
        query = query.filter((q) => q.eq(q.field("overallGrade"), filters.overallGrade));
      }
      if (filters.auctionHouseCode) {
        query = query.filter((q) => q.eq(q.field("auctionHouseCode"), filters.auctionHouseCode));
      }
      if (filters.auctionStatus) {
        query = query.filter((q) => q.eq(q.field("auctionStatus"), filters.auctionStatus));
      }
      if (filters.repairHistory !== undefined) {
        query = query.filter((q) => q.eq(q.field("repairHistory"), filters.repairHistory));
      }
      if (filters.oneOwner !== undefined) {
        query = query.filter((q) => q.eq(q.field("oneOwner"), filters.oneOwner));
      }
      if (filters.engineType) {
        query = query.filter((q) => q.eq(q.field("engineType"), filters.engineType));
      }
      if (filters.priceMin !== undefined) {
        query = query.filter((q) => q.gte(q.field("startingPrice"), filters.priceMin!));
      }
      if (filters.priceMax !== undefined) {
        query = query.filter((q) => q.lte(q.field("startingPrice"), filters.priceMax!));
      }
      if (filters.mileageMin !== undefined) {
        query = query.filter((q) => q.gte(q.field("mileageKm"), filters.mileageMin!));
      }
      if (filters.mileageMax !== undefined) {
        query = query.filter((q) => q.lte(q.field("mileageKm"), filters.mileageMax!));
      }
      if (filters.yearMin !== undefined) {
        query = query.filter((q) => q.gte(q.field("vehicleRegistrationYear"), filters.yearMin!));
      }
      if (filters.yearMax !== undefined) {
        query = query.filter((q) => q.lte(q.field("vehicleRegistrationYear"), filters.yearMax!));
      }
    }

    // Apply pagination
    if (args.paginationOpts) {
      return await query.order("desc").paginate(args.paginationOpts);
    }

    return { 
      page: await query.order("desc").take(50), // Default limit of 50 items
      isDone: false,
      continueCursor: null
    };
  },
});

// Simple list query for basic use cases
export const listAll = query({
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

// Advanced search with pagination
export const search = query({
  args: { 
    searchTerm: v.string(),
    filters: v.optional(v.object({
      overallGrade: v.optional(v.string()),
      auctionHouseCode: v.optional(v.string()),
      auctionStatus: v.optional(v.string()),
      repairHistory: v.optional(v.boolean()),
      oneOwner: v.optional(v.boolean()),
      engineType: v.optional(v.string()),
    })),
    paginationOpts: v.optional(v.object({
      cursor: v.union(v.string(), v.null()),
      numItems: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    let searchQuery = ctx.db
      .query("auctionSheets")
      .withSearchIndex("search_vehicles", (q) => {
        let search = q.search("make", args.searchTerm);
        
        if (args.filters?.overallGrade) {
          search = search.eq("overallGrade", args.filters.overallGrade);
        }
        
        if (args.filters?.auctionHouseCode) {
          search = search.eq("auctionHouseCode", args.filters.auctionHouseCode);
        }
        
        if (args.filters?.auctionStatus) {
          search = search.eq("auctionStatus", args.filters.auctionStatus);
        }
        
        if (args.filters?.repairHistory !== undefined) {
          search = search.eq("repairHistory", args.filters.repairHistory);
        }
        
        if (args.filters?.oneOwner !== undefined) {
          search = search.eq("oneOwner", args.filters.oneOwner);
        }
        
        if (args.filters?.engineType) {
          search = search.eq("engineType", args.filters.engineType);
        }
        
        return search;
      });
    
    if (args.paginationOpts) {
      return await searchQuery.paginate(args.paginationOpts);
    }
    
    return { 
      page: await searchQuery.take(50),
      isDone: false,
      continueCursor: null
    };
  },
});

// Get distinct values for filters
export const getFilterOptions = query({
  args: {},
  handler: async (ctx) => {
    const sheets = await ctx.db.query("auctionSheets").collect();
    
    const makes = [...new Set(sheets.map(s => s.make).filter(Boolean))];
    const models = [...new Set(sheets.map(s => s.model).filter(Boolean))];
    const grades = [...new Set(sheets.map(s => s.overallGrade).filter(Boolean))];
    const auctionHouses = [...new Set(sheets.map(s => s.auctionHouseCode).filter(Boolean))];
    const engineTypes = [...new Set(sheets.map(s => s.engineType).filter(Boolean))];
    const statuses = [...new Set(sheets.map(s => s.auctionStatus).filter(Boolean))];
    
    return {
      makes: makes.sort(),
      models: models.sort(),
      grades: grades.sort(),
      auctionHouses: auctionHouses.sort(),
      engineTypes: engineTypes.sort(),
      statuses: statuses.sort(),
    };
  },
});

// Get aggregate statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const sheets = await ctx.db.query("auctionSheets").collect();
    
    const totalSheets = sheets.length;
    const averagePrice = sheets.reduce((sum, s) => sum + (s.startingPrice || 0), 0) / (sheets.filter(s => s.startingPrice).length || 1);
    const averageMileage = sheets.reduce((sum, s) => sum + (s.mileageKm || 0), 0) / (sheets.filter(s => s.mileageKm).length || 1);
    
    const gradeDistribution = sheets.reduce((acc, s) => {
      if (s.overallGrade) {
        acc[s.overallGrade] = (acc[s.overallGrade] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const statusDistribution = sheets.reduce((acc, s) => {
      if (s.auctionStatus) {
        acc[s.auctionStatus] = (acc[s.auctionStatus] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalSheets,
      averagePrice: Math.round(averagePrice),
      averageMileage: Math.round(averageMileage),
      gradeDistribution,
      statusDistribution,
    };
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