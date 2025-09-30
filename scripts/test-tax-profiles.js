const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testTaxProfiles() {
  console.log('Starting tax profiles test...');

  try {
    // Test INSERT
    const insertResult = await supabase
      .from('tax_profiles')
      .insert({
        current_responses: { test: 'data' },
        future_responses: { test: 'future' }
      });

    console.log('\nINSERT Test:');
    if (insertResult.error) {
      console.error('Insert Error:', insertResult.error);
    } else {
      console.log('Insert Success:', insertResult.data);
    }

    // Test SELECT
    const selectResult = await supabase
      .from('tax_profiles')
      .select('*')
      .limit(5);

    console.log('\nSELECT Test:');
    if (selectResult.error) {
      console.error('Select Error:', selectResult.error);
    } else {
      console.log('Select Success: Found', selectResult.data.length, 'records');
      console.log('First record:', selectResult.data[0]);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testTaxProfiles();