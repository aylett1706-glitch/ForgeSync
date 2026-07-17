'use client';

import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, FileText, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  title: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  document_type?: string;
  document_category?: string;
}

interface Props {
  documents: Document[];
  onChange: (documents: Document[]) => void;
  title?: string;
  documentType?: string;
  documentCategory?: string;
  accept?: string;
}

export default function RelatedDocumentUpload({
  documents = [],
  onChange,
  title = 'Related Documents',
  documentType = 'incident_evidence',
  documentCategory = title,
  accept = '*/*',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);

    try {
      const uploaded: Document[] = await Promise.all(
        files.map(async (file) => {
          const result = await base44.integrations.Core.UploadFile({ file });
          return {
            title: file.name,
            file_url: result.file_url,
            file_size: file.size,
            file_type: file.type || 'application/octet-stream',
            document_type: documentType,
            document_category: documentCategory,
          };
        })
      );

      onChange([...documents, ...uploaded]);
      toast.success(`${uploaded.length} document${uploaded.length === 1 ? '' : 's'} uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Document upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeDocument = (index: number) => {
    onChange(documents.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <Card className="border-dashed border-slate-300 bg-slate-50/70">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500">Upload PDFs, forms, photos, or supporting files before submitting.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
          <input ref={inputRef} type="file" multiple accept={accept} onChange={handleUpload} className="hidden" />
        </div>

        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((document, index) => (
              <div key={`${document.file_url}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate font-medium">{document.title}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-600">
                    <a href={document.file_url} target="_blank" rel="noreferrer" aria-label={`View ${document.title || 'document'}`}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDocument(index)} className="h-8 w-8 text-red-500">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
