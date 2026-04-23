# 🚀 Supabase Setup Guide for STR Command Center

## Quick Start (5 minutes)

### Step 1: Access Your Project
1. Open: **https://supabase.com/dashboard**
2. Sign in with your credentials
3. You should see your project or create a new one

### Step 2: Run the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query** button
3. Copy the ENTIRE contents of the file below into the editor
4. Click **Run** (or press Ctrl+Enter)

**File to copy**: `C:\Users\JaZeR\.copilot\session-state\a9cabfab-f3a6-4292-9276-f3e5c0024093\files\database-schema.sql`

This creates:
- ✅ 17 tables (properties, reservations, guests, messages, tasks, pricing, etc.)
- ✅ All indexes for fast queries  
- ✅ Automatic timestamp triggers
- ✅ Foreign key relationships

### Step 3: Disable RLS (Development Mode)

Run this SQL in a new query to speed up development:

```sql
-- Temporarily disable Row Level Security for development
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_nightly_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE market_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE guidebook_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
```

**Note**: We'll add proper authentication and RLS policies later, but this unblocks development.

### Step 4: Create Your First Property

Run this SQL to create your rental property:

```sql
INSERT INTO properties (
    name, 
    slug, 
    property_type, 
    city, 
    state, 
    country, 
    timezone,
    bedrooms, 
    bathrooms, 
    max_guests, 
    base_price, 
    cleaning_fee
)
VALUES (
    'My Rental Property',           -- Change this to your property name
    'my-rental',                    -- URL-friendly slug
    'house',                        -- or 'apartment', 'condo', etc.
    'Your City',                    -- Your city
    'YourState',                    -- Your state
    'US',                           -- Country
    'America/Chicago',              -- Your timezone (see list below)
    3,                              -- Number of bedrooms
    2,                              -- Number of bathrooms
    6,                              -- Max guests
    150.00,                         -- Base nightly rate
    75.00                           -- Cleaning fee
);

-- Verify it was created
SELECT * FROM properties;
```

**Common Timezones**:
- `America/New_York` - Eastern Time
- `America/Chicago` - Central Time  
- `America/Denver` - Mountain Time
- `America/Los_Angeles` - Pacific Time
- `America/Phoenix` - Arizona (no DST)

### Step 5: Set Up Storage Bucket (Optional for now)

1. Click **Storage** in the left sidebar
2. Click **New bucket**
3. Name: `str-files`
4. Set to **Private**
5. Click **Create bucket**

We'll configure upload policies later.

### Step 6: Enable Authentication (Optional for now)

1. Click **Authentication** in the left sidebar
2. Click **Providers**
3. Enable **Email** provider
4. Choose **Magic Link** for passwordless login (recommended)
5. Save

---

## Verification

After setup, verify everything works:

```sql
-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show 17 tables:
-- calendar_blocks, custom_nightly_prices, expenses, guidebook_sections,
-- guests, market_data, message_automation_rules, message_templates,
-- message_threads, messages, pricing_rules, properties, reservations,
-- scheduled_messages, task_attachments, tasks, transactions
```

---

## What's Next?

Once this setup is complete:
1. ✅ Database schema is live
2. ✅ Property record exists
3. ✅ Ready for app integration

Let me know when you've completed these steps and I'll continue building the application to connect to your database!

---

## Troubleshooting

**"relation already exists" error?**
- You already have some tables. Either drop them or skip those CREATE TABLE statements.

**Can't connect from app?**
- Check that your `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Permission denied errors?**
- Make sure you disabled RLS (Step 3) or add proper policies

**Need help?**
- Just ask! I'm here to assist.
