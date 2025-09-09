import { OpenAI } from "openai";
import { z } from "zod";

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key",
});

// Schema for auction sheet data extraction
const AuctionSheetSchema = z.object({
  // Basic auction information
  lot_number: z.string(),
  auction_house_code: z.string().optional(),
  auction_house_name: z.string().optional(),
  auction_date: z.string().optional(),
  auction_location: z.string().optional(),
  
  // Vehicle identification
  vehicle_registration_year: z.number().optional(),
  vehicle_registration_month: z.number().optional(),
  make: z.string(),
  model: z.string(),
  model_code: z.string().optional(),
  chassis_number: z.string().optional(),
  engine_code: z.string().optional(),
  displacement_cc: z.number().optional(),
  fuel_type: z.enum(["ガソリン", "ディーゼル", "ハイブリッド", "EV", "その他"]).optional(),
  
  // Vehicle specifications
  drive_type: z.enum(["FF", "FR", "4WD", "AWD", "MR", "RR"]).optional(),
  transmission_type: z.enum(["AT", "MT", "FAT", "CVT", "その他"]).optional(),
  transmission_speeds: z.number().optional(),
  doors: z.number().optional(),
  steering_position: z.enum(["左", "右"]).optional(),
  body_color: z.string().optional(),
  color_code: z.string().optional(),
  interior_color: z.string().optional(),
  
  // Mileage and condition
  mileage_km: z.number().optional(),
  mileage_unit: z.enum(["km", "miles"]).default("km"),
  mileage_authenticity: z.enum(["正常", "改ざん疑い", "交換歴", "不明"]).default("正常"),
  
  // Auction grades
  overall_grade: z.string().optional(),
  exterior_grade: z.string().optional(),
  interior_grade: z.string().optional(),
  
  // Equipment flags
  equipment_ac: z.boolean().default(false),
  equipment_aac: z.boolean().default(false),
  equipment_ps: z.boolean().default(false),
  equipment_pw: z.boolean().default(false),
  equipment_abs: z.boolean().default(false),
  equipment_airbag: z.boolean().default(false),
  equipment_sr: z.boolean().default(false),
  equipment_aw: z.boolean().default(false),
  equipment_tv: z.boolean().default(false),
  equipment_nav: z.boolean().default(false),
  equipment_leather: z.boolean().default(false),
  equipment_bsm: z.boolean().default(false),
  equipment_radar_cruise: z.boolean().default(false),
  equipment_other: z.string().optional(),
  
  // Inspection and registration
  vehicle_inspection_date: z.string().optional(),
  registration_number: z.string().optional(),
  registration_location: z.string().optional(),
  
  // Pricing information
  starting_price: z.number().optional(),
  reserve_price: z.number().optional(),
  average_price: z.number().optional(),
  final_price: z.number().optional(),
  currency: z.string().default("JPY"),
  
  // Sales information
  recycling_fee: z.number().optional(),
  is_export_eligible: z.boolean().default(true),
  sales_points: z.string().optional(),
  
  // Vehicle defects (simplified to text for now)
  front_bumper_defects: z.string().optional(),
  hood_defects: z.string().optional(),
  front_left_fender_defects: z.string().optional(),
  front_right_fender_defects: z.string().optional(),
  front_left_door_defects: z.string().optional(),
  front_right_door_defects: z.string().optional(),
  windshield_defects: z.string().optional(),
  left_side_defects: z.string().optional(),
  right_side_defects: z.string().optional(),
  rear_left_door_defects: z.string().optional(),
  rear_right_door_defects: z.string().optional(),
  sliding_door_left_defects: z.string().optional(),
  sliding_door_right_defects: z.string().optional(),
  rear_bumper_defects: z.string().optional(),
  trunk_defects: z.string().optional(),
  rear_left_fender_defects: z.string().optional(),
  rear_right_fender_defects: z.string().optional(),
  rear_window_defects: z.string().optional(),
  roof_defects: z.string().optional(),
  front_left_wheel_defects: z.string().optional(),
  front_right_wheel_defects: z.string().optional(),
  rear_left_wheel_defects: z.string().optional(),
  rear_right_wheel_defects: z.string().optional(),
  interior_defects: z.string().optional(),
  engine_defects: z.string().optional(),
  undercarriage_defects: z.string().optional(),
  other_defects: z.string().optional(),
  
  // Defects summary
  total_defect_count: z.number().default(0),
  major_defects_summary: z.string().optional(),
  defect_diagram_notes: z.string().optional(),
  
  // Comments and notes
  inspector_comments: z.string().optional(),
  seller_comments: z.string().optional(),
  auction_house_notes: z.string().optional(),
  condition_report: z.string().optional(),
  additional_notes: z.string().optional(),
  
  // Auction results
  auction_status: z.enum(["upcoming", "sold", "unsold", "cancelled"]).default("upcoming"),
  bid_count: z.number().optional(),
  winning_bidder_location: z.string().optional(),
  sale_date: z.string().optional(),
});

export type AuctionSheetData = z.infer<typeof AuctionSheetSchema>;

export async function extractAuctionSheetData(
  htmlContent: string,
  auctionUrl: string
): Promise<AuctionSheetData> {
  // Check if we have a valid API key
  const apiKey = process.env.OPENAI_API_KEY || "sk-dummy-key";
  
  if (!apiKey || apiKey === "sk-dummy-key") {
    // Return mock data for development/testing
    console.log("Using mock data - no valid OpenAI API key available");
    return createMockAuctionData(auctionUrl, htmlContent);
  }

  const systemPrompt = `You are an expert at extracting data from Japanese car auction sheets. 
You will be provided with HTML content from a Japanese auction sheet page and need to extract all relevant information.

Key information to extract:
- Lot number (usually prominently displayed)
- Vehicle details (make, model, year, etc.)
- Auction grades (overall grade like S, 6, 5, 4.5, etc., and A-F grades for exterior/interior)
- Equipment codes and features (AC, AAC, PS, PW, etc.)
- Defect codes and damage information (A1, B2, U3, etc.)
- Pricing information (starting price, reserve, etc.)
- Comments and notes in both Japanese and English

For defects, look for alphanumeric codes like:
- A1-A4: Minor scratches (線傷)
- U1-U4: Dents (へこみ)
- B1-B4: Dents with scratches (へこみ傷)
- P1-P4: Paint issues (塗装)
- W1-W4: Repair traces (修理跡)
- S1-S4: Rust (錆)
- C1-C4: Corrosion (腐食)
- X: Replacement required (要交換)
- XX: Already replaced (交換済)

Extract all available data and return it in the specified JSON format.`;

  const userPrompt = `Extract all auction sheet data from this HTML content from ${auctionUrl}:

${htmlContent}`;

  // Create OpenAI client with current API key (to avoid caching issues)
  const currentOpenAI = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const response = await currentOpenAI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "auction_sheet_data",
          description: "Extracted auction sheet data",
          schema: {
            type: "object",
            properties: {
              // Map Zod schema to JSON schema format
              lot_number: { type: "string" },
              auction_house_code: { type: "string" },
              auction_house_name: { type: "string" },
              auction_date: { type: "string" },
              auction_location: { type: "string" },
              vehicle_registration_year: { type: "number" },
              vehicle_registration_month: { type: "number" },
              make: { type: "string" },
              model: { type: "string" },
              model_code: { type: "string" },
              chassis_number: { type: "string" },
              engine_code: { type: "string" },
              displacement_cc: { type: "number" },
              fuel_type: { 
                type: "string", 
                enum: ["ガソリン", "ディーゼル", "ハイブリッド", "EV", "その他"] 
              },
              drive_type: { 
                type: "string", 
                enum: ["FF", "FR", "4WD", "AWD", "MR", "RR"] 
              },
              transmission_type: { 
                type: "string", 
                enum: ["AT", "MT", "FAT", "CVT", "その他"] 
              },
              transmission_speeds: { type: "number" },
              doors: { type: "number" },
              steering_position: { 
                type: "string", 
                enum: ["左", "右"] 
              },
              body_color: { type: "string" },
              color_code: { type: "string" },
              interior_color: { type: "string" },
              mileage_km: { type: "number" },
              mileage_unit: { 
                type: "string", 
                enum: ["km", "miles"],
                default: "km"
              },
              mileage_authenticity: { 
                type: "string", 
                enum: ["正常", "改ざん疑い", "交換歴", "不明"],
                default: "正常"
              },
              overall_grade: { type: "string" },
              exterior_grade: { type: "string" },
              interior_grade: { type: "string" },
              equipment_ac: { type: "boolean", default: false },
              equipment_aac: { type: "boolean", default: false },
              equipment_ps: { type: "boolean", default: false },
              equipment_pw: { type: "boolean", default: false },
              equipment_abs: { type: "boolean", default: false },
              equipment_airbag: { type: "boolean", default: false },
              equipment_sr: { type: "boolean", default: false },
              equipment_aw: { type: "boolean", default: false },
              equipment_tv: { type: "boolean", default: false },
              equipment_nav: { type: "boolean", default: false },
              equipment_leather: { type: "boolean", default: false },
              equipment_bsm: { type: "boolean", default: false },
              equipment_radar_cruise: { type: "boolean", default: false },
              equipment_other: { type: "string" },
              vehicle_inspection_date: { type: "string" },
              registration_number: { type: "string" },
              registration_location: { type: "string" },
              starting_price: { type: "number" },
              reserve_price: { type: "number" },
              average_price: { type: "number" },
              final_price: { type: "number" },
              currency: { type: "string", default: "JPY" },
              recycling_fee: { type: "number" },
              is_export_eligible: { type: "boolean", default: true },
              sales_points: { type: "string" },
              // Defect fields
              front_bumper_defects: { type: "string" },
              hood_defects: { type: "string" },
              front_left_fender_defects: { type: "string" },
              front_right_fender_defects: { type: "string" },
              front_left_door_defects: { type: "string" },
              front_right_door_defects: { type: "string" },
              windshield_defects: { type: "string" },
              left_side_defects: { type: "string" },
              right_side_defects: { type: "string" },
              rear_left_door_defects: { type: "string" },
              rear_right_door_defects: { type: "string" },
              sliding_door_left_defects: { type: "string" },
              sliding_door_right_defects: { type: "string" },
              rear_bumper_defects: { type: "string" },
              trunk_defects: { type: "string" },
              rear_left_fender_defects: { type: "string" },
              rear_right_fender_defects: { type: "string" },
              rear_window_defects: { type: "string" },
              roof_defects: { type: "string" },
              front_left_wheel_defects: { type: "string" },
              front_right_wheel_defects: { type: "string" },
              rear_left_wheel_defects: { type: "string" },
              rear_right_wheel_defects: { type: "string" },
              interior_defects: { type: "string" },
              engine_defects: { type: "string" },
              undercarriage_defects: { type: "string" },
              other_defects: { type: "string" },
              total_defect_count: { type: "number", default: 0 },
              major_defects_summary: { type: "string" },
              defect_diagram_notes: { type: "string" },
              inspector_comments: { type: "string" },
              seller_comments: { type: "string" },
              auction_house_notes: { type: "string" },
              condition_report: { type: "string" },
              additional_notes: { type: "string" },
              auction_status: { 
                type: "string", 
                enum: ["upcoming", "sold", "unsold", "cancelled"],
                default: "upcoming"
              },
              bid_count: { type: "number" },
              winning_bidder_location: { type: "string" },
              sale_date: { type: "string" }
            },
            required: ["lot_number", "make", "model"]
          }
        }
      },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedData = JSON.parse(content);
    
    // Validate the data against our schema
    const validatedData = AuctionSheetSchema.parse(parsedData);
    
    return validatedData;
  } catch (error) {
    console.error("Error extracting auction sheet data:", error);
    throw new Error(`Failed to extract auction sheet data: ${error}`);
  }
}

// Mock data function for development/testing when OpenAI API is not available
function createMockAuctionData(auctionUrl: string, htmlContent: string): AuctionSheetData {
  // Extract lot number from URL if possible
  const lotMatch = auctionUrl.match(/aj-([^.]+)/);
  const lotNumber = lotMatch ? lotMatch[1].substring(0, 8) : "TEST001";
  
  // Try to extract some basic info from HTML
  const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "";
  
  // Generate realistic mock data
  const makes = ["Toyota", "Honda", "Nissan", "Mazda", "Subaru", "Mitsubishi"];
  const models = ["Corolla", "Civic", "Altima", "CX-5", "Impreza", "Outlander"];
  const make = makes[Math.floor(Math.random() * makes.length)];
  const model = models[Math.floor(Math.random() * models.length)];
  
  return {
    lot_number: lotNumber,
    auction_house_code: "USS",
    auction_house_name: "USS Auto Auction",
    auction_date: new Date().toISOString().split('T')[0],
    auction_location: "Tokyo",
    vehicle_registration_year: 2020,
    vehicle_registration_month: 6,
    make,
    model,
    model_code: `${make.substring(0,3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    mileage_km: Math.floor(Math.random() * 100000) + 10000,
    mileage_unit: "km",
    mileage_authenticity: "正常",
    overall_grade: ["4.5", "5", "4", "3.5"][Math.floor(Math.random() * 4)],
    exterior_grade: "B",
    interior_grade: "B",
    equipment_ac: true,
    equipment_ps: true,
    equipment_pw: true,
    equipment_nav: Math.random() > 0.5,
    starting_price: Math.floor(Math.random() * 500000) + 100000,
    currency: "JPY",
    is_export_eligible: true,
    auction_status: "upcoming",
    fuel_type: "ガソリン",
    drive_type: "FF",
    transmission_type: "AT",
    doors: 4,
    steering_position: "右",
    body_color: "白",
    seatingCapacity: 5,
    repairHistory: false,
    one_owner: Math.random() > 0.5,
    inspectorComments: "Mock data generated for development testing",
    additionalNotes: `Generated from auction URL: ${auctionUrl}`,
    total_defect_count: 0,
  };
}