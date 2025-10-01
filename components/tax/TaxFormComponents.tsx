'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { FilingStatus, StateCode } from '@/lib/taxStrategies';

interface TaxInputProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function TaxInputField({ label, children, hint }: TaxInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FilingStatusSelect({ 
  value, 
  onChange 
}: { 
  value: FilingStatus;
  onChange: (value: FilingStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select filing status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="single">Single</SelectItem>
        <SelectItem value="married">Married Filing Jointly</SelectItem>
        <SelectItem value="head_of_household">Head of Household</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function StateSelect({ 
  value, 
  onChange 
}: { 
  value: StateCode;
  onChange: (value: StateCode) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CA">California</SelectItem>
        <SelectItem value="NY">New York</SelectItem>
        <SelectItem value="TX">Texas</SelectItem>
        <SelectItem value="FL">Florida</SelectItem>
        <SelectItem value="Other">Other State</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function MoneyInput({ 
  value, 
  onChange,
  placeholder = "0"
}: { 
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}) {
  return (
    <Input
      type="text"
      value={value ? value.toLocaleString() : ""}
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        onChange(val ? parseInt(val) : 0);
      }}
      placeholder={placeholder}
      className="font-mono"
    />
  );
}

export function PercentageSlider({ 
  value, 
  onChange,
  min = 0,
  max = 100
}: { 
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <Slider
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={1}
      />
      <div className="text-sm text-muted-foreground text-right">
        {value}%
      </div>
    </div>
  );
}

export function ToggleSwitch({ 
  value, 
  onChange,
  label
}: { 
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value}
        onCheckedChange={onChange}
      />
      <Label>{label}</Label>
    </div>
  );
}