import { FileCheck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import AppraisalSummaryCards from './AppraisalSummaryCards';

// Inside your parent component
const summaryItems = [
  {
    label: 'Total Appraisals',
    value: 24,
    icon: FileCheck,
    bg: 'bg-blue-100',
    color: 'text-blue-600'
  },
  {
    label: 'In Review',
    value: 7,
    icon: Clock,
    bg: 'bg-amber-100',
    color: 'text-amber-600'
  },
  {
    label: 'Pending Signatures',
    value: 3,
    icon: AlertTriangle,
    bg: 'bg-red-100',
    color: 'text-red-600'
  },
  {
    label: 'Completed',
    value: 14,
    icon: CheckCircle,
    bg: 'bg-emerald-100',
    color: 'text-emerald-600'
  }
];

// Render
<AppraisalSummaryCards items={summaryItems} />
