"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListStockLedgers, useListSales } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import {
  useFiscalYearSummary,
  useFiscalYearAnalysis,
  useStockIn,
  useStockLeft,
  useCarryoverFromPreviousYear,
} from "@/lib/api-inventory-fiscal-year";

function Inventory() {
  const { data: stock, isLoading: isStockLoading } = useListStockLedgers();
  const { data: sales, isLoading: isSalesLoading } = useListSales({ limit: 5 });
  const { can } = useAuthStore();

  // Fiscal Year Stock APIs
  const { data: summary, isLoading: isSummaryLoading } = useFiscalYearSummary();
  const { data: analysis, isLoading: isAnalysisLoading } = useFiscalYearAnalysis();
  const { data: stockInData, isLoading: isStockInLoading } = useStockIn();
  const { data: stockLeftData, isLoading: isStockLeftLoading } = useStockLeft();
  const { data: carryoverData, isLoading: isCarryoverLoading } = useCarryoverFromPreviousYear();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory & Sales</h1>
        <p className="text-muted-foreground mt-2">Manage forest product inventory and recent sales.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Stock</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/inventory/ledgers/new">Add Stock Entry</Link></Button>}
          </CardHeader>
          <CardContent>
            {isStockLoading ? <div>Loading...</div> : (
              <Table>
                <TableHeader><TableRow><TableHead>Species</TableHead><TableHead>Grade</TableHead><TableHead className="text-right">Available Qty</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {stock?.results.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.species_name}</TableCell>
                      <TableCell>{s.grade}</TableCell>
                      <TableCell className="text-right font-mono">{s.quantity_available}</TableCell>
                      <TableCell><Button variant="outline" size="sm" asChild><Link href={`/inventory/ledgers/${s.id}`}>View</Link></Button></TableCell>
                    </TableRow>
                  ))}
                  {(!stock?.results || stock.results.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Inventory is empty.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sales</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild><Link href="/inventory/sales">View All</Link></Button>
              {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/inventory/sales/new">Record Sale</Link></Button>}
            </div>
          </CardHeader>
          <CardContent>
            {isSalesLoading ? <div>Loading...</div> : (
              <Table>
                <TableHeader><TableRow><TableHead>Buyer</TableHead><TableHead>Species</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sales?.results.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.buyer_name || s.member_name || '-'}</TableCell>
                      <TableCell>{s.species_name}</TableCell>
                      <TableCell>{s.quantity}</TableCell>
                      <TableCell className="text-right">{s.total_amount}</TableCell>
                      <TableCell><Button variant="outline" size="sm" asChild><Link href={`/inventory/sales/${s.id}`}>View</Link></Button></TableCell>
                    </TableRow>
                  ))}
                  {(!sales?.results || sales.results.length === 0) && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No recent sales.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Price Rates</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild><Link href="/inventory/price-rates">View All</Link></Button>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/inventory/price-rates/new">Add Rate</Link></Button>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Standard rates by species, grade, and buyer type — used to auto-fill sale prices.</p>
        </CardContent>
      </Card>

      {/* Fiscal Year Stock Analysis Section */}
      <div className="space-y-6 mt-8">
        <h2 className="text-2xl font-bold tracking-tight">Fiscal Year Stock Analysis</h2>

        {/* Fiscal Year Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Fiscal Year Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <div>Loading...</div>
            ) : summary ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Fiscal Year</p>
                    <p className="text-lg font-semibold">{summary.fiscal_year}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Stock In</p>
                    <p className="text-lg font-semibold text-blue-600">{summary.total_stock_in}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Stock Out</p>
                    <p className="text-lg font-semibold text-red-600">{summary.total_stock_out}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Stock Left</p>
                    <p className="text-lg font-semibold text-green-600">{summary.total_stock_left}</p>
                  </div>
                </div>
                
                {/* <div>
                  <p className="text-sm font-semibold mb-3">Opening Balance (Carryover from Previous Year)</p>
                  <p className="text-lg font-semibold text-amber-600">{summary.total_carryover_from_previous_year}</p>
                </div> */}

                {summary.by_species && summary.by_species.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold mb-3">Breakdown by Species & Grade</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Species</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead className="text-right">Opening</TableHead>
                          <TableHead className="text-right">Stock In</TableHead>
                          <TableHead className="text-right">Stock Out</TableHead>
                          <TableHead className="text-right">Stock Left</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.by_species.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.species_name}</TableCell>
                            <TableCell>{item.grade}</TableCell>
                            <TableCell className="text-right text-amber-600">{item.carryover_from_previous_year}</TableCell>
                            <TableCell className="text-right text-blue-600">{item.stock_in}</TableCell>
                            <TableCell className="text-right text-red-600">{item.stock_out}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">{item.stock_left}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No fiscal year summary available.</p>
            )}
          </CardContent>
        </Card>

        {/* Fiscal Year Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Stock Analysis (by Species & Grade)</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalysisLoading ? (
              <div>Loading...</div>
            ) : analysis?.results && analysis.results.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Species</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Opening Stock</TableHead>
                    <TableHead className="text-right">Stock In</TableHead>
                    <TableHead className="text-right">Stock Out</TableHead>
                    <TableHead className="text-right">Stock Left</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.results.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.species_name}</TableCell>
                      <TableCell>{item.grade}</TableCell>
                      <TableCell className="text-right text-amber-600">{item.carryover_from_previous_year}</TableCell>
                      <TableCell className="text-right text-blue-600">{item.stock_in}</TableCell>
                      <TableCell className="text-right text-red-600">{item.stock_out}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{item.stock_left}</TableCell>
                      <TableCell>{item.fiscal_year}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No detailed analysis available.</p>
            )}
          </CardContent>
        </Card>

        {/* Stock Movement Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock In */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock In (Receipts)</CardTitle>
            </CardHeader>
            <CardContent>
              {isStockInLoading ? (
                <div>Loading...</div>
              ) : stockInData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Stock In</p>
                    <p className="text-2xl font-bold text-blue-600">{stockInData.total_stock_in}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stockInData.fiscal_year}</p>
                  </div>
                  {stockInData.by_species && stockInData.by_species.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">By Species</p>
                      {stockInData.by_species.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-b-0">
                          <span>{item.species_name} ({item.grade})</span>
                          <span className="font-semibold">{item.stock_in}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No stock in data.</p>
              )}
            </CardContent>
          </Card>

          {/* Stock Left */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Left (Available Inventory)</CardTitle>
            </CardHeader>
            <CardContent>
              {isStockLeftLoading ? (
                <div>Loading...</div>
              ) : stockLeftData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Stock Left</p>
                    <p className="text-2xl font-bold text-green-600">{stockLeftData.total_stock_left}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stockLeftData.fiscal_year}</p>
                  </div>
                  {stockLeftData.by_species && stockLeftData.by_species.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">By Species</p>
                      {stockLeftData.by_species.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-b-0">
                          <span>{item.species_name} ({item.grade})</span>
                          <span className="font-semibold">{item.stock_left}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No stock left data.</p>
              )}
            </CardContent>
          </Card>

          {/* Carryover from Previous Year */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opening Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {isCarryoverLoading ? (
                <div>Loading...</div>
              ) : carryoverData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    {/* <p className="text-sm text-muted-foreground">Carryover from Previous Year</p> */}
                    <p className="text-2xl font-bold text-amber-600">{carryoverData.total_carryover_from_previous_year}</p>
                    <p className="text-xs text-muted-foreground mt-2">{carryoverData.fiscal_year}</p>
                  </div>
                  {carryoverData.by_species && carryoverData.by_species.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">By Species</p>
                      {carryoverData.by_species.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-b-0">
                          <span>{item.species_name} ({item.grade})</span>
                          <span className="font-semibold">{item.carryover_from_previous_year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No carryover data.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><Inventory /></AppLayout></AuthGuard>;
}
