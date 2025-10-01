'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Strategy } from '@/lib/taxStrategies';

interface TaxAnalysisResultsProps {
  strategies: Strategy[];
  onReset: () => void;
}

export function TaxAnalysisResults({ strategies, onReset }: TaxAnalysisResultsProps) {
  const totalSavings = strategies.reduce((acc, strategy) => {
    if (typeof strategy.savings === 'number') {
      return acc + strategy.savings;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Tax Strategy Report</h2>
          <p className="text-muted-foreground">
            We've identified {strategies.length} strategies to optimize your tax situation
          </p>
        </div>
        <Button onClick={onReset} variant="outline">
          Start Over
        </Button>
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">Potential Tax Savings</h3>
            <div className="mt-2 text-4xl font-bold text-primary">
              ${totalSavings.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Estimated annual savings across all strategies
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {strategies.map((strategy) => (
          <Card key={strategy.strategyId} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{strategy.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant={strategy.complexity === 'Easy' ? 'default' : strategy.complexity === 'Medium' ? 'secondary' : 'destructive'}>
                      {strategy.complexity}
                    </Badge>
                    {strategy.requiresCPA && (
                      <Badge variant="outline">Requires CPA</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {typeof strategy.savings === 'number' 
                      ? `$${strategy.savings.toLocaleString()}`
                      : 'Varies'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Potential Savings
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {strategy.plainExplanation}
                </p>
                <div className="mt-4 text-sm">
                  <details>
                    <summary className="cursor-pointer font-medium">
                      Learn More
                    </summary>
                    <div className="mt-2 p-4 bg-muted rounded-md">
                      {strategy.details}
                    </div>
                  </details>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}