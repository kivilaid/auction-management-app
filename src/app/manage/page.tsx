"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AddAuctionSheetForm } from "@/components/AddAuctionSheetForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function ManagePage() {
  const seedSampleData = useMutation(api.sampleData.seedSampleData);
  const [isSeedingData, setIsSeedingData] = useState(false);

  const handleSeedData = async () => {
    setIsSeedingData(true);
    try {
      const result = await seedSampleData({});
      alert(result.message);
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Convex not connected yet. Please set up Convex deployment first by running: npx convex dev");
    } finally {
      setIsSeedingData(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Auction Management</h1>
        <p className="text-xl text-muted-foreground">
          Add and manage auction sheet data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <AddAuctionSheetForm />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Useful tools and shortcuts for managing auction data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sample Data</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add sample auction sheet data to test the system
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleSeedData}
                  disabled={isSeedingData}
                >
                  {isSeedingData ? "Loading Sample Data..." : "Add Sample Data"}
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Navigation</h4>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/">← Back to Dashboard</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Database</span>
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>Real-time Updates</span>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Schema Version</span>
                  <span className="text-muted-foreground">1.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}