# Bohol Resources App

## Using Supabase generated types

This project generates TypeScript types from your Supabase schema at `src/lib/supabase.types.ts`.

Exports you’ll commonly use:
- `Database` – full database typing for the Supabase client
- `Tables<T>` – row type for a table
- `TablesInsert<T>` – insert type for a table
- `TablesUpdate<T>` – update/patch type for a table
- `Enums<T>` – enum type

### 1) Create a typed Supabase client

Server-side (preferred for secrets), e.g. `src/lib/server/supabase.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase.types';

export const supabase: SupabaseClient<Database> = createClient<Database>(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.PUBLIC_SUPABASE_ANON_KEY!
);
```

Browser-safe client (optional), e.g. `src/lib/supabase.client.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase.types';

export const supabase: SupabaseClient<Database> = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
```

### 2) Query with fully-typed helpers

Select rows (e.g. in `+page.server.ts`):

```ts
import type { Tables } from '$lib/supabase.types';
import { supabase } from '$lib/server/supabase';

export async function load() {
  const { data, error } = await supabase
    .from('professionals')
    .select('uid, profile_summary, tags, value_profile');

  if (error) throw error;
  const rows: Tables<'professionals'>[] = data ?? [];
  return { rows };
}
```

Insert rows:

```ts
import type { TablesInsert } from '$lib/supabase.types';
import { supabase } from '$lib/server/supabase';

const payload: TablesInsert<'education'> = {
  professional_id: 'uuid-here',
  school: 'UP',
  degree: 'BS Computer Science',
  year: 2020
};

const { error } = await supabase.from('education').insert(payload);
if (error) throw error;
```

Update rows:

```ts
import type { TablesUpdate } from '$lib/supabase.types';
import { supabase } from '$lib/server/supabase';

const patch: TablesUpdate<'user_profiles'> = {
  first_name: 'Neil',
  last_name: 'Bohol'
};

const { error } = await supabase
  .from('user_profiles')
  .update(patch)
  .eq('uid', 'uuid-here');
if (error) throw error;
```

Use enums:

```ts
import type { Enums } from '$lib/supabase.types';
const level: Enums<'skill_level'> = 'intermediate';
```

Pick only the fields you need:

```ts
import type { Tables } from '$lib/supabase.types';

type Professional = Tables<'professionals'>;
type ProfessionalPreview = Pick<Professional, 'uid' | 'profile_summary' | 'tags'>;
```

### 3) Keep types in sync

After any migration change in `../supabase/`, regenerate the types:

```bash
supabase gen types typescript --schema public > src/lib/supabase.types.ts
```

Tip: Commit `src/lib/supabase.types.ts` with your schema changes so CI and collaborators stay in sync.

