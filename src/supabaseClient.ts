import { createClient } from '@supabase/supabase-js';

// DATABASE 1
export const supabaseMain = createClient(
  'https://tskcxblanrtvzlctpcyd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2N4YmxhbnJ0dnpsY3RwY3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNjI0MjAsImV4cCI6MjA4MjYzODQyMH0.6epAPJdzgxe-pmG-rVtosdbg-dwF5lND6Xd18VgUeU0' // Ganti dengan anon key
);

// DATABASE 2
export const supabaseSecond = createClient(
  'https://kuzsjdtluabnfkzyffgz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1enNqZHRsdWFibmZrenlmZmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzI0NTQsImV4cCI6MjA2Njg0ODQ1NH0.D-OhicEqoxnnX8G-mwi2Y4X8_03dgDsy_flNj2YbYVI' // Ganti dengan anon key
);

// DEFAULT SUPABASE
export const supabase = supabaseMain;
