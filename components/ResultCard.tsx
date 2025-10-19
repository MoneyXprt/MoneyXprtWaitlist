import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResultCard(
  { title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }
) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        {right}
      </CardHeader>
      <CardContent className="space-y-2 overflow-x-hidden">{children}</CardContent>
    </Card>
  );
}
