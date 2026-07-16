'use client';

import React, { useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldAlert, HeartPulse, Wind, Brain, Droplet, 
  Flame, Bug, Pill, Bone, Users, Activity, Clock 
} from 'lucide-react';
import { toast } from 'sonner';

interface EliteProtocol {
  id: string;
  title: string;
  category: string;
  icon: string;
  severity: 'critical' | 'high' | 'moderate';
  ageGroup?: 'paediatric' | 'all';
  call000: boolean;
  description: string;
  keywords: string[];
  symptoms: string[];
  redFlags: string[];
  immediateActions: string[];
  medications?: string[];
  notes: string[];
  steps: string[];
}

const iconMap: Record<string, React.ElementType> = {
  HeartPulse, Activity, ShieldAlert, FileText, Users, Wind, 
  Brain, Droplet, Flame, Bug, Pill, Bone, Zap, Sun, Waves
};

export default function EliteQuickReference() {
  const supabase = createClient();
  const [protocols, setProtocols] = useState<EliteProtocol[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Load from Supabase or fallback to local data
  React.useEffect(() => {
    const loadProtocols = async () => {
      const { data, error } = await supabase
        .from('elite_protocols')
        .select('*')
        .order('category');

      if (error || !data?.length) {
        // Fallback to your original data
        import('@/data/eliteProtocols').then(mod => {
          setProtocols(mod.ELITE_QUICK_REFERENCE_ITEMS);
        });
      } else {
        setProtocols(data);
      }
    };

    loadProtocols();
  }, []);

  const filtered = useMemo(() => {
    return protocols.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [protocols, search, categoryFilter, severityFilter]);

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (severity === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search protocols, symptoms, keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Array.from(new Set(protocols.map(p => p.category))).map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const Icon = iconMap[item.icon] || ShieldAlert;
          return (
            <Card key={item.id} className="hover:shadow-md transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(item.severity)}>
                    {item.severity.toUpperCase()}
                  </Badge>
                </div>

                {item.call000 && (
                  <Badge variant="destructive" className="mt-3">CALL 000</Badge>
                )}

                <p className="text-sm text-slate-600 mt-4 line-clamp-3">
                  {item.description}
                </p>

                {item.redFlags.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-red-600 mb-1">RED FLAGS</p>
                    <div className="flex flex-wrap gap-1">
                      {item.redFlags.slice(0, 3).map((flag, i) => (
                        <span key={i} className="text-[10px] bg-red-50 px-2 py-0.5 rounded">• {flag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    // You can expand into a modal with full details
                    toast.info(`Opened: ${item.title}`);
                  }}
                >
                  View Full Protocol
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No matching protocols found.
        </div>
      )}
    </div>
  );
}
