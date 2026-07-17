'use client';

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle2, Clock, AlertTriangle, User, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  in_progress: Loader2,
  completed: CheckCircle2,
  overdue: AlertTriangle,
};

interface CorrectiveAction {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  assigned_by?: string;
  due_date?: string;
  priority: string;
  status: string;
  completed_at?: string;
}

interface Worker {
  id: string;
  full_name: string;
}

interface Props {
  incidentId: string;
  organizationId: string;
  workers: Worker[];
  currentUser: any;
}

export default function CorrectiveActions({
  incidentId,
  organizationId,
  workers = [],
  currentUser,
}: Props) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
  });

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['corrective-actions', incidentId],
    queryFn: () => base44.entities.CorrectiveAction.filter({
      incident_id: incidentId,
      organization_id: organizationId,
    }),
    enabled: !!incidentId && !!organizationId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => base44.entities.CorrectiveAction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions', incidentId] });
      setForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
      setShowForm(false);
      toast.success('Corrective action assigned');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => base44.entities.CorrectiveAction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-actions', incidentId] });
      toast.success('Action updated');
    },
  });

  const handleCreate = () => {
    if (!form.title || !form.assigned_to || !form.due_date) {
      toast.error('Please fill in title, assignee, and due date');
      return;
    }
    createMutation.mutate({
      organization_id: organizationId,
      incident_id: incidentId,
      title: form.title,
      description: form.description,
      assigned_to: form.assigned_to,
      assigned_by: currentUser?.id,
      due_date: form.due_date,
      priority: form.priority,
      status: 'pending',
    });
  };

  const handleStatusChange = (action: CorrectiveAction, newStatus: string) => {
    const data: any = { status: newStatus };
    if (newStatus === 'completed') {
      data.completed_at = new Date().toISOString();
    }
    updateMutation.mutate({ id: action.id, data });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Corrective Actions ({actions.length})
        </h4>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Assign Action
        </Button>
      </div>

      {showForm && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
          <div>
            <Label>Action title *</Label>
            <Input 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              placeholder="What needs to be done?" 
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              placeholder="Detailed instructions..." 
              rows={2} 
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Assign to *</Label>
              <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due date *</Label>
              <Input 
                type="date" 
                value={form.due_date} 
                onChange={(e) => setForm({ ...form, due_date: e.target.value })} 
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Assign'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-gray-500 text-sm">Loading actions...</div>
      ) : actions.length === 0 && !showForm ? (
        <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">No corrective actions assigned yet.</p>
      ) : (
        <div className="space-y-2">
          {actions.map((action: CorrectiveAction) => {
            const assignee = workers.find((w) => w.id === action.assigned_to);
            const assigner = workers.find((w) => w.id === action.assigned_by);
            const StatusIcon = STATUS_ICONS[action.status] || Clock;
            const isOverdue = action.status !== 'completed' && action.due_date && new Date(action.due_date) < new Date();

            return (
              <div key={action.id} className="rounded-xl border p-4 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusIcon className="w-4 h-4 shrink-0 text-gray-500" />
                      <span className="font-medium text-sm">{action.title}</span>
                      <Badge className={PRIORITY_COLORS[action.priority]}>{action.priority}</Badge>
                      <Badge className={isOverdue && action.status !== 'completed' ? 'bg-red-100 text-red-700' : STATUS_COLORS[action.status]}>
                        {isOverdue && action.status !== 'completed' ? 'overdue' : action.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {action.description && <p className="text-xs text-gray-600 mt-1">{action.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {assignee?.full_name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due {action.due_date ? format(new Date(action.due_date), 'MMM d, yyyy') : 'N/A'}
                      </span>
                      {assigner && <span>Assigned by {assigner.full_name}</span>}
                      {action.completed_at && (
                        <span className="text-green-600">Completed {format(new Date(action.completed_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  {action.status !== 'completed' && (
                    <div className="flex gap-1 shrink-0">
                      {action.status === 'pending' && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatusChange(action, 'in_progress')}>
                          Start
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-7 text-green-700 border-green-200 hover:bg-green-50" 
                        onClick={() => handleStatusChange(action, 'completed')}
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
