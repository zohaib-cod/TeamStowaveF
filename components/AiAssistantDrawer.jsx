'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Sparkles, 
  Globe, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Upload, 
  Image as ImageIcon,
  Copy,
  Check,
  FileText,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

// ==========================================
// 1. CLAUDE-LIKE MARKDOWN & LINK RENDERER
// ==========================================

function InlineFormattedText({ text, router, onCopyLink }) {
  if (!text) return null;

  // Split by markdown link pattern [label](url) and raw URLs
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', val: text.substring(lastIndex, match.index) });
    }

    if (match[1] && match[2]) {
      // Markdown link [label](url)
      parts.push({ type: 'link', label: match[1], url: match[2] });
    } else if (match[3]) {
      // Raw URL
      parts.push({ type: 'link', label: match[3], url: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', val: text.substring(lastIndex) });
  }

  const renderSimpleFormatting = (str) => {
    // Process bold, italics, inline code
    const subParts = [];
    const fmtRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let sIdx = 0;
    let fMatch;

    while ((fMatch = fmtRegex.exec(str)) !== null) {
      if (fMatch.index > sIdx) {
        subParts.push(str.substring(sIdx, fMatch.index));
      }
      const token = fMatch[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        subParts.push(
          <strong key={fMatch.index} style={{ fontWeight: 700, color: '#0f172a' }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        subParts.push(
          <em key={fMatch.index} style={{ fontStyle: 'italic', color: '#334155' }}>
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        subParts.push(
          <code
            key={fMatch.index}
            style={{
              padding: '2px 6px',
              borderRadius: '5px',
              background: 'rgba(241, 245, 249, 0.95)',
              border: '1px solid rgba(203, 213, 225, 0.7)',
              fontSize: '0.85em',
              fontFamily: 'monospace',
              color: '#be123c',
              fontWeight: 600
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      sIdx = fMatch.index + token.length;
    }
    if (sIdx < str.length) {
      subParts.push(str.substring(sIdx));
    }
    return subParts;
  };

  return (
    <span>
      {parts.map((p, idx) => {
        if (p.type === 'link') {
          const isInternal = p.url.startsWith('/') || p.url.includes('stowave.com');
          return (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(225, 29, 72, 0.08)',
                border: '1px solid rgba(225, 29, 72, 0.25)',
                padding: '2px 8px',
                borderRadius: '6px',
                margin: '0 3px',
                verticalAlign: 'baseline',
                fontSize: '0.86rem'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isInternal && p.url.startsWith('/')) {
                    router?.push(p.url);
                  } else {
                    window.open(p.url, '_blank', 'noopener,noreferrer');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#be123c',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'underline'
                }}
                title={p.url}
              >
                {p.label}
                {isInternal ? <ChevronRight size={12} /> : <ExternalLink size={12} />}
              </button>
              <button
                type="button"
                onClick={() => onCopyLink && onCopyLink(p.url)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '1px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Copy URL"
              >
                <Copy size={11} />
              </button>
            </span>
          );
        }
        return <span key={idx}>{renderSimpleFormatting(p.val)}</span>;
      })}
    </span>
  );
}

function ClaudeMessageContent({ content, router, onCopyLink }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const parsedBlocks = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const blocks = [];
    let currentTable = null;
    let currentCode = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Code block start / end
      if (trimmed.startsWith('```')) {
        if (currentCode) {
          blocks.push(currentCode);
          currentCode = null;
        } else {
          currentCode = {
            type: 'code',
            lang: trimmed.replace(/^```/, '').trim() || 'text',
            content: []
          };
        }
        continue;
      }

      if (currentCode) {
        currentCode.content.push(line);
        continue;
      }

      // Table line (starts and ends with |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (!currentTable) {
          currentTable = { type: 'table', rows: [] };
        }
        // skip separator line
        if (!/^\|[\s-:]+\|$/.test(trimmed) && !trimmed.includes('---')) {
          const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
          currentTable.rows.push(cells);
        }
        continue;
      } else {
        if (currentTable) {
          blocks.push(currentTable);
          currentTable = null;
        }
      }

      // Empty line
      if (!trimmed) {
        blocks.push({ type: 'empty' });
        continue;
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        blocks.push({ type: 'h1', text: trimmed.replace(/^#\s+/, '') });
        continue;
      }
      if (trimmed.startsWith('## ')) {
        blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
        continue;
      }
      if (trimmed.startsWith('### ')) {
        blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
        continue;
      }

      // Divider
      if (trimmed === '---' || trimmed === '***') {
        blocks.push({ type: 'hr' });
        continue;
      }

      // Bullet List item
      if (/^[-*•]\s+/.test(trimmed)) {
        blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*•]\s+/, '') });
        continue;
      }

      // Numbered list item
      if (/^\d+\.\s+/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        blocks.push({ type: 'numbered', num: numMatch[1], text: numMatch[2] });
        continue;
      }

      // Normal paragraph line
      blocks.push({ type: 'p', text: line });
    }

    if (currentCode) blocks.push(currentCode);
    if (currentTable) blocks.push(currentTable);

    return blocks;
  }, [content]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.65, color: '#1e293b' }}>
      {parsedBlocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2
                key={idx}
                style={{
                  fontSize: '1.22rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginTop: '12px',
                  marginBottom: '6px',
                  paddingBottom: '4px',
                  borderBottom: '1.5px solid rgba(226, 232, 240, 0.95)',
                  letterSpacing: '-0.02em'
                }}
              >
                <InlineFormattedText text={block.text} router={router} onCopyLink={onCopyLink} />
              </h2>
            );
          case 'h2':
            return (
              <h3
                key={idx}
                style={{
                  fontSize: '1.08rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginTop: '10px',
                  marginBottom: '4px',
                  letterSpacing: '-0.01em'
                }}
              >
                <InlineFormattedText text={block.text} router={router} onCopyLink={onCopyLink} />
              </h3>
            );
          case 'h3':
            return (
              <h4
                key={idx}
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 750,
                  color: '#334155',
                  marginTop: '8px',
                  marginBottom: '3px'
                }}
              >
                <InlineFormattedText text={block.text} router={router} onCopyLink={onCopyLink} />
              </h4>
            );
          case 'bullet':
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  paddingLeft: '6px'
                }}
              >
                <span style={{ color: '#e11d48', fontSize: '1rem', lineHeight: '1.4' }}>•</span>
                <div style={{ flex: 1, fontSize: '0.9rem' }}>
                  <InlineFormattedText text={block.text} router={router} onCopyLink={onCopyLink} />
                </div>
              </div>
            );
          case 'numbered':
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  paddingLeft: '6px'
                }}
              >
                <span
                  style={{
                    background: 'rgba(225, 29, 72, 0.1)',
                    color: '#be123c',
                    fontWeight: 750,
                    borderRadius: '4px',
                    padding: '0 5px',
                    fontSize: '0.78rem',
                    lineHeight: '1.4'
                  }}
                >
                  {block.num}
                </span>
                <div style={{ flex: 1, fontSize: '0.9rem' }}>
                  <InlineFormattedText text={block.text} router={router} onCopyLink={onCopyLink} />
                </div>
              </div>
            );
          case 'hr':
            return (
              <hr
                key={idx}
                style={{
                  border: 'none',
                  borderTop: '1px solid rgba(226, 232, 240, 0.95)',
                  margin: '12px 0'
                }}
              />
            );
          case 'table':
            if (!block.rows || block.rows.length === 0) return null;
            const headerRow = block.rows[0];
            const bodyRows = block.rows.slice(1);
            return (
              <div
                key={idx}
                style={{
                  overflowX: 'auto',
                  margin: '10px 0',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(226, 232, 240, 0.95)',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                      {headerRow.map((cell, cIdx) => (
                        <th
                          key={cIdx}
                          style={{
                            padding: '9px 12px',
                            textAlign: 'left',
                            fontWeight: 750,
                            color: '#0f172a'
                          }}
                        >
                          <InlineFormattedText text={cell} router={router} onCopyLink={onCopyLink} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: rIdx < bodyRows.length - 1 ? '1px solid #f1f5f9' : 'none',
                          background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa'
                        }}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: '8px 12px',
                              color: '#334155',
                              fontWeight: 500
                            }}
                          >
                            <InlineFormattedText text={cell} router={router} onCopyLink={onCopyLink} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'code':
            const codeStr = block.content.join('\n');
            const isCopied = copiedCodeIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  margin: '10px 0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    background: '#1e293b',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    fontWeight: 650
                  }}
                >
                  <span>{block.lang || 'code'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(codeStr, idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isCopied ? '#10b981' : '#cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    padding: '12px 14px',
                    margin: 0,
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.84rem',
                    color: '#f8fafc',
                    lineHeight: 1.55
                  }}
                >
                  <code>{codeStr}</code>
                </pre>
              </div>
            );
          case 'empty':
            return <div key={idx} style={{ height: '4px' }} />;
          default:
            return (
              <p key={idx} style={{ margin: '0', fontSize: '0.9rem' }}>
                <InlineFormattedText text={block.text} router={router} onCopyLink={onCopyLink} />
              </p>
            );
        }
      })}
    </div>
  );
}

// ==========================================
// 2. STOWAVE EXECUTIVE PDF GENERATOR
// ==========================================

function exportMessageToPdf(messageText, user) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    let y = 16;

    // Header Background Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('STOWAVE™ ENTERPRISE STRATEGIC INTELLIGENCE', margin + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text('Executive Workspace & Operational Audit Report — Official Record', margin + 6, y + 16);

    y += 28;

    // Metadata Card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('SESSION USER:', margin + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${user?.name || 'Executive'} (${user?.title || user?.role || 'Admin'})`, margin + 30, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DATE & TIME:', margin + 110, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }), margin + 130, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DEPARTMENT:', margin + 4, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(user?.department || 'Executive Leadership', margin + 30, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('CLASSIFICATION:', margin + 110, y + 11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72); // rose
    doc.text('CONFIDENTIAL / INTERNAL', margin + 130, y + 11);

    y += 22;

    const lines = messageText.split('\n');

    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 18;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        y += 3.5;
        return;
      }

      // Heading 1 or 2
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        const titleText = trimmed.replace(/^#+\s*/, '').replace(/[*_#]/g, '');
        y += 3;
        if (y > pageHeight - 20) { doc.addPage(); y = 18; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(15, 23, 42);
        doc.text(titleText, margin, y);
        y += 2;
        doc.setDrawColor(225, 29, 72);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + 35, y);
        y += 5.5;
      }
      // Heading 3
      else if (trimmed.startsWith('### ')) {
        const subTitle = trimmed.replace(/^###\s*/, '').replace(/[*_#]/g, '');
        y += 2;
        if (y > pageHeight - 20) { doc.addPage(); y = 18; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(subTitle, margin, y);
        y += 5;
      }
      // Table Row
      else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (trimmed.includes('---')) return;
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim().replace(/[*_#]/g, ''));
        const colWidth = contentWidth / Math.max(1, cells.length);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);

        cells.forEach((cell, i) => {
          doc.text(cell.slice(0, 32), margin + (i * colWidth), y);
        });
        y += 4.5;
      }
      // Bullet list
      else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[-•*]\s*/, '').replace(/[*_#`]/g, '');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(225, 29, 72);
        doc.text('•', margin + 2, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const wrapped = doc.splitTextToSize(bulletText, contentWidth - 8);
        doc.text(wrapped, margin + 6, y);
        y += (wrapped.length * 4.2) + 1.2;
      }
      // Paragraph
      else {
        const cleanText = trimmed.replace(/[*_#`]/g, '');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const wrapped = doc.splitTextToSize(cleanText, contentWidth);
        doc.text(wrapped, margin, y);
        y += (wrapped.length * 4.2) + 1.2;
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Stowave™ Global Intelligence • team.stowave.com • Internal Executive Audit`, margin, pageHeight - 8);
      doc.text(`Page ${p} of ${pageCount}`, pageWidth - margin - 16, pageHeight - 8);
    }

    const safeName = (user?.name || 'Executive').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Stowave_Audit_Report_${safeName}_${Date.now()}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('PDF export failed: ' + err.message);
  }
}

function printStyledAuditReport(messageText, user) {
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      alert('Please allow popups to open print report preview.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stowave Executive Audit Report — ${user?.name || 'Executive'}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 40px;
            line-height: 1.6;
          }
          .header {
            background: #0f172a;
            color: #ffffff;
            padding: 24px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .header h1 { margin: 0 0 6px 0; font-size: 20px; letter-spacing: -0.02em; }
          .header p { margin: 0; color: #cbd5e1; font-size: 13px; }
          .meta {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 18px;
            border-radius: 6px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
          }
          .meta span { font-weight: bold; color: #475569; }
          h2, h3 { color: #0f172a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th { background: #f1f5f9; text-align: left; padding: 8px 12px; border: 1px solid #cbd5e1; }
          td { padding: 8px 12px; border: 1px solid #e2e8f0; }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 12px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>STOWAVE™ ENTERPRISE STRATEGIC AUDIT</h1>
          <p>Official Executive Intelligence Report & Workspace Analysis</p>
        </div>
        <div class="meta">
          <div><span>User:</span> ${user?.name || 'Executive'} (${user?.title || user?.role || 'Admin'})</div>
          <div><span>Department:</span> ${user?.department || 'Executive Leadership'}</div>
          <div><span>Date:</span> ${new Date().toLocaleString()}</div>
        </div>
        <div class="content" style="white-space: pre-wrap; font-size: 14px;">${messageText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <div class="footer">
          Confidential — Stowave Global Workspace Intelligence • team.stowave.com
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } catch (err) {
    console.error('Print error:', err);
  }
}

// ==========================================
// 3. MAIN AI ASSISTANT DRAWER COMPONENT
// ==========================================

export default function AiAssistantDrawer({
  isOpen,
  onClose,
  currentUser,
  stats,
  tasks,
  users
}) {
  const router = useRouter();

  // Storage key per logged-in user
  const userChatStorageKey = useMemo(() => {
    return `stowave_ai_chat_${currentUser?.id || 'guest'}`;
  }, [currentUser?.id]);

  // Initial welcome message per user
  const getInitialMessage = () => {
    const firstName = currentUser?.name?.split(' ')[0] || 'Executive';
    const isAdmin = currentUser?.role === 'admin';
    if (isAdmin) {
      return {
        role: 'assistant',
        content: `Salam **${firstName}**! Main aapka Stowave AI Strategic Advisor hoon.\n\nMain aapke poore workspace (Team Members, Tasks, Reports, Live Presence, aur Operations) se **real-time synced** hoon.\n\nAap mujh se kisi bhi task ki update, team performance ka jaiza, ya poori company ka **comprehensive audit** karwa sakte hain. Main detailed audit report generate kar k uski **downloadable PDF** bhi provide kar sakta hoon.\n\nAaj aap kis cheez ka review ya audit karna chahte hain?`
      };
    }
    return {
      role: 'assistant',
      content: `Salam **${firstName}**! Main aapka Stowave AI Assistant hoon.\n\nMain aapke assigned tasks, department workflow, aur workspace metrics ke sath real-time connected hoon. Kisi bhi task, deadline, ya guidance ke liye aap mujh se pooch sakte hain.`
    };
  };

  const [messages, setMessages] = useState([getInitialMessage()]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTrends, setSearchTrends] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Load chat history on mount or when currentUser changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(userChatStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch (err) {}
      setMessages([getInitialMessage()]);
    }
  }, [userChatStorageKey, currentUser?.id]);

  // Save messages to user's separate storage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(userChatStorageKey, JSON.stringify(messages));
      } catch (err) {}
    }
  }, [messages, userChatStorageKey]);

  // Clear / Reset chat
  const handleClearChat = () => {
    if (!confirm('Start a fresh conversation? This will clear the chat history for your account.')) return;
    const initial = [getInitialMessage()];
    setMessages(initial);
    try {
      localStorage.setItem(userChatStorageKey, JSON.stringify(initial));
    } catch (e) {}
  };

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Camera / Vision state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleVideoRef = (element) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      try {
        if (element.srcObject !== streamRef.current) {
          element.srcObject = streamRef.current;
        }
        element.play().catch(e => console.warn('Play handled:', e));
      } catch (err) {}
    }
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      try {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        videoRef.current.play().catch(e => console.warn('Play handled:', e));
      } catch (err) {}
    }
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopSpeaking();
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-To-Speech
  const speakText = (text) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`|]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setCapturedImage(null);
      setCameraLoading(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Play error:', e));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraLoading(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in browser settings.'
          : `Camera could not connect (${err.message || 'Busy'}).`
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try { videoRef.current.srcObject = null; } catch (e) {}
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    showToast('Message copied to clipboard!');
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast(`Copied link: ${url}`);
  };

  // Send message
  const handleSend = async (eOrPrompt = null) => {
    if (eOrPrompt && typeof eOrPrompt.preventDefault === 'function') {
      eOrPrompt.preventDefault();
      eOrPrompt.stopPropagation();
    }
    const rawMsg = typeof eOrPrompt === 'string' ? eOrPrompt : inputText;
    if ((!rawMsg.trim() && !capturedImage) || isLoading) return;

    const userMsg = rawMsg.trim() || (capturedImage ? 'Please analyze this live visual snapshot.' : '');
    const currentImage = capturedImage;

    setInputText('');
    setCapturedImage(null);

    const newMessages = [...messages, {
      role: 'user',
      content: userMsg,
      image: currentImage
    }];
    setMessages(newMessages);
    setIsLoading(true);
    stopSpeaking();

    // Prepare complete authenticated user context
    const userPayload = currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      department: currentUser.department,
      title: currentUser.title,
      points: currentUser.points,
      skills: currentUser.skills,
      bio: currentUser.bio,
      status: currentUser.status
    } : null;

    try {
      if (currentImage) {
        const response = await fetch('/api/ai/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage,
            prompt: userMsg,
            userContext: userPayload
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const reply = data.reply;
        setMessages([...newMessages, { role: 'assistant', content: reply, model: data.model }]);
        speakText(reply);

        if (data.actionExecuted) {
          try {
            window.dispatchEvent(new CustomEvent('stowave_data_updated', { detail: data.actionExecuted }));
            window.dispatchEvent(new CustomEvent('tasks-updated', { detail: data.actionExecuted }));
          } catch (evErr) {}
          showToast(`⚡ Workspace Action Executed: ${data.actionExecuted.type || 'Success'}`);
        }
      } else {
        const history = newMessages.slice(-6).map(m => ({ role: m.role, content: m.content }));
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMsg,
            history,
            searchTrends,
            userContext: userPayload
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const reply = data.reply;
        setMessages([...newMessages, { role: 'assistant', content: reply, model: data.model }]);
        speakText(reply);

        if (data.actionExecuted) {
          try {
            window.dispatchEvent(new CustomEvent('stowave_data_updated', { detail: data.actionExecuted }));
            window.dispatchEvent(new CustomEvent('tasks-updated', { detail: data.actionExecuted }));
          } catch (evErr) {}
          showToast(`⚡ Workspace Action Executed: ${data.actionExecuted.type || 'Success'}`);
        }
      }
    } catch (err) {
      console.error('AI Request error:', err);
      setMessages([...newMessages, {
        role: 'assistant',
        content: `⚠️ **Advisory Notice:** Connection issue: ${err.message}. Please verify your network or try again.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Helper: check if message qualifies as an Audit Report
  const isAuditMessage = (content) => {
    if (!content) return false;
    const lower = content.toLowerCase();
    return (
      lower.includes('audit') ||
      lower.includes('health index') ||
      lower.includes('operational health') ||
      lower.includes('bottlenecks') ||
      lower.includes('action directives') ||
      (lower.includes('executive summary') && content.includes('|'))
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '580px',
          zIndex: 1200,
          background: '#0f172a',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.84rem',
          fontWeight: 650,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Check size={14} color="#10b981" />
          {toastMessage}
        </div>
      )}

      {/* Dimmed backdrop */}
      <div 
        onClick={() => {
          stopCamera();
          stopSpeaking();
          onClose();
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1099,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Claude-grade Slide-over Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '580px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-20px 0 60px rgba(15, 23, 42, 0.2)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* 1. Header (Claude-style with user badge & quick actions) */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Stowave AI
                </h3>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: 'rgba(225, 29, 72, 0.1)',
                  color: '#be123c'
                }}>
                  Claude-grade Intelligence
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  Active User: <strong style={{ color: '#0f172a' }}>{currentUser?.name || 'Executive'}</strong> ({currentUser?.role === 'admin' ? 'Primary Admin' : 'Member'})
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleClearChat}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Start a new conversation"
            >
              <Plus size={13} />
              New Chat
            </button>

            {/* TTS Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setTtsEnabled(!ttsEnabled);
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '7px',
                color: ttsEnabled ? '#be123c' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={ttsEnabled ? 'Mute Speech' : 'Enable Speech'}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopCamera();
                stopSpeaking();
                onClose();
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '7px',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Close drawer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 2. Live Camera Viewport (if active) */}
        {isCameraActive && (
          <div style={{
            padding: '16px 20px',
            background: '#0f172a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '100%',
              maxHeight: '260px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#000000',
              position: 'relative'
            }}>
              <video
                ref={handleVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: 'rgba(225, 29, 72, 0.85)',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 750,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                LIVE STREAM
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={captureSnapshot}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Camera size={15} />
                Capture Snapshot for AI
              </button>
              <button
                type="button"
                onClick={stopCamera}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* 3. Snapshot Preview Banner */}
        {capturedImage && (
          <div style={{
            padding: '12px 20px',
            background: 'rgba(16, 185, 129, 0.08)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={capturedImage}
                alt="Captured visual preview"
                style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#047857' }}>
                  Visual Snapshot Ready
                </span>
                <p style={{ fontSize: '0.72rem', color: '#334155', margin: 0, fontWeight: 550 }}>
                  Will be analyzed by AI Vision models
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCapturedImage(null)}
              style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* 4. Messages Stream (Claude Experience) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          background: '#f8fafc'
        }}>
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            const isAudit = !isUser && isAuditMessage(m.content);

            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '84%' : '94%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  width: isUser ? 'auto' : '100%'
                }}
              >
                {/* Message Bubble */}
                <div style={{
                  padding: isUser ? '12px 18px' : '18px 22px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' : '#ffffff',
                  color: isUser ? '#ffffff' : '#0f172a',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  boxShadow: isUser ? '0 4px 14px rgba(225, 29, 72, 0.25)' : '0 2px 10px rgba(15, 23, 42, 0.04)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6
                }}>
                  {m.image && (
                    <img
                      src={m.image}
                      alt="User snapshot"
                      style={{
                        width: '100%',
                        maxHeight: '220px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  )}

                  {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 600 }}>
                      {m.content}
                    </div>
                  ) : (
                    <ClaudeMessageContent
                      content={m.content}
                      router={router}
                      onCopyLink={handleCopyLink}
                    />
                  )}
                </div>

                {/* Audit Action Banner (if this message contains an audit) */}
                {isAudit && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.04) 0%, rgba(225, 29, 72, 0.06) 100%)',
                    border: '1.5px solid rgba(225, 29, 72, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#e11d48" />
                      <div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                          Official Executive Audit Report Ready
                        </span>
                        <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                          Formatted with Stowave metrics & action directives
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => exportMessageToPdf(m.content, currentUser)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          background: '#e11d48',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 750,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)'
                        }}
                      >
                        <Download size={13} />
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => printStyledAuditReport(m.content, currentUser)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 650,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Print / Save Preview"
                      >
                        <Printer size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Actions Bar (Claude-style) */}
                {!isUser && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '2px 6px',
                    fontSize: '0.74rem',
                    color: '#64748b'
                  }}>
                    <span style={{ fontWeight: 600, color: '#94a3b8' }}>
                      Powered by {m.model || 'Groq Multi-Modal'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Copy message */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(m.content, idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedMsgIdx === idx ? '#10b981' : '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 650,
                          padding: '2px 4px'
                        }}
                        title="Copy full message"
                      >
                        {copiedMsgIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                        {copiedMsgIdx === idx ? 'Copied' : 'Copy'}
                      </button>

                      {/* Export PDF */}
                      <button
                        type="button"
                        onClick={() => exportMessageToPdf(m.content, currentUser)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 650,
                          padding: '2px 4px'
                        }}
                        title="Download message as PDF"
                      >
                        <Download size={13} />
                        PDF
                      </button>

                      {/* Read aloud */}
                      <button
                        type="button"
                        onClick={() => speakText(m.content)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#be123c',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 750,
                          padding: '2px 4px'
                        }}
                        title="Read aloud"
                      >
                        <Volume2 size={13} />
                        Read
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 20px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
            }}>
              <RefreshCw size={16} className="spin" color="#e11d48" />
              <span style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 650 }}>
                Synthesizing workspace intelligence...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 5. Quick Executive Prompt Chips */}
        <div style={{
          padding: '8px 16px',
          background: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {[
            { label: '📊 Workspace Audit', prompt: 'Meri company aur team ka complete executive audit kar k do, poori details aur performance score ke sath.' },
            { label: '🔍 Pending Tasks', prompt: 'Hmary pending tasks aur deliverable submissions ka detailed jaiza do.' },
            { label: '👥 Team Status', prompt: 'Tamam team members ki active status, points, aur workload summary btao.' },
            { label: '📈 Social Status', prompt: 'Stowave omnichannel social command center ki latest metrics aur engagement btao.' }
          ].map((chip, cIdx) => (
            <button
              key={cIdx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSend(chip.prompt)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '5px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 6. Input Form with Voice, Camera & Attachments */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSend(e);
          }} 
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {isListening && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#be123c',
              fontWeight: 750
            }}>
              <span className="pulse-dot" style={{ background: '#e11d48', width: '8px', height: '8px', borderRadius: '50%' }} />
              Listening to your voice... Speak now!
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* File Upload */}
            <label
              style={{
                cursor: 'pointer',
                padding: '9px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Attach screenshot or document"
            >
              <Upload size={16} />
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Camera Button */}
            <button
              type="button"
              onClick={isCameraActive ? stopCamera : startCamera}
              style={{
                padding: '9px',
                borderRadius: '8px',
                background: isCameraActive ? '#e11d48' : '#f8fafc',
                border: '1px solid #e2e8f0',
                color: isCameraActive ? '#ffffff' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isCameraActive ? 'Turn off camera' : 'Turn on live camera'}
            >
              {isCameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
            </button>

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              style={{
                padding: '9px',
                borderRadius: '8px',
                background: isListening ? '#e11d48' : '#f8fafc',
                border: '1px solid #e2e8f0',
                color: isListening ? '#ffffff' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSend(e);
                }
              }}
              placeholder={capturedImage ? 'Snapshot captured! Ask AI about it...' : `Ask Stowave AI (e.g. "Ali ko task assign karo", "task approve kr do")...`}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                fontWeight: 500
              }}
            />

            {/* Submit / Send Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSend(e);
              }}
              disabled={isLoading || (!inputText.trim() && !capturedImage)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: (!inputText.trim() && !capturedImage) || isLoading ? '#f1f5f9' : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: (!inputText.trim() && !capturedImage) || isLoading ? '#94a3b8' : '#ffffff',
                border: 'none',
                cursor: (!inputText.trim() && !capturedImage) || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 750,
                fontSize: '0.86rem',
                boxShadow: (!inputText.trim() && !capturedImage) || isLoading ? 'none' : '0 3px 12px rgba(225, 29, 72, 0.3)'
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </form>

      </div>
    </>
  );
}
