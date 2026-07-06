"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import Link from "next/link";
import { useGetForestProductReceipt } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "..................";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString("ne-NP");
}

function ReceiptDetail({ id }: { id: number }) {
  const { data: receipt, isLoading } = useGetForestProductReceipt(id);

  if (isLoading) return <div>Loading...</div>;
  if (!receipt) return <div>Receipt not found.</div>;

  return (
    <div className="space-y-4">
      {/* Screen controls — hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" asChild>
          <Link href="/forms/forest-product-receipts">Back to Receipts</Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print Receipt
        </Button>
      </div>

      {/* Printable receipt — styled to match the format in the image */}
      <div
        id="receipt-print"
        className="bg-white text-black p-10 max-w-4xl mx-auto border border-border print:border-0 print:p-6"
        style={{ fontFamily: "serif" }}
      >

        {/* Title */}
        <div className="text-center mb-4">
          <p className="text-sm mt-1">
            (वन नियमावली २०७९ को नियम४९ को उपनियम (१) र (३) सँग सम्बन्धित)
          </p>
        </div>

        {/* Organisation info */}
        <div className="mb-4 text-sm space-y-1">
          <p>शिवगंगा  सामुदायिक वन उपभोक्ता समूह</p>
          <p>गौरीगंगा नगरपालिका वडा नं. ३, कैलाली</p>
          <p>
            उपभोक्ता समूहको दर्ता नं. :{" "}
            <span className="border-b border-black px-8">{receipt.cfug_registration_no || ""}</span>
          </p>
          <p>
            रांसद नं. :{" "}
            <span className="border-b border-black px-16 font-semibold">{receipt.receipt_no}</span>
          </p>
        </div>

        {/* Recipient */}
        <div className="mb-6 text-sm">
          <p>
            श्री{" "}
            <span className="border-b border-black px-32">{receipt.buyer_name}</span>
          </p>
          <p>
            <span className="border-b border-black px-64">{receipt.buyer_address || ""}</span> ।
          </p>
        </div>

        {/* Items table */}
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr>
              <th className="border border-black px-3 py-2 text-left w-12">क.सं.</th>
              <th className="border border-black px-3 py-2 text-left">
                वनपैदावारको<br />नाम र जात
              </th>
              <th className="border border-black px-3 py-2 text-left w-20">ईकाई</th>
              <th className="border border-black px-3 py-2 text-right w-24">परिमाण</th>
              <th className="border border-black px-3 py-2 text-right w-32">कूल रकम</th>
              <th className="border border-black px-3 py-2 text-left">कैफियत</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items?.length > 0 ? (
              receipt.items.map((item: any, i: number) => (
                <tr key={item.id}>
                  <td className="border border-black px-3 py-3 text-center">{i + 1}</td>
                  <td className="border border-black px-3 py-3">
                    {item.product_name}{item.grade ? ` — ${item.grade}` : ""}
                  </td>
                  <td className="border border-black px-3 py-3">{item.unit}</td>
                  <td className="border border-black px-3 py-3 text-right font-mono">{item.quantity}</td>
                  <td className="border border-black px-3 py-3 text-right font-mono">{item.total_amount}</td>
                  <td className="border border-black px-3 py-3">{item.remarks || ""}</td>
                </tr>
              ))
            ) : (
              // Empty rows for blank receipt look
              [1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="border border-black px-3 py-6"></td>
                  <td className="border border-black px-3 py-6"></td>
                  <td className="border border-black px-3 py-6"></td>
                  <td className="border border-black px-3 py-6"></td>
                  <td className="border border-black px-3 py-6"></td>
                  <td className="border border-black px-3 py-6"></td>
                </tr>
              ))
            )}
            {/* Total row */}
            <tr className="font-semibold">
              <td colSpan={4} className="border border-black px-3 py-2 text-right">जम्मा</td>
              <td className="border border-black px-3 py-2 text-right font-mono">
                {receipt.grand_total}
              </td>
              <td className="border border-black px-3 py-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Signature footer */}
        <div className="grid grid-cols-2 gap-8 text-sm mt-8">
          <div className="space-y-4">
            <p className="font-semibold">रांसद बुझ्फ लिनेको</p>
            <p>
              नाम : <span className="border-b border-black px-20">{receipt.receiver_name || ""}</span>
            </p>
            <p>
              दस्तखत : <span className="border-b border-black px-20"></span>
            </p>
            <p>
              मिति : <span className="border-b border-black px-20">{formatDate(receipt.receiver_date)}</span>
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-semibold">रांसद दिनेको</p>
            <p>
              नाम : <span className="border-b border-black px-20">{receipt.issuer_name || ""}</span>
            </p>
            <p>
              दस्तखत : <span className="border-b border-black px-16"></span>
            </p>
            <p>
              पद <span className="border-b border-black px-20">{receipt.issuer_position || ""}</span>
            </p>
            <p>
              मिति : <span className="border-b border-black px-20">{formatDate(receipt.issuer_date)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><ReceiptDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
