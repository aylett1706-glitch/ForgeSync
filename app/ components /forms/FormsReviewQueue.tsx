'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface Submission {
  id: string;
  template_id?: string;
  template_name?: string;
  sector?: string;
  workflow_mode?: string;
  submission_date?: string;
  status: string;
}

interface Template {
  key: string;
  sector?: string;
  workflow_mode?: string;
}

interface Props {
  submissions: Submission[];
  templateMap: Record<string, Template>;
  onReview: (submission: Submission) => void;
  onApprove: (submission: Submission) => void;
}

export default function FormsReviewQueue({ 
  submissions = [], 
  templateMap = {}, 
  onReview, 
  onApprove 
}: Props) {
  const queue = submissions.filter(item => 
    ['submitted', 'in_review'].includes(item.status || '')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Queue ({queue.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No submissions are waiting for review.
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {queue.map((submission) => {
                const template = templateMap[submission.template_id || ''];
                return (
                  <div key={submission.id} className="rounded-xl border p-4">
                    <p className="font-semibold">{submission.template_name}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Sector:</span> {(submission.sector || template?.sector || 'general').replace(/_/g, ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Workflow:</span> {(submission.workflow_mode || template?.workflow_mode || 'simple').replace(/_/g, ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {submission.submission_date ? format(new Date(submission.submission_date), 'dd MMM yyyy') : '—'}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {submission.status.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onReview(submission)}>
                          Open
                        </Button>
                        <Button size="sm" onClick={() => onApprove(submission)}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((submission) => {
                    const template = templateMap[submission.template_id || ''];
                    return (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.template_name}</TableCell>
                        <TableCell className="capitalize">
                          {(submission.sector || template?.sector || 'general').replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="capitalize">
                          {(submission.workflow_mode || template?.workflow_mode || 'simple').replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>
                          {submission.submission_date 
                            ? format(new Date(submission.submission_date), 'dd MMM yyyy') 
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {submission.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onReview(submission)}
                            >
                              Open
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => onApprove(submission)}
                            >
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
