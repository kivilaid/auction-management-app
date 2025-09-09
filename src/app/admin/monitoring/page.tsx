"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Activity, Database, Image, FileText, AlertCircle } from "lucide-react";

interface SystemStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalAuctionSheets: number;
  totalImages: number;
}

export default function MonitoringPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the Convex query
      // const stats = await convex.query(api.extractionJobProcessorMutations.getSystemHealth);
      
      // Mock data for demonstration
      const mockStats: SystemStats = {
        pending: Math.floor(Math.random() * 10),
        processing: Math.floor(Math.random() * 5),
        completed: 150 + Math.floor(Math.random() * 50),
        failed: Math.floor(Math.random() * 15),
        totalAuctionSheets: 200 + Math.floor(Math.random() * 100),
        totalImages: 800 + Math.floor(Math.random() * 400),
      };
      
      setStats(mockStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading system stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  const totalJobs = stats ? stats.pending + stats.processing + stats.completed + stats.failed : 0;
  const successRate = totalJobs > 0 ? (stats!.completed / totalJobs) * 100 : 0;
  const failureRate = totalJobs > 0 ? (stats!.failed / totalJobs) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {successRate.toFixed(1)}%
            </div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failureRate.toFixed(1)}%
            </div>
            <Progress 
              value={failureRate} 
              className="mt-2 [&>div]:bg-red-500" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time extractions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats ? stats.pending + stats.processing : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending + Processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Job Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="w-full justify-center">
                <RefreshCw className="h-3 w-3 mr-1" />
                Pending
              </Badge>
              <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            </div>
            
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="w-full justify-center">
                <Activity className="h-3 w-3 mr-1" />
                Processing
              </Badge>
              <div className="text-2xl font-bold text-blue-600">{stats?.processing || 0}</div>
            </div>
            
            <div className="text-center space-y-2">
              <Badge variant="default" className="w-full justify-center bg-green-600">
                <Activity className="h-3 w-3 mr-1" />
                Completed
              </Badge>
              <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
            </div>
            
            <div className="text-center space-y-2">
              <Badge variant="destructive" className="w-full justify-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Failed
              </Badge>
              <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auction Sheets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalAuctionSheets.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully extracted and stored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images Stored</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalImages.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Auction photos and documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {stats && stats.failed > 10 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            High number of failed jobs detected ({stats.failed}). Consider checking system logs or retrying failed extractions.
          </AlertDescription>
        </Alert>
      )}

      {stats && stats.processing > 10 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Large number of jobs currently processing ({stats.processing}). System performance may be impacted.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}