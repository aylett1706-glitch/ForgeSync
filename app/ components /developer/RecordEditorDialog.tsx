import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Save, Trash2, Plus, AlertTriangle } from 'lucide-react';

// --- Supabase Client ---
const supabase = createClientComponentClient();

// --- Types ---
interface RecordEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  record?: Record<string, unknown> | null;
  onSaved: () => void;
}

export default function RecordEditorDialog({
  open,
  onOpenChange,
  entityName,
  record,
  onSaved,
}: RecordEditorDialogProps) {
  const isNew = !record;
  const [jsonText, setJsonText] = useState<string>('{\n  \n}');
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (record) {
        // Strip built-in read-only fields for editing
        const editable = { ...record };
        delete editable.id;
        delete editable.created_at;
        delete editable.updated_at;
        delete editable.created_by;
        setJsonText(JSON.stringify(editable, null, 2));
      } else {
        setJsonText('{\n  \n}');
      }
      setParseError(null);
    }
  }, [open, record]);

  const validateJson = (text: string): boolean => {
    try {
      JSON.parse(text);
      setParseError(null);
      return true;
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON format');
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateJson(jsonText)) return;
    const data = JSON.parse(jsonText) as Record<string, unknown>;
    setSaving(true);

    try {
      if (isNew) {
        const { error } = await supabase
          .from(entityName)
          .insert(data);

        if (error) throw error;
        toast.success(`${entityName} record created`);
      } else {
        const { error } = await supabase
          .from(entityName)
          .update(data)
          .eq('id', record.id);

        if (error) throw error;
        toast.success(`${entityName} record updated`);
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!record?.id) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from(entityName)
        .delete()
        .eq('id', record.id);

      if (error) throw error;
      toast.success(`${entityName} record deleted`);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isNew ? (
              <Plus className="w-5 h-5 text-green-600" />
            ) : (
              <Save className="w-5 h-5 text-blue-600" />
            )}
            {isNew ? `Create ${entityName}` : `Edit ${entityName}`}
            {record?.id && (
              <Badge variant="outline" className="font-mono text-xs">
                {String(record.id)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isNew
                ? `Enter JSON data for the new ${entityName} record. Built-in fields (id, created_at, etc.) are set automatically.`
                : 'Edit the JSON below. Built-in read-only fields have been removed for clarity.'}
            </p>

            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                if (parseError) validateJson(e.target.value);
              }}
              onBlur={() => validateJson(jsonText)}
              className="font-mono text-sm min-h-[350px] bg-slate-950 text-green-400 border-slate-700 focus:border-blue-500"
              spellCheck={false}
            />

            {parseError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Invalid JSON: {parseError}</span>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <div>
              {!isNew && (
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !!parseError}>
                {isNew ? <Plus className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                {saving ? 'Saving...' : isNew ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
