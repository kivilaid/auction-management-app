/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auctionExtraction from "../auctionExtraction.js";
import type * as auctionExtractionMutations from "../auctionExtractionMutations.js";
import type * as auctionSheets from "../auctionSheets.js";
import type * as openai from "../openai.js";
import type * as sampleData from "../sampleData.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auctionExtraction: typeof auctionExtraction;
  auctionExtractionMutations: typeof auctionExtractionMutations;
  auctionSheets: typeof auctionSheets;
  openai: typeof openai;
  sampleData: typeof sampleData;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
