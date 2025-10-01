'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilingStatus, StateCode, TaxInfo } from '@/lib/taxStrategies';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function TaxScanPage() {
  const [formData, setFormData] = useState<TaxInfo>({
    filingStatus: "single",
    state: "CA",
    income: 0,
    hasRetirementPlan: false,
    currentRetirementContribution: 0,
    hasHSA: false,
    hasDependents: false,
    isHomeowner: false,
    mortgageInterest: 0,
    propertyTaxes: 0,
    hasBusinessIncome: false,
    businessIncome: 0,
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/tax-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      setResults(data.strategies || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tax Savings Scan</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Tell us about your financial situation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Filing Status</Label>
                  <Select 
                    value={formData.filingStatus}
                    onValueChange={(value: FilingStatus) => 
                      setFormData(prev => ({...prev, filingStatus: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married Filing Jointly</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>State of Residence</Label>
                  <Select 
                    value={formData.state}
                    onValueChange={(value: StateCode) => 
                      setFormData(prev => ({...prev, state: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Annual W-2 Income</Label>
                  <Input
                    type="number"
                    value={formData.income || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      income: Number(e.target.value)
                    }))}
                    placeholder="Enter your annual income"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.hasRetirementPlan}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      hasRetirementPlan: checked
                    }))}
                  />
                  <Label>Have 401(k) or similar retirement plan?</Label>
                </div>

                {formData.hasRetirementPlan && (
                  <div>
                    <Label>Current Annual Contribution</Label>
                    <Input
                      type="number"
                      value={formData.currentRetirementContribution || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        currentRetirementContribution: Number(e.target.value)
                      }))}
                      placeholder="Enter current contribution"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.hasHSA}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      hasHSA: checked
                    }))}
                  />
                  <Label>Eligible for HSA?</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.hasBusinessIncome}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      hasBusinessIncome: checked
                    }))}
                  />
                  <Label>Have side business income?</Label>
                </div>

                {formData.hasBusinessIncome && (
                  <div>
                    <Label>Annual Business Income</Label>
                    <Input
                      type="number"
                      value={formData.businessIncome || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        businessIncome: Number(e.target.value)
                      }))}
                      placeholder="Enter business income"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isHomeowner}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      isHomeowner: checked
                    }))}
                  />
                  <Label>Own real estate?</Label>
                </div>

                {formData.isHomeowner && (
                  <>
                    <div>
                      <Label>Annual Mortgage Interest</Label>
                      <Input
                        type="number"
                        value={formData.mortgageInterest || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          mortgageInterest: Number(e.target.value)
                        }))}
                        placeholder="Enter mortgage interest"
                      />
                    </div>
                    <div>
                      <Label>Annual Property Taxes</Label>
                      <Input
                        type="number"
                        value={formData.propertyTaxes || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          propertyTaxes: Number(e.target.value)
                        }))}
                        placeholder="Enter property taxes"
                      />
                    </div>
                  </>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Tax Savings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {results.map((strategy, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{strategy.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {typeof strategy.savings === 'number' 
                        ? `Estimated Savings: $${strategy.savings.toLocaleString()}`
                        : 'Savings: Varies based on specifics'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      strategy.complexity === 'Easy' ? 'bg-green-100 text-green-800' :
                      strategy.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {strategy.complexity}
                    </span>
                    {strategy.requiresCPA && (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        CPA Required
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{strategy.plainExplanation}</p>
              </CardContent>
            </Card>
          ))}
          
          {results.length === 0 && !loading && (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Submit the form to see your personalized tax savings strategies
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}