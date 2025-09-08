"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Car, Gauge, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";
import { use } from "react";

interface AuctionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { id } = use(params);
  const auctionSheet = useQuery(api.auctionSheets.getById, { 
    id: id as Id<"auctionSheets"> 
  });

  if (auctionSheet === undefined) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading auction sheet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (auctionSheet === null) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Auction Sheet Not Found</CardTitle>
            <CardDescription>
              The requested auction sheet could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Lot #{auctionSheet.lotNumber}
            </h1>
            <p className="text-xl text-muted-foreground">
              {auctionSheet.make} {auctionSheet.model}
              {auctionSheet.vehicleRegistrationYear && ` (${auctionSheet.vehicleRegistrationYear})`}
            </p>
          </div>
          
          <div className="flex gap-2">
            {auctionSheet.overallGrade && (
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Grade {auctionSheet.overallGrade}
              </Badge>
            )}
            {auctionSheet.auctionStatus && (
              <Badge variant={
                auctionSheet.auctionStatus === "sold" ? "default" :
                auctionSheet.auctionStatus === "upcoming" ? "outline" : "destructive"
              }>
                {auctionSheet.auctionStatus.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="mr-2 h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Make</p>
                  <p className="text-lg">{auctionSheet.make}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-lg">{auctionSheet.model}</p>
                </div>
                {auctionSheet.vehicleRegistrationYear && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Year</p>
                    <p className="text-lg">{auctionSheet.vehicleRegistrationYear}</p>
                  </div>
                )}
                {auctionSheet.mileageKm && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mileage</p>
                    <p className="text-lg">{auctionSheet.mileageKm.toLocaleString()} km</p>
                  </div>
                )}
                {auctionSheet.fuelType && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fuel Type</p>
                    <p className="text-lg">{auctionSheet.fuelType}</p>
                  </div>
                )}
                {auctionSheet.driveType && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Drive Type</p>
                    <p className="text-lg">{auctionSheet.driveType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grading */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="mr-2 h-5 w-5" />
                Condition & Grading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {auctionSheet.overallGrade && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Overall Grade</p>
                    <Badge variant="secondary" className="text-2xl px-4 py-2 mt-2">
                      {auctionSheet.overallGrade}
                    </Badge>
                  </div>
                )}
                {auctionSheet.exteriorGrade && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Exterior</p>
                    <Badge variant="outline" className="text-xl px-3 py-1 mt-2">
                      {auctionSheet.exteriorGrade}
                    </Badge>
                  </div>
                )}
                {auctionSheet.interiorGrade && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Interior</p>
                    <Badge variant="outline" className="text-xl px-3 py-1 mt-2">
                      {auctionSheet.interiorGrade}
                    </Badge>
                  </div>
                )}
              </div>
              
              {auctionSheet.totalDefectCount !== undefined && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground">Total Defects</p>
                  <p className="text-lg">{auctionSheet.totalDefectCount} defects recorded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {auctionSheet.equipmentAc && <Badge variant="outline">A/C</Badge>}
                {auctionSheet.equipmentAac && <Badge variant="outline">Auto A/C</Badge>}
                {auctionSheet.equipmentPs && <Badge variant="outline">Power Steering</Badge>}
                {auctionSheet.equipmentPw && <Badge variant="outline">Power Windows</Badge>}
                {auctionSheet.equipmentAbs && <Badge variant="outline">ABS</Badge>}
                {auctionSheet.equipmentAirbag && <Badge variant="outline">Airbag</Badge>}
                {auctionSheet.equipmentSr && <Badge variant="outline">Sunroof</Badge>}
                {auctionSheet.equipmentAw && <Badge variant="outline">Alloy Wheels</Badge>}
                {auctionSheet.equipmentNav && <Badge variant="outline">Navigation</Badge>}
                {auctionSheet.equipmentLeather && <Badge variant="outline">Leather Seats</Badge>}
                {auctionSheet.equipmentBsm && <Badge variant="outline">BSM</Badge>}
                {auctionSheet.equipmentRadarCruise && <Badge variant="outline">Radar Cruise</Badge>}
              </div>
              {!auctionSheet.equipmentAc && !auctionSheet.equipmentNav && !auctionSheet.equipmentPs && (
                <p className="text-muted-foreground">No equipment information available</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          {(auctionSheet.inspectorComments || auctionSheet.sellerComments || auctionSheet.additionalNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Comments & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {auctionSheet.inspectorComments && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inspector Comments</p>
                    <p className="text-sm bg-muted p-3 rounded-md mt-1">
                      {auctionSheet.inspectorComments}
                    </p>
                  </div>
                )}
                {auctionSheet.sellerComments && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Seller Comments</p>
                    <p className="text-sm bg-muted p-3 rounded-md mt-1">
                      {auctionSheet.sellerComments}
                    </p>
                  </div>
                )}
                {auctionSheet.additionalNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-md mt-1">
                      {auctionSheet.additionalNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Pricing & Auction Info */}
        <div className="space-y-6">
          
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {auctionSheet.startingPrice && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Starting Price</p>
                  <p className="text-2xl font-bold">¥{auctionSheet.startingPrice.toLocaleString()}</p>
                </div>
              )}
              {auctionSheet.finalPrice && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Final Price</p>
                  <p className="text-xl font-semibold text-green-600">¥{auctionSheet.finalPrice.toLocaleString()}</p>
                </div>
              )}
              {auctionSheet.reservePrice && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reserve Price</p>
                  <p className="text-lg">¥{auctionSheet.reservePrice.toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Auction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {auctionSheet.auctionHouseCode && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Auction House</p>
                  <p className="text-lg">{auctionSheet.auctionHouseCode}</p>
                  {auctionSheet.auctionHouseName && (
                    <p className="text-sm text-muted-foreground">{auctionSheet.auctionHouseName}</p>
                  )}
                </div>
              )}
              {auctionSheet.auctionDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Auction Date</p>
                  <p className="text-lg">{new Date(auctionSheet.auctionDate).toLocaleDateString()}</p>
                </div>
              )}
              {auctionSheet.auctionLocation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-lg flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {auctionSheet.auctionLocation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Status */}
          <Card>
            <CardHeader>
              <CardTitle>Export Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Export Eligible</span>
                <Badge variant={auctionSheet.isExportEligible ? "default" : "secondary"}>
                  {auctionSheet.isExportEligible ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}