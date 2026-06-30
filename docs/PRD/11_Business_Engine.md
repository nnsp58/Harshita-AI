# PRD 11 — Business Engine

## Overview

The Business Engine provides tools for small and medium business management — billing, invoicing, GST calculations, inventory, CRM, attendance, payroll, and financial reporting.

---

## Business Skills

| Skill | Description | Offline | Priority |
|-------|-------------|---------|----------|
| Billing | Generate bills with line items | ✅ | 8 |
| Invoice | Professional invoice generation (PDF) | ✅ | 8 |
| GST Calculator | CGST, SGST, IGST calculation | ✅ | 9 |
| Inventory Manager | Track stock, alerts on low inventory | ✅ | 7 |
| CRM | Customer relationship management | ❌ | 6 |
| Attendance Tracker | Employee attendance records | ✅ | 7 |
| Payroll | Salary calculation, deductions, PF | ✅ | 7 |
| Expense Tracker | Record and categorize expenses | ✅ | 7 |
| Sales Report | Daily/weekly/monthly sales analytics | ✅ | 7 |
| Purchase Register | Track purchases and vendors | ✅ | 6 |
| Profit/Loss | P&L statement generation | ✅ | 7 |
| Analytics Dashboard | Business performance metrics | ✅ | 6 |

---

## GST Calculator Schema

```javascript
GSTInputSchema = z.object({
  amount: z.number().positive(),
  gstRate: z.enum(['0', '5', '12', '18', '28']),
  type: z.enum(['inclusive', 'exclusive']),
  stateType: z.enum(['intra', 'inter']),  // CGST+SGST vs IGST
});

// Output
GSTOutputSchema = z.object({
  baseAmount: z.number(),
  cgst: z.number(),
  sgst: z.number(),
  igst: z.number(),
  totalGST: z.number(),
  totalAmount: z.number(),
  hsnCode: z.string().optional(),
});
```

---

## Invoice Schema

```javascript
InvoiceSchema = z.object({
  invoiceNumber: z.string(),
  date: z.string(),
  seller: z.object({
    name: z.string(),
    address: z.string(),
    gstin: z.string().optional(),
    pan: z.string().optional(),
  }),
  buyer: z.object({
    name: z.string(),
    address: z.string(),
    gstin: z.string().optional(),
  }),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    rate: z.number(),
    gstRate: z.number(),
    amount: z.number(),
  })),
  subtotal: z.number(),
  gst: z.number(),
  total: z.number(),
  paymentTerms: z.string().optional(),
  bankDetails: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    ifsc: z.string(),
  }).optional(),
});
```

---

## Export Formats

- PDF Invoice (professional layout with logo)
- Excel Report (using exceljs — already installed)
- CSV Export
- Print-ready format
