"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemberStats } from "@/types/member-stats";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function MemberActivityChart({ stats }: { stats: MemberStats }) {
  const data = [
    {
      name: "Renewals",
      count: stats.renewals_count,
    },
    {
      name: "Fee Collections",
      count: stats.fee_collections_count,
    },
    {
      name: "Harvest Requests",
      count: stats.harvest_requests_count,
    },
    {
      name: "Sales",
      count: stats.sales_count,
    },
    {
      name: "Patrols",
      count: stats.patrol_logs_count,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Member Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HouseholdCompositionChart({ stats }: { stats: MemberStats }) {
  const household = stats.household_details;

  const genderData = [
    { name: "Male", value: household.population_male },
    { name: "Female", value: household.population_female },
  ];

  const livestockData = [
    { name: "Cattle", value: household.livestock_cattle },
    { name: "Buffalo", value: household.livestock_buffalo },
    { name: "Goat", value: household.livestock_goat },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Livestock Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={livestockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {livestockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function HarvestStatusChart({ stats }: { stats: MemberStats }) {
  const data = [
    { name: "Approved", value: stats.harvest_requests_approved },
    { name: "Pending", value: stats.harvest_requests_pending },
    {
      name: "Rejected",
      value:
        stats.harvest_requests_count -
        stats.harvest_requests_approved -
        stats.harvest_requests_pending,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Harvest Request Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function FinancialPerformanceChart({ stats }: { stats: MemberStats }) {
  const data = [
    {
      name: "Renewals",
      amount: parseFloat(stats.total_renewal_fees_paid || "0"),
    },
    {
      name: "Fee Collections",
      amount: parseFloat(stats.total_fees_collected || "0"),
    },
    {
      name: "Sales",
      amount: parseFloat(stats.total_sales_amount || "0"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Financial Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => `NPR ${value?.toFixed(2)}`} />
            <Bar dataKey="amount" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
