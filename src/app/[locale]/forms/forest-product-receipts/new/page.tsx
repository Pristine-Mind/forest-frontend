"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateForestProductReceipt } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

interface LineItem {
  product_name: string;
  grade: string;
  unit: string;
  quantity: string;
  rate_per_unit: string;
  remarks: string;
}

const emptyItem = (): LineItem => ({
  product_name: "",
  grade: "",
  unit: "",
  quantity: "",
  rate_per_unit: "",
  remarks: "",
});

function ForestProductReceiptNew() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createReceipt = useCreateForestProductReceipt();

  const [header, setHeader] = useState({
    receipt_no: "",
    cfug_registration_no: "",
    buyer_name: "",
    buyer_address: "",
    issue_date: new Date().toISOString().split("T")[0],
  });

  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  const [footer, setFooter] = useState({
    receiver_name: "",
    receiver_date: "",
    issuer_name: "",
    issuer_position: "",
    issuer_date: "",
  });

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function computeRowTotal(item: LineItem) {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate_per_unit) || 0;
    return (qty * rate).toFixed(2);
  }

  function grandTotal() {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate_per_unit) || 0);
    }, 0).toFixed(2);
  }

  function handleSubmit() {
    if (!header.receipt_no || !header.buyer_name || !header.issue_date) {
      toast({ title: "Receipt No., Buyer Name, and Issue Date are required", variant: "destructive" });
      return;
    }
    const validItems = items.filter((i) => i.product_name && i.quantity && i.rate_per_unit);
    if (validItems.length === 0) {
      toast({ title: "At least one complete line item is required", variant: "destructive" });
      return;
    }

    const grand_total = validItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate_per_unit) || 0);
    }, 0);

    createReceipt.mutate(
      {
        data: {
          cfug_registration_no: header.cfug_registration_no,
          receipt_no: header.receipt_no,
          buyer_name: header.buyer_name,
          buyer_address: header.buyer_address,
          issue_date: header.issue_date,
          receiver_name: footer.receiver_name,
          receiver_date: footer.receiver_date,
          issuer_name: footer.issuer_name,
          issuer_position: footer.issuer_position,
          issuer_date: footer.issuer_date,
          grand_total,
          items: validItems.map((i) => ({
            product_name: i.product_name,
            grade: i.grade || undefined,
            unit: i.unit,
            quantity: parseFloat(i.quantity) || 0,
            rate_per_unit: parseFloat(i.rate_per_unit) || 0,
            total_amount: (parseFloat(i.quantity) || 0) * (parseFloat(i.rate_per_unit) || 0),
            remarks: i.remarks || undefined,
          })),
        },
      },
      {
        onSuccess: (data) => {
          toast({ title: "Receipt created successfully" });
          queryClient.invalidateQueries({ queryKey: ["forestProductReceipts"] });
          router.push(`/forms/forest-product-receipts/${data.id}`);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.receipt_no?.[0] ?? error?.response?.data?.detail;
          toast({
            title: "Failed to create receipt",
            description: detail ?? "Please check the form and try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Forest Product Receipt</h1>
        <p className="text-muted-foreground mt-2">अनुसुचि-१० — वन पैदावार विक्री वितरण रसिद</p>
      </div>

      {/* Header */}
      <Card>
        <CardHeader><CardTitle>Receipt Header (शीर्षक)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Receipt No. (रांसद नं.) *</Label>
            <Input
              value={header.receipt_no}
              onChange={(e) => setHeader((h) => ({ ...h, receipt_no: e.target.value }))}
              placeholder="e.g. 001/2081-82"
            />
          </div>
          <div className="space-y-2">
            <Label>CFUG Registration No. (दर्ता नं.)</Label>
            <Input
              value={header.cfug_registration_no}
              onChange={(e) => setHeader((h) => ({ ...h, cfug_registration_no: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Buyer Name (श्री) *</Label>
            <Input
              value={header.buyer_name}
              onChange={(e) => setHeader((h) => ({ ...h, buyer_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Buyer Address (ठेगाना)</Label>
            <Input
              value={header.buyer_address}
              onChange={(e) => setHeader((h) => ({ ...h, buyer_address: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Issue Date (मिति) *</Label>
            <Input
              type="date"
              value={header.issue_date}
              onChange={(e) => setHeader((h) => ({ ...h, issue_date: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Forest Products (वनपैदावार)</CardTitle>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-3 py-2 text-left">क.सं.</th>
                  <th className="border border-border px-3 py-2 text-left">वनपैदावारको नाम र जात</th>
                  <th className="border border-border px-3 py-2 text-left">ईकाई</th>
                  <th className="border border-border px-3 py-2 text-right">परिमाण</th>
                  <th className="border border-border px-3 py-2 text-right">दर</th>
                  <th className="border border-border px-3 py-2 text-right">कूल रकम</th>
                  <th className="border border-border px-3 py-2 text-left">कैफियत</th>
                  <th className="border border-border px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border border-border px-2 py-1">
                      <div className="flex gap-1">
                        <Input
                          className="border-0 h-8 flex-1"
                          placeholder="Product name"
                          value={item.product_name}
                          onChange={(e) => updateItem(index, "product_name", e.target.value)}
                        />
                        <Input
                          className="border-0 h-8 w-20"
                          placeholder="Grade"
                          value={item.grade}
                          onChange={(e) => updateItem(index, "grade", e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="border border-border px-2 py-1">
                      <Input
                        className="border-0 h-8 w-20"
                        placeholder="Unit"
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                      />
                    </td>
                    <td className="border border-border px-2 py-1">
                      <Input
                        className="border-0 h-8 w-24 text-right"
                        type="number" min={0} step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                    </td>
                    <td className="border border-border px-2 py-1">
                      <Input
                        className="border-0 h-8 w-28 text-right"
                        type="number" min={0} step="0.01"
                        value={item.rate_per_unit}
                        onChange={(e) => updateItem(index, "rate_per_unit", e.target.value)}
                      />
                    </td>
                    <td className="border border-border px-2 py-1 text-right font-mono">
                      {computeRowTotal(item)}
                    </td>
                    <td className="border border-border px-2 py-1">
                      <Input
                        className="border-0 h-8"
                        placeholder="Remarks"
                        value={item.remarks}
                        onChange={(e) => updateItem(index, "remarks", e.target.value)}
                      />
                    </td>
                    <td className="border border-border px-2 py-1">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted font-semibold">
                  <td colSpan={5} className="border border-border px-3 py-2 text-right">जम्मा (Total)</td>
                  <td className="border border-border px-3 py-2 text-right font-mono">NPR {grandTotal()}</td>
                  <td colSpan={2} className="border border-border"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer / Signatures */}
      <Card>
        <CardHeader><CardTitle>Signatures (दस्तखत)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">रांसद बुझ्फ लिनेको (Receiver)</h3>
            <div className="space-y-2">
              <Label>नाम (Name)</Label>
              <Input
                value={footer.receiver_name}
                onChange={(e) => setFooter((f) => ({ ...f, receiver_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>मिति (Date)</Label>
              <Input
                type="date"
                value={footer.receiver_date}
                onChange={(e) => setFooter((f) => ({ ...f, receiver_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">रांसद दिनेको (Issuer)</h3>
            <div className="space-y-2">
              <Label>नाम (Name)</Label>
              <Input
                value={footer.issuer_name}
                onChange={(e) => setFooter((f) => ({ ...f, issuer_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>पद (Position)</Label>
              <Input
                value={footer.issuer_position}
                onChange={(e) => setFooter((f) => ({ ...f, issuer_position: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>मिति (Date)</Label>
              <Input
                type="date"
                value={footer.issuer_date}
                onChange={(e) => setFooter((f) => ({ ...f, issuer_date: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={createReceipt.isPending}>
          {createReceipt.isPending ? "Creating..." : "Create Receipt"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/forms/forest-product-receipts")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><ForestProductReceiptNew /></AppLayout></AuthGuard>;
}
