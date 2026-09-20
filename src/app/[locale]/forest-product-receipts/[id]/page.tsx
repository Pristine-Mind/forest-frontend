"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import Link from "next/link";
import { useGetForestProductReceipt } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { amountToNepaliWords } from "@/lib/nepali-amount-words";
import { formatDateNepali } from "@/lib/nepali-date-format";

function formatDate(value?: string | null) {
  return formatDateNepali(value, "short", true) || "..................";
}

function ReceiptDetail({ id }: { id: number }) {
  const { data: receipt, isLoading } = useGetForestProductReceipt(id);

  if (isLoading) return <div>Loading...</div>;
  if (!receipt) return <div>Receipt not found.</div>;

  const handlePrint = () => {
    const receiptElement = document.getElementById("receipt-print");
    if (!receiptElement) return;

    const printWindow = window.open("", "", "width=900,height=1200");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <meta charset="UTF-8" />
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Noto Sans Devanagari', serif;
              margin: 0;
              padding: 15px;
              line-height: 1.4;
              font-size: 12px;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              color: black;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .text-left {
              text-align: left;
            }
            .mb-4 {
              margin-bottom: 12px;
            }
            .mb-6 {
              margin-bottom: 18px;
            }
            .mt-6 {
              margin-top: 18px;
            }
            .mt-8 {
              margin-top: 24px;
            }
            .space-y-1 > p {
              margin-bottom: 4px;
            }
            .space-y-2 > p {
              margin-bottom: 8px;
            }
            .space-y-4 > p {
              margin-bottom: 12px;
            }
            .font-semibold {
              font-weight: bold;
            }
            .font-mono {
              font-family: 'Courier New', monospace;
            }
            p {
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid black;
              padding: 6px 4px;
              text-align: left;
              vertical-align: top;
            }
            th {
              font-weight: bold;
              background-color: white;
              text-align: center;
            }
            td {
              padding: 5px 4px;
            }
            .w-12 {
              width: 30px;
              text-align: center;
            }
            .w-20 {
              width: 60px;
            }
            .w-24 {
              width: 70px;
              text-align: right;
            }
            .w-32 {
              width: 85px;
              text-align: right;
            }
            tr.font-semibold td {
              font-weight: bold;
              padding: 6px 4px;
            }
            .border-b {
              border-bottom: 1px solid black;
              display: inline-block;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 24px;
            }
            .grid > div {
              font-size: 11px;
            }
            .grid p {
              margin-bottom: 8px;
              line-height: 1.6;
            }
            .px-8 {
              padding-left: 8px;
              padding-right: 8px;
            }
            .px-16 {
              padding-left: 16px;
              padding-right: 16px;
            }
            .px-20 {
              padding-left: 20px;
              padding-right: 20px;
              display: inline-block;
              min-width: 100px;
            }
            .px-32 {
              padding-left: 32px;
              padding-right: 32px;
            }
            .px-64 {
              padding-left: 64px;
              padding-right: 64px;
            }
            .text-sm {
              font-size: 11px;
            }
            .mt-1 {
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-4">
      {/* Screen controls — hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" asChild>
          <Link href="/forest-product-receipts">Back to Receipts</Link>
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print Receipt
        </Button>
      </div>

      {/* Printable receipt — styled to match the format in the image */}
      <div
        id="receipt-print"
        className="bg-white text-black p-6 max-w-2xl mx-auto"
        style={{
          fontFamily: "'Noto Sans Devanagari', serif",
          fontSize: "12px",
          lineHeight: "1.4",
        }}
      >

        {/* Title */}
        <div className="text-center mb-4" style={{ textAlign: "center", marginBottom: "12px" }}>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>
            (वन नियमावली २०७९ को नियम४९ को उपनियम (१) र (३) सँग सम्बन्धित)
          </p>
        </div>

        {/* Organisation info */}
        <div className="mb-4" style={{ fontSize: "12px", lineHeight: "1.6" }}>
          <p style={{ marginBottom: "4px" }}>शिवगंगा  सामुदायिक वन उपभोक्ता समूह</p>
          <p style={{ marginBottom: "4px" }}>गौरीगंगा नगरपालिका वडा नं. ३, कैलाली</p>
          <p style={{ marginBottom: "4px" }}>
            उपभोक्ता समूहको दर्ता नं. :{" "}
            <span style={{ borderBottom: "1px solid black", paddingLeft: "8px", paddingRight: "8px" }}>{receipt.cfug_registration_no || ".................."}</span>
          </p>
          <p>
            रांसद नं. :{" "}
            <span style={{ borderBottom: "1px solid black", paddingLeft: "16px", paddingRight: "16px", fontWeight: "bold" }}>{receipt.receipt_no}</span>
          </p>
        </div>

        {/* Recipient */}
        <div className="mb-6" style={{ fontSize: "12px", lineHeight: "1.8" }}>
          <p>
            श्री{" "}
            <span style={{ borderBottom: "1px solid black", paddingLeft: "32px", paddingRight: "32px", display: "inline-block", minWidth: "200px" }}>{receipt.buyer_name}</span>
          </p>
          <p>
            <span style={{ borderBottom: "1px solid black", paddingLeft: "64px", paddingRight: "64px", display: "inline-block", width: "100%" }}>{receipt.buyer_address || ""}</span> ।
          </p>
        </div>

        {/* Items table */}
        <table className="w-full border-collapse border border-black text-sm mb-6" style={{ borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="border border-black px-2 py-1 text-center" style={{ width: "30px", fontWeight: "bold" }}>क.सं.</th>
              <th className="border border-black px-2 py-1 text-left" style={{ fontWeight: "bold" }}>
                वनपैदावारको<br />नाम र जात
              </th>
              <th className="border border-black px-2 py-1 text-center" style={{ width: "50px", fontWeight: "bold" }}>ईकाई</th>
              <th className="border border-black px-2 py-1 text-right" style={{ width: "60px", fontWeight: "bold" }}>परिमाण</th>
              <th className="border border-black px-2 py-1 text-right" style={{ width: "80px", fontWeight: "bold" }}>कूल रकम</th>
              <th className="border border-black px-2 py-1 text-left" style={{ fontWeight: "bold" }}>कैफियत</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items?.length > 0 ? (
              receipt.items.map((item: any, i: number) => (
                <tr key={item.id}>
                  <td className="border border-black px-2 py-2 text-center" style={{ textAlign: "center" }}>{i + 1}</td>
                  <td className="border border-black px-2 py-2">
                    {item.product_name}{item.grade ? ` — ${item.grade}` : ""}
                  </td>
                  <td className="border border-black px-2 py-2" style={{ textAlign: "center" }}>{item.unit}</td>
                  <td className="border border-black px-2 py-2" style={{ textAlign: "right" }}>{item.quantity}</td>
                  <td className="border border-black px-2 py-2" style={{ textAlign: "right" }}>{item.total_amount}</td>
                  <td className="border border-black px-2 py-2">{item.remarks || ""}</td>
                </tr>
              ))
            ) : (
              // Empty rows for blank receipt look
              [1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="border border-black px-2 py-4"></td>
                  <td className="border border-black px-2 py-4"></td>
                  <td className="border border-black px-2 py-4"></td>
                  <td className="border border-black px-2 py-4"></td>
                  <td className="border border-black px-2 py-4"></td>
                  <td className="border border-black px-2 py-4"></td>
                </tr>
              ))
            )}
            {/* Total row */}
            <tr style={{ fontWeight: "bold" }}>
              <td colSpan={4} className="border border-black px-2 py-2" style={{ textAlign: "right", fontWeight: "bold" }}>जम्मा</td>
              <td className="border border-black px-2 py-2" style={{ textAlign: "right", fontWeight: "bold" }}>
                {receipt.grand_total}
              </td>
              <td className="border border-black px-2 py-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <div className="mt-6" style={{ fontSize: "12px", marginTop: "18px", marginBottom: "18px" }}>
          <p>
            <span style={{ fontWeight: "bold" }}>अक्षरहो:</span> {amountToNepaliWords(receipt.grand_total)}
          </p>
        </div>

        {/* Signature footer */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "24px", fontSize: "11px" }}>
          <div>
            <p style={{ fontWeight: "bold", marginBottom: "12px" }}>रसिद बुझि लिनेको</p>
            <p style={{ marginBottom: "8px" }}>
              नाम : <span style={{ borderBottom: "1px solid black", paddingLeft: "20px", paddingRight: "20px", display: "inline-block", minWidth: "100px" }}>{receipt.receiver_name || ""}</span>
            </p>
            <p style={{ marginBottom: "8px" }}>
              दस्तखत : <span style={{ borderBottom: "1px solid black", paddingLeft: "20px", paddingRight: "20px", display: "inline-block", minWidth: "100px" }}></span>
            </p>
            <p>
              मिति : <span style={{ borderBottom: "1px solid black", paddingLeft: "20px", paddingRight: "20px", display: "inline-block", minWidth: "100px" }}>{formatDate(receipt.receiver_date)}</span>
            </p>
          </div>

          <div>
            <p style={{ fontWeight: "bold", marginBottom: "12px" }}>रसिद दिनेको</p>
            <p style={{ marginBottom: "8px" }}>
              नाम : <span style={{ borderBottom: "1px solid black", paddingLeft: "20px", paddingRight: "20px", display: "inline-block", minWidth: "100px" }}>{receipt.issuer_name || ""}</span>
            </p>
            <p style={{ marginBottom: "8px" }}>
              दस्तखत : <span style={{ borderBottom: "1px solid black", paddingLeft: "20px", paddingRight: "20px", display: "inline-block", minWidth: "100px" }}></span>
            </p>
            <p style={{ marginBottom: "8px" }}>
              पद <span style={{ borderBottom: "1px solid black", paddingLeft: "20px", paddingRight: "20px", display: "inline-block", minWidth: "100px" }}>{receipt.issuer_position || ""}</span>
            </p>
            <p>
              मिति : <span style={{ borderBottom: "1px solid black", paddingLeft: "20px", paddingRight: "20px", display: "inline-block", minWidth: "100px" }}>{formatDate(receipt.issuer_date)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <AppLayout>
        <ReceiptDetailWrapper params={params} />
      </AppLayout>
    </AuthGuard>
  );
}

function ReceiptDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ReceiptDetail id={Number(id)} />;
}
