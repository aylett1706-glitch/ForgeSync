'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, ShieldCheck } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  guidance?: string;
  section?: string;
}

interface FormTemplate {
  key: string;
  title: string;
  description: string;
  category?: string;
  sector?: string;
  workflow_mode?: string;
  schema?: {
    fields: FormField[];
    framework?: string;
    guidance?: string[];
    sections?: string[];
  };
}

interface Props {
  template: FormTemplate | null;
  organization?: any;
  onClose: () => void;
}

const getFieldPreviewValue = (field: FormField): string => {
  if (field.type === 'select') return field.options?.[0] || 'Selected option';
  if (field.type === 'date') return new Date().toLocaleDateString('en-AU');
  if (field.type === 'datetime') return new Date().toLocaleString('en-AU');
  if (field.type === 'number') return '0';
  return 'Sample response / completed detail';
};

const buildPreviewHtml = (template: FormTemplate, organization?: any): string => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${template.title}</title>
    <style>
      body { font-family: Arial, system-ui, sans-serif; padding: 32px; color: #111827; line-height: 1.5; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 3px solid ${organization?.primary_color || '#0088A8'}; padding-bottom: 14px; margin-bottom: 24px; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .brand img { width: 56px; height: 56px; object-fit: contain; border-radius: 14px; border: 1px solid #e5e7eb; padding: 6px; }
      .brand-name { font-size: 22px; font-weight: 800; color: ${organization?.primary_color || '#0088A8'}; }
      .sub { color: #6b7280; font-size: 12px; margin-top: 4px; }
      h1 { font-size: 24px; margin: 18px 0 4px; color: #111827; }
      .desc { color: #4b5563; margin-bottom: 20px; }
      .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-size: 12px; font-weight: 700; margin-right: 6px; }
      .guidance { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; margin: 16px 0; color: #334155; font-size: 13px; }
      .section-title { margin: 22px 0 10px; font-size: 15px; font-weight: 900; color: #0f172a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
      .field { break-inside: avoid; margin-bottom: 14px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
      .label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: 6px; }
      .value { min-height: 26px; font-size: 14px; color: #111827; white-space: pre-wrap; }
      .required { color: #dc2626; }
      .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; }
      @media print { body { padding: 18px; } }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="brand">
        ${organization?.logo_url 
          ? `<img src="${organization.logo_url}" />` 
          : `<div style="width:56px;height:56px;background:#e5e7eb;border-radius:14px;padding:6px;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>`
        }
        <div>
          <div class="brand-name">${organization?.app_name || organization?.name || 'ForgeSync'}</div>
          <div class="sub">Branded form preview</div>
        </div>
      </div>
      <div class="sub">Generated: ${new Date().toLocaleString('en-AU')}</div>
    </div>

    <span class="badge">${template.sector?.replace(/_/g, ' ') || 'general'}</span>
    <span class="badge">${template.category?.replace(/_/g, ' ') || 'form'}</span>
    <span class="badge">${template.schema?.fields?.length || 0} fields</span>

    <h1>${template.title}</h1>
    <p class="desc">${template.description || ''}</p>

    ${template.schema?.framework ? 
      `<div class="guidance"><strong>Compliance framework:</strong> ${template.schema.framework}</div>` : ''}

    ${(template.schema?.guidance || []).length ? 
      `<div class="guidance"><strong>Completion guidance:</strong><ul>${template.schema.guidance.map((item: string) => `<li>${item}</li>`).join('')}</ul></div>` : ''}

    ${(template.schema?.sections || ['Form fields']).map((section: string) => `
      <div class="section-title">${section}</div>
      ${(template.schema?.fields || [])
        .filter((field: FormField) => (field.section || 'Core details') === section || (!field.section && section === 'Form fields'))
        .map((field: FormField) => `
          <div class="field">
            <div class="label">${field.label}${field.required ? ' <span class="required">*</span>' : ''}</div>
            <div class="value">${getFieldPreviewValue(field)}</div>
            ${field.guidance ? `<div class="sub">${field.guidance}</div>` : ''}
          </div>
        `).join('')}
    `).join('')}

    <div class="footer">
      Confidential organisational record. Use only in line with privacy, safeguarding and minimum necessary access requirements.
    </div>
  </body>
  </html>
`;

const getFieldPreviewValue = (field: FormField): string => {
  if (field.type === 'select') return field.options?.[0] || 'Selected option';
  if (field.type === 'date') return new Date().toLocaleDateString('en-AU');
  if (field.type === 'datetime') return new Date().toLocaleString('en-AU');
  if (field.type === 'number') return '0';
  return 'Sample response / completed detail';
};

interface Props {
  template: FormTemplate | null;
  organization?: any;
  onClose: () => void;
}

export default function TemplatePreviewDialog({ template, organization, onClose }: Props) {
  if (!template) return null;

  const printPreview = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(buildPreviewHtml(template, organization));
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
          <p className="text-sm text-slate-500">{template.description}</p>
        </DialogHeader>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              {organization?.logo_url ? (
                <img src={organization.logo_url} alt="" className="h-12 w-12 rounded-xl border object-contain p-1" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <ShieldCheck className="h-6 w-6 text-slate-500" />
                </div>
              )}
              <div>
                <p className="font-bold text-slate-950">
                  {organization?.app_name || organization?.name || 'ForgeSync'}
                </p>
                <p className="text-xs text-slate-500">Branded preview</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {template.sector?.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {template.category?.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline">
                {template.schema?.fields?.length || 0} fields
              </Badge>
            </div>
          </div>

          {template.schema?.framework && (
            <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
              <p className="font-bold">Compliance framework</p>
              <p className="mt-1">{template.schema.framework}</p>
            </div>
          )}

          {(template.schema?.guidance || []).length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">Completion guidance</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {template.schema.guidance.map((item: string) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-5 space-y-5">
            {(template.schema?.sections || ['Form fields']).map((section: string) => (
              <div key={section}>
                <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-slate-500">
                  {section}
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {(template.schema?.fields || [])
                    .filter((field: FormField) => 
                      (field.section || 'Core details') === section || 
                      (!field.section && section === 'Form fields')
                    )
                    .map((field: FormField) => (
                      <div key={field.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {field.label}{field.required ? ' <span class="text-red-500">*</span>' : ''}
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          {field.type === 'select' 
                            ? `Options: ${(field.options || []).join(', ')}` 
                            : `Field type: ${field.type}`}
                        </p>
                        {field.guidance && (
                          <p className="mt-2 text-xs leading-5 text-slate-500">{field.guidance}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={printPreview} className="gap-2">
            <Printer className="h-4 w-4" /> Print Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
