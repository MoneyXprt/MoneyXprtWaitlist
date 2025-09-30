const { supabase } = require('./lib/supabase');

async function testBoth() {
  // Test INSERT
  const { data: insertData, error: insertError } = await supabase
    .from('tax_profiles')
    .insert({ current_responses: { test: 'data' }, future_responses: { test: 'future' } });
  console.log('Insert Data:', insertData, 'Insert Error:', insertError);

  // Test SELECT
  const { data: selectData, error: selectError } = await supabase
    .from('tax_profiles')
    .select('*');
  console.log('Select Data:', selectData, 'Select Error:', selectError);
}

testBoth();