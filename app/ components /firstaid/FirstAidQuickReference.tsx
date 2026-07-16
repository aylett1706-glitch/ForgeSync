'use client';

import React, { useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Activity, HeartPulse, Wind, Waves, Droplet, Flame, 
  Bone, Brain, Eye, Bug, Sun, Snowflake, Zap, Pill, ShieldAlert, 
  ShieldCheck, ShieldPlus, FileText, Users 
} from 'lucide-react';
import { toast } from 'sonner';

const ICON_MAP: Record<string, React.ElementType> = {
  Activity, HeartPulse, Wind, Waves, Droplet, Flame, Bone, Brain,
  Eye, Bug, Sun, Snowflake, Zap, Pill, ShieldAlert, ShieldCheck,
  ShieldPlus, FileText, Users
};

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
  steps: Array<{ letter?: string; title?: string; detail?: string }>;
}

export default function FirstAidQuickReference() {
  const supabase = createClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Elite Emergency Protocols');
  const [protocols, setProtocols] = useState<EliteProtocol[]>([]);

  // Load from Supabase (fallback to local if needed)
  React.useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('elite_protocols')
        .select('*')
        .order('category');

      if (error || !data?.length) {
        // Optional: import your static data as fallback
        console.warn('Using static fallback data');
        // You can import your original ELITE_QUICK_REFERENCE_ITEMS here
      } else {
        setProtocols(data);
      }
    };

    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return protocols.filter(item => {
      if (!term) return true;
      const searchText = [
        item.title,
        item.description,
        item.category,
        ...item.keywords,
        ...item.symptoms,
        ...item.redFlags,
        ...item.immediateActions,
        ...item.medications || [],
        ...item.notes,
        ...item.steps.flatMap(s => [s.title, s.detail])
      ].join(' ').toLowerCase();

      return searchText.includes(term);
    });
  }, [protocols, searchTerm]);

  const categories = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, EliteProtocol[]>);
  }, [filteredItems]);

  const availableCategories = Object.keys(categories);
  const currentCategory = availableCategories.includes(activeCategory) 
    ? activeCategory 
    : availableCategories[0] || '';

  const currentItems = categories[currentCategory] || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-br from-red-50 to-white p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">Elite Quick Reference</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Instant access to critical protocols, red flags, actions, and escalation guidance.
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symptoms, red flags, medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 text-base bg-white rounded-2xl border-2 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b">
        {availableCategories.map((cat) => (
          <Button
            key={cat}
            variant={currentCategory === cat ? 'default' : 'outline'}
            onClick={() => setActiveCategory(cat)}
            className="rounded-full"
          >
            {cat} <span className="ml-1.5 text-xs opacity-70">({categories[cat].length})</span>
          </Button>
        ))}
      </div>

      {/* Protocols Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {currentItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || Activity;
          return (
            <Card key={item.id} className="group hover:shadow-xl transition-all border-slate-200">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-50 rounded-2xl">
                    <Icon className="w-9 h-9 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">{item.severity}</Badge>
                      {item.call000 && <Badge className="bg-red-600">CALL 000</Badge>}
                      {item.ageGroup === 'paediatric' && <Badge variant="secondary">Paediatric</Badge>}
                    </div>
                    <h3 className="font-semibold text-xl leading-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </div>

                {item.redFlags.length > 0 && (
                  <div>
                    <p className="font-medium text-red-700 text-sm mb-2">RED FLAGS</p>
                    <div className="flex flex-wrap gap-1">
                      {item.redFlags.slice(0, 4).map((flag, i) => (
                        <span key={i} className="text-xs bg-red-50 px-2.5 py-1 rounded-full border border-red-100">• {flag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {item.immediateActions.length > 0 && (
                  <div>
                    <p className="font-medium text-emerald-700 text-sm mb-2">IMMEDIATE ACTIONS</p>
                    <ul className="text-sm space-y-1 text-slate-600">
                      {item.immediateActions.slice(0, 3).map((action, i) => (
                        <li key={i} className="flex gap-2">• {action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-red-50 group-hover:border-red-200"
                  onClick={() => toast.info(`Opened full protocol: ${item.title}`)}
                >
                  View Full Protocol →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentItems.length === 0 && (
        <Card className="border-dashed py-16">
          <CardContent className="text-center text-muted-foreground">
            No protocols match your search.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
