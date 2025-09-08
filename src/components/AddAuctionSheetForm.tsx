"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddAuctionSheetForm() {
  const createAuctionSheet = useMutation(api.auctionSheets.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    lotNumber: "",
    make: "",
    model: "",
    auctionHouseCode: "",
    vehicleRegistrationYear: "",
    mileageKm: "",
    overallGrade: "",
    startingPrice: "",
    inspectorComments: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createAuctionSheet({
        lotNumber: formData.lotNumber,
        make: formData.make,
        model: formData.model,
        auctionHouseCode: formData.auctionHouseCode || undefined,
        vehicleRegistrationYear: formData.vehicleRegistrationYear 
          ? parseInt(formData.vehicleRegistrationYear) 
          : undefined,
        mileageKm: formData.mileageKm ? parseInt(formData.mileageKm) : undefined,
        overallGrade: formData.overallGrade || undefined,
        startingPrice: formData.startingPrice ? parseInt(formData.startingPrice) : undefined,
        inspectorComments: formData.inspectorComments || undefined,
        equipmentAc: true,
        isExportEligible: true,
      });
      
      // Reset form
      setFormData({
        lotNumber: "",
        make: "",
        model: "",
        auctionHouseCode: "",
        vehicleRegistrationYear: "",
        mileageKm: "",
        overallGrade: "",
        startingPrice: "",
        inspectorComments: "",
      });
      
      alert("Auction sheet added successfully!");
    } catch (error) {
      console.error("Error adding auction sheet:", error);
      alert("Error adding auction sheet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Add New Auction Sheet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lotNumber">Lot Number *</Label>
              <Input
                id="lotNumber"
                value={formData.lotNumber}
                onChange={(e) => handleChange("lotNumber", e.target.value)}
                required
                placeholder="e.g., 1296"
              />
            </div>
            
            <div>
              <Label htmlFor="auctionHouse">Auction House</Label>
              <Select value={formData.auctionHouseCode} onValueChange={(value) => handleChange("auctionHouseCode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select auction house" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USS">USS</SelectItem>
                  <SelectItem value="TAA">TAA</SelectItem>
                  <SelectItem value="JAA">JAA</SelectItem>
                  <SelectItem value="HAA">HAA</SelectItem>
                  <SelectItem value="MOTA">MOTA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleChange("make", e.target.value)}
                required
                placeholder="e.g., トヨタ"
              />
            </div>
            
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange("model", e.target.value)}
                required
                placeholder="e.g., プリウス"
              />
            </div>
            
            <div>
              <Label htmlFor="year">Registration Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.vehicleRegistrationYear}
                onChange={(e) => handleChange("vehicleRegistrationYear", e.target.value)}
                min="1990"
                max="2025"
                placeholder="2020"
              />
            </div>
            
            <div>
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileageKm}
                onChange={(e) => handleChange("mileageKm", e.target.value)}
                min="0"
                placeholder="58500"
              />
            </div>
            
            <div>
              <Label htmlFor="grade">Overall Grade</Label>
              <Select value={formData.overallGrade} onValueChange={(value) => handleChange("overallGrade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="4.5">4.5</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="3.5">3.5</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="price">Starting Price (¥)</Label>
              <Input
                id="price"
                type="number"
                value={formData.startingPrice}
                onChange={(e) => handleChange("startingPrice", e.target.value)}
                min="0"
                placeholder="1500000"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="comments">Inspector Comments</Label>
            <Input
              id="comments"
              value={formData.inspectorComments}
              onChange={(e) => handleChange("inspectorComments", e.target.value)}
              placeholder="Additional comments..."
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Auction Sheet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}