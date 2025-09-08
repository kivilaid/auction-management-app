"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedAuctionHouse, setSelectedAuctionHouse] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [repairHistoryFilter, setRepairHistoryFilter] = useState("");
  const [oneOwnerFilter, setOneOwnerFilter] = useState("");
  const [engineTypeFilter, setEngineTypeFilter] = useState("");

  // Get all auction sheets for filtering
  const allAuctionSheets = useQuery(api.auctionSheets.listAll);
  
  // Get filtered results based on make/model
  const filteredResults = useQuery(api.auctionSheets.getByMakeModel, {
    make: makeFilter || undefined,
    model: modelFilter || undefined,
  });

  const results = filteredResults || allAuctionSheets || [];

  // Further filter results based on all filters
  const finalResults = results.filter(sheet => {
    if (selectedGrade && sheet.overallGrade !== selectedGrade) return false;
    if (selectedAuctionHouse && sheet.auctionHouseCode !== selectedAuctionHouse) return false;
    if (repairHistoryFilter && sheet.repairHistory !== (repairHistoryFilter === "true")) return false;
    if (oneOwnerFilter && sheet.oneOwner !== (oneOwnerFilter === "true")) return false;
    if (engineTypeFilter && sheet.engineType !== engineTypeFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        sheet.make?.toLowerCase().includes(searchLower) ||
        sheet.model?.toLowerCase().includes(searchLower) ||
        sheet.lotNumber?.toLowerCase().includes(searchLower) ||
        sheet.vehicleTypeDesignation?.toLowerCase().includes(searchLower) ||
        sheet.inspectorComments?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleSearch = () => {
    // Search is real-time, so this just provides user feedback
    console.log("Searching with filters:", {
      searchTerm,
      selectedGrade,
      selectedAuctionHouse,
      makeFilter,
      modelFilter,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGrade("");
    setSelectedAuctionHouse("");
    setMakeFilter("");
    setModelFilter("");
    setRepairHistoryFilter("");
    setOneOwnerFilter("");
    setEngineTypeFilter("");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Auction Sheets</h1>
        <p className="text-xl text-muted-foreground">
          Find vehicles by make, model, grade, and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>
                Narrow down your results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search Term</Label>
                <Input
                  id="search"
                  placeholder="Search make, model, lot number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  placeholder="e.g., トヨタ, ホンダ"
                  value={makeFilter}
                  onChange={(e) => setMakeFilter(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., プリウス, CX-5"
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                />
              </div>

              <div>
                <Label>Overall Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any grade</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="4.5">4.5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3.5">3.5</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Auction House</Label>
                <Select value={selectedAuctionHouse} onValueChange={setSelectedAuctionHouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any auction house" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any auction house</SelectItem>
                    <SelectItem value="USS">USS</SelectItem>
                    <SelectItem value="TAA">TAA</SelectItem>
                    <SelectItem value="JAA">JAA</SelectItem>
                    <SelectItem value="HAA">HAA</SelectItem>
                    <SelectItem value="MOTA">MOTA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Repair History (修復歴)</Label>
                <Select value={repairHistoryFilter} onValueChange={setRepairHistoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any repair history" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any repair history</SelectItem>
                    <SelectItem value="false">No Repair History (修復歴無)</SelectItem>
                    <SelectItem value="true">Has Repair History (修復歴有)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>One Owner</Label>
                <Select value={oneOwnerFilter} onValueChange={setOneOwnerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any owner count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any owner count</SelectItem>
                    <SelectItem value="true">One Owner Only</SelectItem>
                    <SelectItem value="false">Multiple Owners</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Engine Type</Label>
                <Select value={engineTypeFilter} onValueChange={setEngineTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any engine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any engine type</SelectItem>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="e:HEV">e:HEV</SelectItem>
                    <SelectItem value="EV">Electric</SelectItem>
                    <SelectItem value="Turbo">Turbo</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4">
                <Button onClick={handleSearch} className="w-full">
                  Search ({finalResults.length} results)
                </Button>
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              Search Results ({finalResults.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finalResults.length === 0 ? (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>No Results Found</CardTitle>
                  <CardDescription>
                    Try adjusting your search filters or add some sample data
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              finalResults.map((sheet) => (
                <Card key={sheet._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        Lot #{sheet.lotNumber}
                      </CardTitle>
                      <div className="flex gap-1">
                        {sheet.overallGrade && (
                          <Badge variant="secondary">{sheet.overallGrade}</Badge>
                        )}
                        {sheet.auctionStatus && (
                          <Badge variant={
                            sheet.auctionStatus === "sold" ? "default" :
                            sheet.auctionStatus === "upcoming" ? "outline" : "destructive"
                          }>
                            {sheet.auctionStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {sheet.make} {sheet.model}
                      {sheet.vehicleRegistrationYear && ` (${sheet.vehicleRegistrationYear})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {sheet.mileageKm && (
                        <p className="text-muted-foreground">
                          📏 {sheet.mileageKm.toLocaleString()} km
                        </p>
                      )}
                      {sheet.startingPrice && (
                        <p className="font-semibold">
                          💰 ¥{sheet.startingPrice.toLocaleString()}
                        </p>
                      )}
                      {sheet.auctionHouseCode && (
                        <p className="text-muted-foreground">
                          🏛️ {sheet.auctionHouseCode}
                        </p>
                      )}
                      {sheet.totalDefectCount !== undefined && (
                        <p className="text-muted-foreground">
                          🔧 {sheet.totalDefectCount} defects
                        </p>
                      )}
                      {sheet.inspectorComments && (
                        <p className="text-xs text-muted-foreground italic mt-2">
                          "{sheet.inspectorComments}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}