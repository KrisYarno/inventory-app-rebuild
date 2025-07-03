"use client";

import { useState, useEffect, useRef } from "react";
import { MetricsCard } from "@/components/reports/metrics-card";
import { ActivityTimeline } from "@/components/reports/activity-timeline";
import { ProductPerformance } from "@/components/reports/product-performance";
import { UserActivity } from "@/components/reports/user-activity";
import { LowStockAlert } from "@/components/reports/low-stock-alert";
import { LineChartComponent, ActivityBarChart } from "@/components/reports/inventory-chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  RefreshCw, 
  Package, 
  AlertTriangle,
  DollarSign,
  FileDown,
  Image
} from "lucide-react";
import { DashboardMetrics, StockLevelChartData, ActivityChartData } from "@/types/reports";
import { useLocation } from "@/contexts/location-context";
import { DateRangePicker, DateRangePreset } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { exportToCSV, exportChartAsImage, generateExportFilename } from "@/lib/export-utils";
import { DrillDownModal } from "@/components/reports/drill-down-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [inventoryTrends, setInventoryTrends] = useState<StockLevelChartData[]>([]);
  const [dailyActivity, setDailyActivity] = useState<ActivityChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date()),
  });
  const [datePreset, setDatePreset] = useState<DateRangePreset>("last7days");
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    type: "product" | "date" | "user" | "location";
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: "product",
    title: "",
    data: null,
  });
  
  const { selectedLocationId } = useLocation();
  const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchAllData();
  }, [selectedLocationId, dateRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchInventoryTrends(),
        fetchDailyActivity()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      if (selectedLocationId) {
        params.append("locationId", selectedLocationId.toString());
      }
      
      const response = await fetch(`/api/reports/metrics?${params}`);
      if (!response.ok) throw new Error("Failed to fetch metrics");
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const fetchInventoryTrends = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      if (selectedLocationId) {
        params.append("locationId", selectedLocationId.toString());
      }
      
      const response = await fetch(`/api/reports/inventory-trends?${params}`);
      if (!response.ok) throw new Error("Failed to fetch inventory trends");
      const data = await response.json();
      setInventoryTrends(data.data);
    } catch (error) {
      console.error("Error fetching inventory trends:", error);
    }
  };

  const fetchDailyActivity = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      if (selectedLocationId) {
        params.append("locationId", selectedLocationId.toString());
      }
      
      const response = await fetch(`/api/reports/daily-activity?${params}`);
      if (!response.ok) throw new Error("Failed to fetch daily activity");
      const data = await response.json();
      setDailyActivity(data.data);
    } catch (error) {
      console.error("Error fetching daily activity:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };
  
  const handleDateRangeChange = (newDateRange: DateRange | undefined, preset: DateRangePreset) => {
    setDateRange(newDateRange);
    setDatePreset(preset);
  };
  
  const handleExportMetrics = () => {
    if (!metrics) return;
    
    const filename = generateExportFilename("metrics", "csv", dateRange);
    const data = [
      {
        metric: "Total Products",
        value: metrics.totalProducts,
        additional: `${metrics.activeProducts} active`,
      },
      {
        metric: "Total Stock",
        value: metrics.totalStockQuantity,
        additional: "Units in inventory",
      },
      {
        metric: "Inventory Value",
        value: `$${metrics.totalInventoryValue.toLocaleString()}`,
        additional: "Estimated value",
      },
      {
        metric: "Low Stock Items",
        value: metrics.lowStockProducts,
        additional: "Below threshold",
      },
    ];
    
    exportToCSV(data, filename, [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
      { key: "additional", label: "Details" },
    ]);
  };
  
  const handleExportChart = async (chartId: string, chartName: string) => {
    const chartElement = chartRefs.current[chartId];
    if (!chartElement) return;
    
    const filename = generateExportFilename(chartName, "png", dateRange);
    await exportChartAsImage(chartElement, filename);
  };
  
  const handleDrillDown = async (type: "product" | "date" | "user" | "location", identifier: string, title: string) => {
    // Fetch detailed data based on type
    try {
      let data = null;
      const params = new URLSearchParams();
      
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      
      switch (type) {
        case "product":
          const productResponse = await fetch(`/api/reports/product-details/${identifier}?${params}`);
          data = await productResponse.json();
          break;
        case "date":
          params.append("date", identifier);
          const dateResponse = await fetch(`/api/reports/date-details?${params}`);
          data = await dateResponse.json();
          break;
        case "user":
          const userResponse = await fetch(`/api/reports/user-details/${identifier}?${params}`);
          data = await userResponse.json();
          break;
        case "location":
          const locationResponse = await fetch(`/api/reports/location-details/${identifier}?${params}`);
          data = await locationResponse.json();
          break;
      }
      
      setDrillDownModal({
        isOpen: true,
        type,
        title,
        data,
      });
    } catch (error) {
      console.error("Error fetching drill-down data:", error);
    }
  };
  
  const closeDrillDownModal = () => {
    setDrillDownModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-background px-6 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
              <p className="text-sm text-muted-foreground">
                Analytics and insights for your inventory
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportMetrics}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Metrics (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportChart("inventory-trend", "inventory-trend")}>
                    <Image className="h-4 w-4 mr-2" />
                    Export Inventory Trend (PNG)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportChart("daily-activity", "daily-activity")}>
                    <Image className="h-4 w-4 mr-2" />
                    Export Daily Activity (PNG)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <DateRangePicker
              date={dateRange}
              onDateChange={handleDateRangeChange}
            />
            <div className="text-sm text-muted-foreground">
              {dateRange?.from && dateRange?.to && (
                <span>
                  Showing data from {format(dateRange.from, "MMM dd, yyyy")} to {format(dateRange.to, "MMM dd, yyyy")}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="Total Products"
              value={metrics?.totalProducts || 0}
              subtitle={`${metrics?.activeProducts || 0} active`}
              icon={<Package className="h-4 w-4" />}
            />
            <MetricsCard
              title="Total Stock"
              value={metrics?.totalStockQuantity.toLocaleString() || 0}
              subtitle="Units in inventory"
              icon={<Package className="h-4 w-4" />}
            />
            <MetricsCard
              title="Inventory Value"
              value={`$${(metrics?.totalInventoryValue || 0).toLocaleString()}`}
              subtitle="Estimated value"
              icon={<DollarSign className="h-4 w-4" />}
            />
            <MetricsCard
              title="Low Stock Items"
              value={metrics?.lowStockProducts || 0}
              subtitle="Below threshold"
              icon={<AlertTriangle className="h-4 w-4" />}
              trend={metrics?.lowStockProducts ? {
                value: 12,
                direction: 'up'
              } : undefined}
            />
          </div>

          {/* Tabs for different report sections */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div ref={(el) => { chartRefs.current["inventory-trend"] = el; }}>
                  <LineChartComponent
                    data={inventoryTrends}
                    title="Inventory Trend"
                    description={`Total stock levels (${dateRange?.from && dateRange?.to ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}` : ""})`}
                    onClick={(data) => {
                      // Convert the display date back to ISO format for the API
                      const dateMatch = data.date.match(/(\w+)\s(\d+)/);
                      if (dateMatch && dateRange?.from) {
                        const targetDate = new Date(dateRange.from);
                        targetDate.setDate(parseInt(dateMatch[2]));
                        handleDrillDown("date", targetDate.toISOString().split('T')[0], `Details for ${data.date}`);
                      }
                    }}
                  />
                </div>
                <div ref={(el) => { chartRefs.current["daily-activity"] = el; }}>
                  <ActivityBarChart
                    data={dailyActivity}
                    title="Daily Activity"
                    description="Stock movements by type"
                    onClick={(data) => {
                      // Convert the display date back to ISO format for the API
                      const dateMatch = data.date.match(/(\w+)\s(\d+)/);
                      if (dateMatch && dateRange?.from) {
                        const targetDate = new Date(dateRange.from);
                        targetDate.setDate(parseInt(dateMatch[2]));
                        handleDrillDown("date", targetDate.toISOString().split('T')[0], `Activity on ${data.date}`);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Activity and Alerts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ActivityTimeline />
                <LowStockAlert />
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <ProductPerformance />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ActivityTimeline />
                </div>
                <div>
                  <LowStockAlert />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserActivity />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={closeDrillDownModal}
        title={drillDownModal.title}
        type={drillDownModal.type}
        data={drillDownModal.data}
      />
    </div>
  );
}