import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  Download,
  Upload,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  FileText,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from '@/Layout/Provider/DashboardLayout';

const Home = () => {
  // Sample data - replace with real data
  const salesData = [
    { name: 'Jan', actual: 4000, predicted: 4400 },
    { name: 'Feb', actual: 3000, predicted: 3200 },
    { name: 'Mar', actual: 2000, predicted: 2400 },
    { name: 'Apr', actual: 2780, predicted: 2800 },
    { name: 'May', actual: 1890, predicted: 2200 },
    { name: 'Jun', actual: 2390, predicted: 2800 },
  ];

  const customerData = [
    { month: 'Jan', new: 590, returning: 800 },
    { month: 'Feb', new: 868, returning: 900 },
    { month: 'Mar', new: 1397, returning: 1200 },
    { month: 'Apr', new: 1480, returning: 1108 },
    { month: 'May', new: 1520, returning: 1380 },
    { month: 'Jun', new: 1400, returning: 1500 },
  ];

  return (
    <DashboardLayout>
        <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">$84,254.00</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    8.2% from last month
                    </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Sales</p>
                    <h3 className="text-2xl font-bold mt-1">1,245</h3>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                    <ArrowDown className="w-4 h-4 mr-1" />
                    3.1% from last month
                    </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Active Customers</p>
                    <h3 className="text-2xl font-bold mt-1">2,431</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    12.5% from last month
                    </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                    <h3 className="text-2xl font-bold mt-1">24.5%</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    2.1% from last month
                    </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Sales and Predictions Chart */}
        <Card>
            <CardHeader>
            <CardTitle>Sales Performance vs Predictions</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} name="Actual Sales" />
                    <Line type="monotone" dataKey="predicted" stroke="#9333ea" strokeWidth={2} name="Predicted Sales" />
                </LineChart>
                </ResponsiveContainer>
            </div>
            </CardContent>
        </Card>

        {/* Customer Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
            <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="new" fill="#3b82f6" name="New Customers" />
                    <Bar dataKey="returning" fill="#10b981" name="Returning Customers" />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Upload Data</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
                    <Download className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Export Report</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="text-sm font-medium">View Reports</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
                    <Calendar className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Schedule Report</span>
                </button>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    </DashboardLayout>
  );
};

export default Home;