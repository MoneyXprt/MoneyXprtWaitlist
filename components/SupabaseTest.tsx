'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState('');

  const testConnection = async () => {
    setTestResult('Testing...');
    
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) { setTestResult('Supabase disabled: missing env'); return }
      
      // Test basic connection
      const { data, error } = await supabase.from('waitlist').select('count').limit(1);
      
      if (error) {
        setTestResult(`Connection test failed: ${error.message}`);
        console.error('Supabase test error:', error);
      } else {
        setTestResult('✅ Supabase connection working');
        console.log('Supabase test success:', data);
      }
    } catch (err) {
      setTestResult(`Network error: ${err}`);
      console.error('Network error:', err);
    }
  };

  return (
    <div className="p-4 border rounded bg-yellow-50">
      <h3 className="font-semibold mb-2">Debug: Supabase Connection</h3>
      <button 
        onClick={testConnection}
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        Test Connection
      </button>
      {testResult && <p className="mt-2 text-sm">{testResult}</p>}
    </div>
  );
}
