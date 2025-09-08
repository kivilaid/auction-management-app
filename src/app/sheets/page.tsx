"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronUp, 
  ChevronDown, 
  Filter, 
  Download, 
  Search,
  Eye,
  MoreHorizontal,
  DollarSign,
  Gauge,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface Filters {
  make?: string;
  model?: string;
  overallGrade?: string;
  auctionHouseCode?: string;
  auctionStatus?: string;
  repairHistory?: boolean;
  oneOwner?: boolean;
  engineType?: string;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  yearMin?: number;
  yearMax?: number;
}

export default function AuctionSheetsListPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "_creationTime", direction: "desc" });
  const [filters, setFilters] = useState<Filters>({});
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  // Convex queries
  const paginatedData = useQuery(api.auctionSheets.list, {
    paginationOpts: {
      cursor: null,
      numItems: 50,
    },
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  });

  const filterOptions = useQuery(api.auctionSheets.getFilterOptions);
  const stats = useQuery(api.auctionSheets.getStats);

  const sheets = paginatedData?.page || [];

  // Filter sheets by search term locally
  const filteredSheets = sheets.filter(sheet => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      sheet.make?.toLowerCase().includes(searchLower) ||
      sheet.model?.toLowerCase().includes(searchLower) ||
      sheet.lotNumber?.toLowerCase().includes(searchLower) ||
      sheet.vehicleTypeDesignation?.toLowerCase().includes(searchLower) ||
      sheet.inspectorComments?.toLowerCase().includes(searchLower)
    );
  });

  // Sorting handler
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Filter handlers
  const updateFilter = useCallback((key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "" || value === "all" ? undefined : value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
  }, []);

  // Selection handlers
  const toggleSelection = useCallback((sheetId: string) => {
    setSelectedSheets(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(sheetId)) {
        newSelection.delete(sheetId);
      } else {
        newSelection.add(sheetId);
      }
      return newSelection;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedSheets.size === filteredSheets.length) {
      setSelectedSheets(new Set());
    } else {
      setSelectedSheets(new Set(filteredSheets.map(sheet => sheet._id)));
    }
  }, [filteredSheets, selectedSheets.size]);

  // Export handler
  const handleExport = useCallback(() => {
    const dataToExport = selectedSheets.size > 0 
      ? filteredSheets.filter(sheet => selectedSheets.has(sheet._id))
      : filteredSheets;
    
    const csvContent = [
      // CSV headers
      [
        'Lot Number', 'Make', 'Model', 'Year', 'Mileage (km)', 'Grade', 
        'Price (¥)', 'Auction House', 'Status', 'Repair History', 'One Owner'
      ].join(','),
      // CSV data
      ...dataToExport.map(sheet => [
        sheet.lotNumber,
        sheet.make,
        sheet.model,
        sheet.vehicleRegistrationYear || '',
        sheet.mileageKm || '',
        sheet.overallGrade || '',
        sheet.startingPrice || '',
        sheet.auctionHouseCode || '',
        sheet.auctionStatus || '',
        sheet.repairHistory ? 'Yes' : 'No',
        sheet.oneOwner ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auction-sheets-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredSheets, selectedSheets]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Auction Sheets</h1>
          <p className="text-muted-foreground">
            {stats && `${stats.totalSheets} total sheets • Avg. ¥${stats.averagePrice?.toLocaleString()} • ${Math.round(stats.averageMileage/1000)}K km avg`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredSheets.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export ({selectedSheets.size > 0 ? selectedSheets.size : filteredSheets.length})
          </Button>
          <Select value={viewMode} onValueChange={(value: "table" | "cards") => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="cards">Cards</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sheets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSheets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{stats.averagePrice.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Mileage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageMileage/1000)}K km</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.gradeDistribution && Object.entries(stats.gradeDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by make, model, lot number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filters.overallGrade || "all"} onValueChange={(value) => updateFilter('overallGrade', value === 'all' ? undefined : value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {filterOptions?.grades?.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.auctionHouseCode || "all"} onValueChange={(value) => updateFilter('auctionHouseCode', value === 'all' ? undefined : value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="House" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Houses</SelectItem>
                  {filterOptions?.auctionHouses?.map(house => (
                    <SelectItem key={house} value={house}>{house}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.auctionStatus || "all"} onValueChange={(value) => updateFilter('auctionStatus', value === 'all' ? undefined : value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {filterOptions?.statuses?.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Make</Label>
                  <Select value={filters.make || "all"} onValueChange={(value) => updateFilter('make', value === 'all' ? undefined : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any make</SelectItem>
                      {filterOptions?.makes?.map(make => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Select value={filters.model || "all"} onValueChange={(value) => updateFilter('model', value === 'all' ? undefined : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any model</SelectItem>
                      {filterOptions?.models?.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Engine Type</Label>
                  <Select value={filters.engineType || "all"} onValueChange={(value) => updateFilter('engineType', value === 'all' ? undefined : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any engine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any engine</SelectItem>
                      {filterOptions?.engineTypes?.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Features</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={filters.repairHistory === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('repairHistory', filters.repairHistory === false ? undefined : false)}
                    >
                      No Repair
                    </Button>
                    <Button
                      variant={filters.oneOwner === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('oneOwner', filters.oneOwner === true ? undefined : true)}
                    >
                      One Owner
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div>
                  <Label>Price Range (¥)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin || ""}
                      onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax || ""}
                      onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Mileage Range (km)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.mileageMin || ""}
                      onChange={(e) => updateFilter('mileageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.mileageMax || ""}
                      onChange={(e) => updateFilter('mileageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Year Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="From"
                      value={filters.yearMin || ""}
                      onChange={(e) => updateFilter('yearMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="To"
                      value={filters.yearMax || ""}
                      onChange={(e) => updateFilter('yearMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Results ({filteredSheets.length})</CardTitle>
              <CardDescription>
                {selectedSheets.size > 0 && `${selectedSheets.size} selected`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === "table" ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredSheets.length > 0 && selectedSheets.size === filteredSheets.length}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('lotNumber')}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Lot #
                        {sortConfig.key === 'lotNumber' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>House</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSheets.map((sheet) => (
                    <TableRow key={sheet._id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedSheets.has(sheet._id)}
                          onCheckedChange={() => toggleSelection(sheet._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{sheet.lotNumber}</TableCell>
                      <TableCell>{sheet.make} {sheet.model}</TableCell>
                      <TableCell>{sheet.vehicleRegistrationYear || '-'}</TableCell>
                      <TableCell>{sheet.mileageKm ? sheet.mileageKm.toLocaleString() : '-'}</TableCell>
                      <TableCell>
                        {sheet.overallGrade && (
                          <Badge variant="secondary">{sheet.overallGrade}</Badge>
                        )}
                      </TableCell>
                      <TableCell>¥{sheet.startingPrice ? sheet.startingPrice.toLocaleString() : '-'}</TableCell>
                      <TableCell>{sheet.auctionHouseCode || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/auction/${sheet._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(sheet._id)}>
                              Copy ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Cards View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
              {filteredSheets.map((sheet) => (
                <Card key={sheet._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Lot #{sheet.lotNumber}</CardTitle>
                        <CardDescription>
                          {sheet.make} {sheet.model}
                          {sheet.vehicleRegistrationYear && ` (${sheet.vehicleRegistrationYear})`}
                        </CardDescription>
                      </div>
                      <Checkbox
                        checked={selectedSheets.has(sheet._id)}
                        onCheckedChange={() => toggleSelection(sheet._id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sheet.mileageKm && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        {sheet.mileageKm.toLocaleString()} km
                      </div>
                    )}
                    {sheet.startingPrice && (
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        ¥{sheet.startingPrice.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
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
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/auction/${sheet._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredSheets.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No auction sheets found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or add some data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}