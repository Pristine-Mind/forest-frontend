"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useGetAnnualDfoReport,
  useGetHarvestReport,
  useGetSalesReport,
  useGetFundAuditReport,
  useGetGovernanceReport,
  useGetOffenseReportSummary,
  useGetVisitorEntriesReport,
  useGetLivelihoodReport,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function formatCurrency(value?: string) {
  if (!value) return "—";
  return `Rs. ${value}`;
}

function ReportCard({
  title,
  children,
  isLoading,
}: {
  title: string;
  children: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function AnnualDfoReportCard() {
  const { data, isLoading } = useGetAnnualDfoReport();
  return (
    <ReportCard title="Annual DFO Report" isLoading={isLoading}>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-muted-foreground">Members</p><p className="text-lg font-medium">{data?.members ?? 0}</p></div>
        <div><p className="text-muted-foreground">Households</p><p className="text-lg font-medium">{data?.households ?? 0}</p></div>
        <div><p className="text-muted-foreground">Tree Counts</p><p className="text-lg font-medium">{data?.tree_counts ?? 0}</p></div>
        <div><p className="text-muted-foreground">Harvest Requests</p><p className="text-lg font-medium">{data?.harvest_requests ?? 0}</p></div>
        <div><p className="text-muted-foreground">Sales</p><p className="text-lg font-medium">{data?.sales ?? 0}</p></div>
        <div><p className="text-muted-foreground">Visitor Entries</p><p className="text-lg font-medium">{data?.visitor_entries ?? 0}</p></div>
        <div><p className="text-muted-foreground">Official Guests</p><p className="text-lg font-medium">{data?.official_guests ?? 0}</p></div>
        <div><p className="text-muted-foreground">Cash Income</p><p className="text-lg font-medium">{formatCurrency(data?.cash_income)}</p></div>
        <div><p className="text-muted-foreground">Cash Expense</p><p className="text-lg font-medium">{formatCurrency(data?.cash_expense)}</p></div>
      </div>
    </ReportCard>
  );
}

function HarvestReportCard() {
  const { data, isLoading } = useGetHarvestReport();
  return (
    <ReportCard title="Harvest Report" isLoading={isLoading}>
      {data?.harvest_summary && data.harvest_summary.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead>Count</TableHead><TableHead className="text-right">Total Quantity</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.harvest_summary.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.source_type}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{item.status}</Badge></TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell className="text-right font-mono">{item.total_quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No harvest data available.</p>
      )}
    </ReportCard>
  );
}

function SalesReportCard() {
  const { data, isLoading } = useGetSalesReport();
  return (
    <ReportCard title="Sales Report" isLoading={isLoading}>
      {data?.sales_summary && data.sales_summary.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Buyer Type</TableHead><TableHead>Count</TableHead><TableHead className="text-right">Quantity</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.sales_summary.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="capitalize">{item.buyer_type}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell className="text-right font-mono">{item.total_quantity}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.total_amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No sales data available.</p>
      )}
    </ReportCard>
  );
}

function FundAuditReportCard() {
  const { data, isLoading } = useGetFundAuditReport();
  return (
    <ReportCard title="Fund Audit Report" isLoading={isLoading}>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><p className="text-muted-foreground text-sm">Total Income</p><p className="text-lg font-medium">{formatCurrency(data?.total_income)}</p></div>
        <div><p className="text-muted-foreground text-sm">Total Expense</p><p className="text-lg font-medium">{formatCurrency(data?.total_expense)}</p></div>
        <div><p className="text-muted-foreground text-sm">Net</p><p className="text-lg font-medium">{formatCurrency(data?.net)}</p></div>
      </div>
      {data?.audits && data.audits.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Fiscal Year</TableHead><TableHead>Tier</TableHead><TableHead>Auditor</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>{audit.fiscal_year}</TableCell>
                <TableCell className="capitalize">{audit.audit_tier}</TableCell>
                <TableCell>{audit.auditor_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No audits recorded.</p>
      )}
    </ReportCard>
  );
}

function GovernanceReportCard() {
  const { data, isLoading } = useGetGovernanceReport();
  return (
    <ReportCard title="Governance Report" isLoading={isLoading}>
      <div className="grid grid-cols-3 gap-4">
        <div><p className="text-muted-foreground text-sm">Committee Total</p><p className="text-lg font-medium">{data?.committee_total ?? 0}</p></div>
        <div><p className="text-muted-foreground text-sm">Female Members</p><p className="text-lg font-medium">{data?.female_members ?? 0}</p></div>
        <div><p className="text-muted-foreground text-sm">Elections Held</p><p className="text-lg font-medium">{data?.elections_held ?? 0}</p></div>
      </div>
    </ReportCard>
  );
}

function OffenseReportCard() {
  const { data, isLoading } = useGetOffenseReportSummary();
  return (
    <ReportCard title="Offense Report" isLoading={isLoading}>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><p className="text-muted-foreground text-sm">Total Fines</p><p className="text-lg font-medium">{formatCurrency(data?.total_fines)}</p></div>
        <div><p className="text-muted-foreground text-sm">Total Rewards</p><p className="text-lg font-medium">{formatCurrency(data?.total_rewards)}</p></div>
      </div>
      {data?.by_status && data.by_status.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Status</TableHead><TableHead className="text-right">Count</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.by_status.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="capitalize">{item.status?.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-right">{item.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No offense data available.</p>
      )}
    </ReportCard>
  );
}

function VisitorEntriesReportCard() {
  const { data, isLoading } = useGetVisitorEntriesReport();
  return (
    <ReportCard title="Visitor Entries Report" isLoading={isLoading}>
      {data?.visitor_entries && data.visitor_entries.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Purpose</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Total Amount</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.visitor_entries.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="capitalize">{item.visit_purpose?.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-right">{item.count}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.total_amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No visitor entries recorded.</p>
      )}
    </ReportCard>
  );
}

function LivelihoodReportCard() {
  const { data, isLoading } = useGetLivelihoodReport();
  return (
    <ReportCard title="Livelihood Report" isLoading={isLoading}>
      {data?.loans && data.loans.length > 0 ? (
        <>
          <p className="text-sm font-medium mb-2">Revolving Loans</p>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Status</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Total Amount</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.loans.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="capitalize">{item.status}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(item.total_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No livelihood data available.</p>
      )}
    </ReportCard>
  );
}

function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
        <p className="text-muted-foreground mt-2">Comprehensive reports and summaries.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnnualDfoReportCard />
        <HarvestReportCard />
        <SalesReportCard />
        <FundAuditReportCard />
        <GovernanceReportCard />
        <OffenseReportCard />
        <VisitorEntriesReportCard />
        <LivelihoodReportCard />
      </div>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><Reports /></AppLayout></AuthGuard>;
}
