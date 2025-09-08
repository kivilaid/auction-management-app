"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [mockData, setMockData] = useState<any[]>([]);
  let auctionSheets;
  
  try {
    auctionSheets = useQuery(api.auctionSheets.listAll);
  } catch (error) {
    console.log("Convex not connected, using mock data");
    auctionSheets = mockData;
  }

  // Set up mock data if Convex is not available
  useEffect(() => {
    if (!auctionSheets) {
      setMockData([
        {
          _id: "mock1",
          lotNumber: "1296",
          make: "マツダ",
          model: "CX-5",
          vehicleRegistrationYear: 2020,
          mileageKm: 58500,
          overallGrade: "5",
          startingPrice: 1500000,
          auctionHouseCode: "USS",
          auctionStatus: "upcoming"
        },
        {
          _id: "mock2", 
          lotNumber: "2047",
          make: "トヨタ",
          model: "プリウス", 
          vehicleRegistrationYear: 2019,
          mileageKm: 45200,
          overallGrade: "4.5",
          startingPrice: 1800000,
          auctionHouseCode: "TAA",
          auctionStatus: "sold"
        }
      ]);
    }
  }, [auctionSheets]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Auction Management System</h1>
        <p className="text-xl text-muted-foreground">
          Japanese car auction sheet management
        </p>
        {(!auctionSheets || auctionSheets.length === 0) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📚 <strong>Demo Mode:</strong> To connect to Convex database, run <code className="bg-blue-100 px-1 rounded">npx convex dev</code> in the terminal and follow the setup instructions.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Recent Auction Sheets</h2>
        <Button asChild>
          <a href="/manage">Add New Auction Sheet</a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctionSheets?.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Auction Sheets Found</CardTitle>
              <CardDescription>
                Get started by adding your first auction sheet
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          auctionSheets?.map((sheet) => (
            <Link key={sheet._id} href={`/auction/${sheet._id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Lot #{sheet.lotNumber}
                    </CardTitle>
                    {sheet.overallGrade && (
                      <Badge variant="secondary">{sheet.overallGrade}</Badge>
                    )}
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
                        Mileage: {sheet.mileageKm.toLocaleString()} km
                      </p>
                    )}
                    {sheet.startingPrice && (
                      <p className="font-semibold">
                        Starting Price: ¥{sheet.startingPrice.toLocaleString()}
                      </p>
                    )}
                    {sheet.auctionHouseCode && (
                      <Badge variant="outline">{sheet.auctionHouseCode}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {auctionSheets === undefined && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading auction sheets...</p>
          </div>
        </div>
      )}
    </div>
  );
}