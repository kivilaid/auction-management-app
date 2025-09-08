"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  scheduleAuctionExtraction, 
  getExtractionJobs, 
  getExtractionJobStatus,
  retryFailedExtraction,
  type ExtractionJobResult 
} from "@/lib/auctionActions";
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

interface Job {
  id: string;
  auctionUrl: string;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  auctionSheetId?: string;
  extractedAt?: number;
  retryCount?: number;
  createdAt: number;
  auctionSheet?: {
    id: string;
    lotNumber: string;
    make: string;
    model: string;
    overallGrade?: string;
    mileageKm?: number;
  };
}

export default function AuctionExtractionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionJobResult | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    auctionUrl: "",
    username: "kivilaid",
    password: "L00serl00ser",
    priority: "1",
    requestedBy: "admin",
  });

  // Load jobs on component mount and periodically
  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const loadJobs = async () => {
    try {
      const response = await getExtractionJobs(
        50, 
        selectedStatus === "all" ? undefined : selectedStatus
      );
      
      if (response.success) {
        setJobs(response.jobs);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    try {
      const response = await scheduleAuctionExtraction(formDataObj);
      setResult(response);
      
      if (response.success) {
        // Clear form on success
        setFormData(prev => ({ ...prev, auctionUrl: "" }));
        // Refresh jobs list
        await loadJobs();
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to schedule extraction",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    const formDataObj = new FormData();
    formDataObj.append("jobId", jobId);
    formDataObj.append("username", formData.username);
    formDataObj.append("password", formData.password);

    try {
      const response = await retryFailedExtraction(formDataObj);
      setResult(response);
      
      if (response.success) {
        await loadJobs();
      }
    } catch (error) {
      console.error("Error retrying extraction:", error);
    }
  };

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Job["status"]) => {
    const variants = {
      completed: "default" as const,
      failed: "destructive" as const,
      processing: "secondary" as const,
      pending: "outline" as const,
    };
    
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auction Data Extraction</h1>
        <Button 
          variant="outline" 
          onClick={loadJobs}
          disabled={jobsLoading}
        >
          {jobsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="extract" className="space-y-4">
        <TabsList>
          <TabsTrigger value="extract">New Extraction</TabsTrigger>
          <TabsTrigger value="jobs">Extraction Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="extract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Auction Data Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auctionUrl">Auction URL *</Label>
                    <Input
                      id="auctionUrl"
                      type="url"
                      value={formData.auctionUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, auctionUrl: e.target.value }))}
                      placeholder="https://auc.autoworldjapan.com/aj-..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Low (1)</SelectItem>
                        <SelectItem value="5">Normal (5)</SelectItem>
                        <SelectItem value="10">High (10)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="requestedBy">Requested By</Label>
                    <Input
                      id="requestedBy"
                      value={formData.requestedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Extraction"
                  )}
                </Button>
              </form>

              {result && (
                <Alert className={`mt-4 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>{result.message}</p>
                      {result.jobId && (
                        <p className="text-sm text-gray-600">Job ID: {result.jobId}</p>
                      )}
                      {result.auctionSheetId && (
                        <p className="text-sm text-gray-600">Auction Sheet ID: {result.auctionSheetId}</p>
                      )}
                      {result.error && (
                        <p className="text-sm text-red-600">Error: {result.error}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Extraction Jobs</h2>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {jobsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No extraction jobs found
                </CardContent>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        {job.retryCount && job.retryCount > 0 && (
                          <Badge variant="outline">Retry {job.retryCount}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(job.createdAt)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Auction URL:</Label>
                        <p className="text-sm break-all">{job.auctionUrl}</p>
                      </div>

                      {job.auctionSheet && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <Label className="text-xs">Lot:</Label>
                            <p>{job.auctionSheet.lotNumber}</p>
                          </div>
                          <div>
                            <Label className="text-xs">Vehicle:</Label>
                            <p>{job.auctionSheet.make} {job.auctionSheet.model}</p>
                          </div>
                          <div>
                            <Label className="text-xs">Grade:</Label>
                            <p>{job.auctionSheet.overallGrade || "N/A"}</p>
                          </div>
                          <div>
                            <Label className="text-xs">Mileage:</Label>
                            <p>{job.auctionSheet.mileageKm ? `${job.auctionSheet.mileageKm.toLocaleString()} km` : "N/A"}</p>
                          </div>
                        </div>
                      )}

                      {job.errorMessage && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {job.errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}

                      {job.extractedAt && (
                        <div className="text-sm text-gray-500">
                          Extracted: {formatDate(job.extractedAt)}
                        </div>
                      )}
                    </div>

                    {job.status === "failed" && (
                      <div className="mt-3 pt-3 border-t">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRetry(job.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}