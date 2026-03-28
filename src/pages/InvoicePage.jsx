import React, { useState, useRef } from 'react';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Printer, CheckCircle, Truck, Package, ShoppingBag } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─────────────────────────────────────────────
   Styles injected once — scoped to .ske-invoice
───────────────────────────────────────────── */
const INVOICE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

  .ske-invoice * { box-sizing: border-box; margin: 0; padding: 0; }
  .ske-invoice { font-family: 'Jost', sans-serif; background: #F7F4EF; min-height: 100vh; padding: 2rem 0 4rem; }

  /* ── Page shell ── */
  .inv-topbar { max-width: 860px; margin: 0 auto 1.5rem; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
  .inv-back-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid #1A2B4A; color: #1A2B4A; padding: 8px 16px; border-radius: 6px; font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 400; cursor: pointer; letter-spacing: 0.04em; transition: background 0.2s, color 0.2s; }
  .inv-back-btn:hover { background: #1A2B4A; color: #F5E6C8; }
  .inv-action-row { display: flex; gap: 10px; }
  .inv-btn-outline { display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid #1A2B4A; color: #1A2B4A; padding: 8px 18px; border-radius: 6px; font-family: 'Jost', sans-serif; font-size: 13px; cursor: pointer; letter-spacing: 0.04em; transition: background 0.2s, color 0.2s; }
  .inv-btn-outline:hover { background: #1A2B4A; color: #F5E6C8; }
  .inv-btn-primary { display: flex; align-items: center; gap: 6px; background: #1A2B4A; border: 1px solid #1A2B4A; color: #F5E6C8; padding: 8px 20px; border-radius: 6px; font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; letter-spacing: 0.04em; transition: background 0.2s; }
  .inv-btn-primary:hover { background: #243a62; }

  /* ── Paper card ── */
  .inv-paper { max-width: 860px; margin: 0 auto; padding: 0 1rem; }
  .inv-sheet { background: #FFFDF9; border: 1px solid #E0DAD0; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }

  /* ── Header band ── */
  .inv-header { background: #1A2B4A; padding: 2.5rem 3rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; }
  .inv-brand-name { font-family: 'Cormorant Garamond', serif; font-size: 36px; color: #F5E6C8; font-weight: 600; letter-spacing: 0.06em; line-height: 1; }
  .inv-brand-tagline { font-size: 10px; color: #8A9EC4; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 6px; }
  .inv-brand-info { font-size: 11px; color: #6A7FA0; line-height: 1.9; margin-top: 14px; }
  .inv-title-block { text-align: right; }
  .inv-title-word { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #F5E6C8; font-weight: 400; letter-spacing: 0.1em; font-style: italic; }
  .inv-meta-pill { display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 3px; padding: 3px 10px; font-size: 11px; color: #A0B4D0; letter-spacing: 0.08em; margin-top: 8px; }
  .inv-meta-date { font-size: 11px; color: #6A7FA0; margin-top: 6px; }

  /* ── Accent stripe ── */
  .inv-stripe { height: 4px; background: linear-gradient(90deg, #C9A96E 0%, #E8C98A 50%, #C9A96E 100%); }

  /* ── Body ── */
  .inv-body { padding: 2.5rem 3rem; }

  /* ── Parties row ── */
  .inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; }
  .inv-party-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A96E; font-weight: 500; margin-bottom: 10px; }
  .inv-party-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #1A2B4A; font-weight: 600; margin-bottom: 4px; }
  .inv-party-detail { font-size: 12px; color: #6B7280; line-height: 1.8; }

  /* ── Status badges ── */
  .inv-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 500; letter-spacing: 0.06em; }
  .badge-confirmed { background: #EAF3DE; color: #3B6D11; }
  .badge-in_transit { background: #FAEEDA; color: #854F0B; }
  .badge-delivered  { background: #E1F5EE; color: #0F6E56; }
  .badge-refunded   { background: #FCEBEB; color: #A32D2D; }

  /* ── Divider ── */
  .inv-divider { height: 1px; background: #EDE8DF; margin: 0 0 2rem; }
  .inv-divider-gold { height: 1px; background: linear-gradient(90deg, transparent, #C9A96E, transparent); margin: 2rem 0; }

  /* ── Items table ── */
  .inv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .inv-table thead tr { border-bottom: 1px solid #E8E0D4; }
  .inv-table th { padding: 0 12px 10px; text-align: left; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A96E; font-weight: 500; }
  .inv-table th.r { text-align: right; }
  .inv-table td { padding: 14px 12px; vertical-align: middle; color: #374151; border-bottom: 1px solid #F0EBE3; }
  .inv-table td.r { text-align: right; font-variant-numeric: tabular-nums; }
  .inv-table tr:last-child td { border-bottom: none; }
  .inv-table .prod-swatch { width: 42px; height: 42px; border-radius: 4px; object-fit: cover; display: block; }
  .inv-table .prod-swatch-placeholder { width: 42px; height: 42px; border-radius: 4px; background: #1A2B4A; display: flex; align-items: center; justify-content: center; }
  .inv-table .prod-name-text { font-weight: 500; color: #1A2B4A; font-size: 13px; }
  .inv-table .prod-variant-text { font-size: 11px; color: #9CA3AF; margin-top: 3px; }
  .inv-table .prod-discount-badge { display: inline-block; background: #EAF3DE; color: #3B6D11; border-radius: 3px; font-size: 10px; padding: 1px 6px; margin-top: 3px; }

  /* ── Totals ── */
  .inv-totals-wrap { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
  .inv-totals { min-width: 260px; }
  .inv-total-row { display: flex; justify-content: space-between; font-size: 13px; color: #6B7280; padding: 6px 0; }
  .inv-total-row.grand { font-size: 16px; color: #1A2B4A; font-weight: 500; border-top: 1px solid #1A2B4A; margin-top: 8px; padding-top: 12px; }
  .inv-total-row.grand span:last-child { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; }

  /* ── Payment info ── */
  .inv-payment-row { display: flex; gap: 2rem; margin-top: 2.5rem; flex-wrap: wrap; }
  .inv-info-block { flex: 1; min-width: 160px; }
  .inv-info-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A96E; font-weight: 500; margin-bottom: 6px; }
  .inv-info-value { font-size: 13px; color: #1A2B4A; font-weight: 500; }

  /* ── Tracking mini ── */
  .inv-tracking { display: flex; align-items: center; gap: 0; margin: 2rem 0 0; }
  .inv-track-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
  .inv-track-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #1A2B4A; }
  .inv-track-dot.active { background: #1A2B4A; color: #F5E6C8; }
  .inv-track-dot.inactive { background: transparent; color: #1A2B4A; }
  .inv-track-label { font-size: 10px; color: #6B7280; letter-spacing: 0.06em; text-transform: uppercase; }
  .inv-track-line { flex: 1; height: 2px; background: #E0DAD0; margin-bottom: 22px; }
  .inv-track-line.active { background: #1A2B4A; }

  /* ── Footer ── */
  .inv-footer { background: #1A2B4A; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-wrap: wrap; }
  .inv-footer-note { font-size: 11px; color: #6A7FA0; line-height: 1.8; max-width: 400px; }
  .inv-footer-brand { font-family: 'Cormorant Garamond', serif; font-size: 15px; color: #C9A96E; letter-spacing: 0.08em; }

  /* ── Empty state ── */
  .inv-empty { text-align: center; padding: 6rem 2rem; }
  .inv-empty h2 { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #1A2B4A; margin: 1.5rem 0 0.5rem; }
  .inv-empty p { color: #6B7280; font-size: 14px; }

  @media print {
    .inv-topbar { display: none; }
    .ske-invoice { background: white; padding: 0; }
    .inv-sheet { box-shadow: none; border: none; }
  }
  @media (max-width: 600px) {
    .inv-header { padding: 2rem 1.5rem; flex-direction: column; }
    .inv-title-block { text-align: left; }
    .inv-body { padding: 2rem 1.5rem; }
    .inv-parties { grid-template-columns: 1fr; gap: 1.5rem; }
    .inv-footer { padding: 1.5rem; flex-direction: column; align-items: flex-start; }
  }
`;

/* ─────────────────────────────────────────────
   PDF Generator (standalone, matches order data)
───────────────────────────────────────────── */
const generateSKEInvoice = (order) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Header background
  doc.setFillColor(26, 43, 74);
  doc.rect(0, 0, 210, 50, 'F');

  // Gold stripe
  doc.setFillColor(201, 169, 110);
  doc.rect(0, 50, 210, 2, 'F');

  // Brand name
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(245, 230, 200);
  doc.text('SKE', 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(138, 158, 196);
  doc.text('TEXTILES & READYMADES', 15, 28);
  doc.text('Thiruvalam, Vellore, TN - 632515', 15, 34);
  doc.text('GSTIN: 33AADCS9999Q1ZX  |  Tel: +91 9629218964', 15, 39);
  doc.text('sketestilesreadymades@gmail.com', 15, 44);

  // Invoice title
  doc.setFont('times', 'italic');
  doc.setFontSize(22);
  doc.setTextColor(245, 230, 200);
  doc.text('E — Invoice', 195, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(138, 158, 196);
  doc.text(`Order No. ${order.orderNumber}`, 195, 28, { align: 'right' });
  doc.text(`Date: ${new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 195, 34, { align: 'right' });
  doc.text(`Status: ${order.status.toUpperCase()}`, 195, 40, { align: 'right' });

  // Billed To
  const bY = 62;
  doc.setFontSize(8);
  doc.setTextColor(201, 169, 110);
  doc.setFont('helvetica', 'bold');
  doc.setCharSpace(2);
  doc.text('BILLED TO', 15, bY);
  doc.setCharSpace(0);

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 43, 74);
  doc.text(order.customerDetails.username || order.customerDetails.name || 'Customer', 15, bY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(order.customerDetails.email || '', 15, bY + 13);
  doc.text(order.customerDetails.address || '', 15, bY + 19);

  // Payment info on right
  doc.setFontSize(8);
  doc.setTextColor(201, 169, 110);
  doc.setFont('helvetica', 'bold');
  doc.setCharSpace(2);
  doc.text('PAYMENT MODE', 140, bY);
  doc.setCharSpace(0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(26, 43, 74);
  doc.text(order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (UPI / Card)', 140, bY + 7);

  // Divider
  const tY = 92;
  doc.setDrawColor(232, 224, 212);
  doc.line(15, tY - 5, 195, tY - 5);

  // Table
  const tableRows = order.products.map(p => {
    const discounted = Math.floor(p.price * (1 - (p.discount || 0) / 100));
    return [
      p.name,
      `${p.size || 'One Size'} / ${p.color || '—'}`,
      p.discount > 0 ? `Rs. ${discounted}\n(-${p.discount}%)` : `Rs. ${p.price}`,
      String(p.quantity),
      `Rs. ${(discounted * p.quantity).toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: tY,
    head: [['PRODUCT', 'SIZE / COLOR', 'UNIT PRICE', 'QTY', 'AMOUNT']],
    body: tableRows,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, textColor: [55, 65, 81], cellPadding: { top: 8, bottom: 8, left: 4, right: 4 } },
    headStyles: { fontSize: 8, fontStyle: 'normal', textColor: [201, 169, 110], cellPadding: { top: 0, bottom: 8, left: 4, right: 4 } },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', textColor: [26, 43, 74] },
      1: { cellWidth: 42, textColor: [107, 114, 128] },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [26, 43, 74] },
    },
    alternateRowStyles: { fillColor: [250, 248, 244] },
    tableLineColor: [232, 224, 212],
    tableLineWidth: 0.3,
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Totals
  const subtotal = order.subtotal;
  const tax = order.tax;
  const shipping = order.shipping;
  const total = order.total;

  const totalsX = 130;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  const rows = [
    ['Subtotal', `Rs. ${subtotal.toLocaleString('en-IN')}`],
    ['GST (18%)', `Rs. ${tax.toLocaleString('en-IN')}`],
    ['Shipping', shipping === 0 ? 'FREE' : `Rs. ${shipping}`],
  ];
  let ry = finalY;
  rows.forEach(([l, v]) => {
    doc.text(l, totalsX, ry);
    doc.text(v, 195, ry, { align: 'right' });
    ry += 7;
  });

  doc.setDrawColor(26, 43, 74);
  doc.line(totalsX, ry, 195, ry);
  ry += 6;

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(26, 43, 74);
  doc.text('Grand Total', totalsX, ry);
  doc.text(`Rs. ${total.toLocaleString('en-IN')}`, 195, ry, { align: 'right' });

  // Footer
  const footY = 272;
  doc.setFillColor(26, 43, 74);
  doc.rect(0, footY, 210, 25, 'F');
  doc.setFillColor(201, 169, 110);
  doc.rect(0, footY, 210, 1, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(106, 127, 160);
  doc.text('All prices inclusive of applicable taxes. Returns accepted within 7 days of delivery with original packaging.', 105, footY + 8, { align: 'center' });
  doc.text('Thank you for choosing SKE Textiles & Readymades', 105, footY + 14, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(201, 169, 110);
  doc.text('SKE Textiles & Readymades', 105, footY + 21, { align: 'center' });

  doc.save(`SKE_Invoice_${order.orderNumber}.pdf`);
};

/* ─────────────────────────────────────────────
   Tracking Steps helper
───────────────────────────────────────────── */
const TrackingBar = ({ status }) => {
  if (status === 'refunded') return null;
  const steps = [
    { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={16} /> },
    { key: 'in_transit', label: 'Dispatched', icon: <Truck size={16} /> },
    { key: 'delivered',  label: 'Delivered',  icon: <Package size={16} /> },
  ];
  const activeIdx = status === 'delivered' ? 2 : status === 'in_transit' ? 1 : 0;

  return (
    <div className="inv-tracking">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="inv-track-step">
            <div className={`inv-track-dot ${i <= activeIdx ? 'active' : 'inactive'}`}>
              {step.icon}
            </div>
            <span className="inv-track-label">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`inv-track-line ${i < activeIdx ? 'active' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Single Invoice View
───────────────────────────────────────────── */
const InvoiceView = ({ order }) => {
  const effPrice = (p) => Math.floor(p.price * (1 - (p.discount || 0) / 100));
  const fmt = (n) => `₹${Math.floor(n).toLocaleString('en-IN')}`;

  const statusClass = {
    confirmed: 'badge-confirmed',
    in_transit: 'badge-in_transit',
    delivered: 'badge-delivered',
    refunded: 'badge-refunded',
  }[order.status] || 'badge-confirmed';

  const date = new Date(order.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="inv-sheet">
      {/* ── Header ── */}
      <div className="inv-header">
        <div>
          <div className="inv-brand-name">SKE</div>
          <div className="inv-brand-tagline">Textiles &amp; Readymades</div>
          <div className="inv-brand-info">
            Thiruvalam, Vellore, Tamil Nadu — 632515<br />
            GSTIN: 33AADCS9999Q1ZX<br />
            sketestilesreadymades@gmail.com · +91 9629218964
          </div>
        </div>
        <div className="inv-title-block">
          <div className="inv-title-word">E — Invoice</div>
          <div className="inv-meta-pill">Order #{order.orderNumber}</div>
          <div className="inv-meta-date">Issued: {date}</div>
        </div>
      </div>

      {/* ── Gold stripe ── */}
      <div className="inv-stripe" />

      {/* ── Body ── */}
      <div className="inv-body">

        {/* ── Parties ── */}
        <div className="inv-parties">
          <div>
            <div className="inv-party-label">Billed To</div>
            <div className="inv-party-name">{order.customerDetails?.username || order.customerDetails?.name}</div>
            <div className="inv-party-detail">
              {order.customerDetails?.email}<br />
              {order.customerDetails?.address}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="inv-party-label">Order Status</div>
            <span className={`inv-badge ${statusClass}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
            <div style={{ marginTop: '1rem' }}>
              <div className="inv-party-label">Payment Mode</div>
              <div className="inv-party-detail" style={{ color: '#1A2B4A', fontWeight: 500 }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (UPI / Card)'}
              </div>
            </div>
          </div>
        </div>

        <div className="inv-divider" />

        {/* ── Items Table ── */}
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}></th>
              <th>Product</th>
              <th>Size / Color</th>
              <th className="r">Unit Price</th>
              <th className="r">Qty</th>
              <th className="r">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((p, i) => {
              const ep = effPrice(p);
              return (
                <tr key={`${p.id}-${i}`}>
                  <td>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="prod-swatch" />
                      : <div className="prod-swatch-placeholder">
                          <ShoppingBag size={16} color="#F5E6C8" />
                        </div>
                    }
                  </td>
                  <td>
                    <div className="prod-name-text">{p.name}</div>
                    {p.discount > 0 && (
                      <div className="prod-discount-badge">{p.discount}% off</div>
                    )}
                  </td>
                  <td className="prod-variant-text">{p.size || 'One Size'} / {p.color || '—'}</td>
                  <td className="r">
                    {fmt(ep)}
                    {p.discount > 0 && (
                      <div style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through' }}>
                        {fmt(p.price)}
                      </div>
                    )}
                  </td>
                  <td className="r">{p.quantity}</td>
                  <td className="r" style={{ fontWeight: 500, color: '#1A2B4A' }}>{fmt(ep * p.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── Totals ── */}
        <div className="inv-totals-wrap">
          <div className="inv-totals">
            <div className="inv-total-row"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div className="inv-total-row"><span>GST (18%)</span><span>{fmt(order.tax)}</span></div>
            <div className="inv-total-row">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : fmt(order.shipping)}</span>
            </div>
            <div className="inv-total-row grand">
              <span>Grand Total</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Tracking ── */}
        <div className="inv-divider-gold" />
        <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A96E', fontWeight: 500, marginBottom: 8 }}>
          Shipment Tracking
        </div>
        <TrackingBar status={order.status} />

        {/* ── Payment & Delivery info ── */}
        <div className="inv-payment-row" style={{ marginTop: '2rem' }}>
          <div className="inv-info-block">
            <div className="inv-info-label">Delivery Address</div>
            <div className="inv-info-value">{order.customerDetails?.address}</div>
          </div>
          <div className="inv-info-block">
            <div className="inv-info-label">Order Date</div>
            <div className="inv-info-value">{date}</div>
          </div>
          <div className="inv-info-block">
            <div className="inv-info-label">Invoice ID</div>
            <div className="inv-info-value">#{order.orderNumber}</div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="inv-footer">
        <div className="inv-footer-note">
          All prices inclusive of applicable taxes.<br />
          Returns accepted within 7 days with original packaging.<br />
          Support: sketestilesreadymades@gmail.com · +91 9629218964
        </div>
        <div className="inv-footer-brand">SKE Textiles &amp; Readymades</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Page Export
───────────────────────────────────────────── */
export const InvoicePage = () => {
  const { orders } = useProduct();
  const { user } = useAuth();
  const { orderId } = useParams();           // route: /invoice/:orderId
  const navigate = useNavigate();

  // Inject styles once
  if (!document.getElementById('ske-invoice-styles')) {
    const style = document.createElement('style');
    style.id = 'ske-invoice-styles';
    style.textContent = INVOICE_STYLES;
    document.head.appendChild(style);
  }

  // If orderId provided → show that single order
  // Otherwise → show all orders for current user
  const userOrders = orders.filter(o =>
    o.userId === user?.uid ||
    o.customerDetails?.username === user?.username ||
    o.customerDetails?.username === user?.name
  );

  const targetOrders = orderId
    ? userOrders.filter(o => o.id === orderId || o.orderNumber === orderId)
    : userOrders;

  if (targetOrders.length === 0) {
    return (
      <div className="ske-invoice">
        <div className="inv-topbar">
          <button className="inv-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
        <div className="inv-paper">
          <div className="inv-empty">
            <Package size={52} color="#C9A96E" />
            <h2>No Invoice Found</h2>
            <p>This order doesn't exist or belongs to a different account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ske-invoice">
      {/* ── Top bar ── */}
      <div className="inv-topbar">
        <button className="inv-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to Orders
        </button>
        <div className="inv-action-row">
          <button className="inv-btn-outline" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          {targetOrders.map(order => (
            <button
              key={order.id}
              className="inv-btn-primary"
              onClick={() => generateSKEInvoice(order)}
            >
              <Download size={14} />
              {targetOrders.length > 1 ? `Download #${order.orderNumber}` : 'Download PDF'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Invoice sheet(s) ── */}
      <div className="inv-paper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {targetOrders.map(order => (
          <InvoiceView key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default InvoicePage;
