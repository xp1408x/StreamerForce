# 🔥 COMPREHENSIVE PERFORMANCE REMEDIATION PLAN (v2)
## Content Creator Unique Webpage - Supabase API Optimization

**Last Updated:** Feb 6, 2026, 19:00 UTC  
**Status:** ⚠️ Comprehensive plan with server-side optimization + TanStack Query  
**Priority:** 🔴 BLOCKING - impacts all dashboard performance  

---

## EXECUTIVE SUMMARY

Your application has a **cascading API waterfall** + inefficient caching strategy.

### The Problem:
- **`get_my_permissions`**: Called **5 times in 272ms** on client (should be 0)
- **`fetchRoles`**: Called **2x** due to missing memoization
- **Detail modals**: Sequential queries (should be parallel)

### The Solution (Improved):
1. **Phase 0 (NEW!)**: Fetch permissions **server-side** → pass to Context as initialData
2. **Phase 1**: Centralize remaining client queries via Context
3. **Phase 2**: Memoize fetch functions with `useCallback`
4. **Phase 3**: Parallelize sequential queries
5. **Phase 4**: TanStack Query for intelligent caching (NOT manual cache!)

### Expected Result:
- **90% reduction** in client-side permission calls (from 5 → 0)
- **50% page load improvement** (500ms → 250ms)
- **Zero "flash" on hydration** (instant permissions on page load)

---

## PART 1: ROOT CAUSE ANALYSIS

### 1.1 The Permission Explosion (5x Calls)

**Evidence** (Feb 6, 17:59:52 UTC):
```
17:59:52.228 → get_my_permissions (Navbar)
17:59:52.229 → get_my_permissions (Sidebar)  
17:59:52.231 → get_my_permissions (Layout)
17:59:52.232 → get_my_permissions (Dashboard page)
17:59:52.505 → get_my_permissions (Strict Mode re-mount)
```

**Why This Happens:**
1. Each component calls `usePermissions()` independently
2. No shared instance or server-side prefetch
3. React Strict Mode triggers extra mount
4. Result: 5 RPC calls instead of 1

**Current Code** (`hooks/usePermissions.ts`):
```typescript
useEffect(() => {
  async function fetchPermissions() {
    const { data, error } = await supabase.rpc('get_my_permissions');
    setPermissions(data.map((p: any) => p.permission_slug));
    setLoading(false);
  }
  fetchPermissions();  // Fires on every component mount
}, []);
```

---

### 1.2 Missing Memoization (fetchRoles 2x)

**Evidence:**
```
17:59:52.521 → GET /roles (Call #1)
17:59:52.524 → GET /roles (Call #2) [3ms apart]
```

**Root Cause:** `fetchRoles()` not wrapped in `useCallback`

**Current Code** (`mod/users/page.tsx`):
```typescript
useEffect(() => {
  const fetchRoles = async () => { /* ... */ };  // ← Recreated every render
  fetchRoles();
}, [supabase]); // ← supabase object changes → effect re-runs
```

---

### 1.3 Sequential Queries in Modal

**Current Code** (`UserDetailClient.tsx`):
```typescript
const { data: level } = await supabase.rpc('get_my_max_level')           // Wait
const { data: perms } = await supabase.from('permissions')...            // Wait for level
const { data: profile } = await supabase.from('profiles')...             // Wait for perms
const { data: modData } = await supabase.rpc('get_moderation_data'...)   // Wait for profile
```

**Impact:** ~300ms instead of ~100ms with `Promise.all()`

---

## PART 2: IMPROVED IMPLEMENTATION ROADMAP

### ⭐ PHASE 0: Server-Side Permission Prefetch (🔴 CRITICAL - NEW!)

**Why This is Game-Changing:**
- Currently: User lands on page → skeleton/spinner → client fetches → delay
- With Phase 0: Permissions fetched **during SSR** → client hydrates with data
- Result: **Zero flash**, permissions instantly available

**0.1 Create lib/supabase/permissions-server.ts** (NEW)
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getPermissionsServer() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    
    const { data, error } = await supabase.rpc('get_my_permissions');
    if (error) return [];
    return data || [];
  } catch (error) {
    console.error('Server-side permission fetch failed:', error);
    return []; // Fallback: empty perms, client can retry if needed
  }
}
```

**0.2 Update app/layout.tsx**
```typescript
import { getPermissionsServer } from '@/lib/supabase/permissions-server';

export default async function RootLayout({ children }) {
  // Fetch permissions server-side during SSR
  const initialPermissions = await getPermissionsServer();
  
  return (
    <html>
      <body>
        <PermissionsProvider initialPermissions={initialPermissions}>
          {children}
        </PermissionsProvider>
      </body>
    </html>
  );
}
```

**0.3 Update PermissionsContext** (created in Phase 1)
```typescript
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context; // Returns initialData immediately, no loader
}
```

**Expected Result:**
- ✅ Server-side RPC call (1, during SSR)
- ✅ No client-side RPC calls for permissions
- ✅ No loading state/skeleton on initial page load
- ✅ FCP improvement: ~200-300ms faster

**Handles:** Auth'd users only (middleware ensures cookie is present)

---

### PHASE 1: Context-Based Permission Centralization (🔴 CRITICAL)

**Goal:** Make server-side permissions available to entire app

**1.1 Create lib/contexts/permissions-context.tsx** (NEW)
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PermissionsContextType {
  permissions: string[];
  isAdmin: boolean;
  isMod: boolean;
  isStreamer: boolean;
  loading: boolean;
  refetch: () => Promise<void>; // For manual permission refresh after mutations
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({
  children,
  initialPermissions = [],
}: {
  children: React.ReactNode;
  initialPermissions?: any[];
}) {
  const [permissions, setPermissions] = useState<string[]>(
    initialPermissions.map((p: any) => p.permission_slug)
  );
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const refetch = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.rpc('get_my_permissions');
      setPermissions(data?.map((p: any) => p.permission_slug) || []);
    } catch (error) {
      console.error('Error refetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const ADMIN_PERMISSIONS = [
    'admin:users:manage', 'admin:user:ban', 'admin:audit:view',
    // ... (same as before)
  ];
  const MOD_PERMISSIONS = ['blog:comment:moderate', 'shop:support:manage', ...];
  const STREAMER_PERMISSIONS = ['stream:manage:self', 'shop:item:manage:self', ...];

  const value = {
    permissions,
    isAdmin: permissions.some(p => ADMIN_PERMISSIONS.includes(p)),
    isMod: permissions.some(p => MOD_PERMISSIONS.includes(p)),
    isStreamer: permissions.some(p => STREAMER_PERMISSIONS.includes(p)),
    loading: initialPermissions.length === 0 && loading, // Only show loading if no initial data
    refetch,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
}
```

**1.2 Replace 5 Component Calls**
- ❌ Remove `usePermissions()` from:
  - `components/navbar.tsx:25`
  - `components/dashboard/sidebar.tsx:63`
  - `components/dashboard/dashboard-layout.tsx:18`
  - `app/dashboard/page.tsx:20`
  - Any other component
- ✅ Replace with `useContext(PermissionsContext)` or `usePermissions()`

**Expected:**
- ✅ **0 client-side permission RPC calls** (all via server in Phase 0)
- ✅ **90% reduction** vs. original waterfall
- ✅ Instant permission data on hydration

---

### PHASE 2: useCallback Memoization (🟡 HIGH)

**Goal:** Prevent duplicate queries from function recreation

**2.1 Fix mod/users/page.tsx** (fetchRoles)
```typescript
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ModUsersListPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const supabase = createClient();

  // Wrap in useCallback to prevent recreation on every render
  const fetchRoles = useCallback(async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name')
      .order('role_level', { ascending: false });
    
    if (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    } else {
      setRoles(data || []);
    }
  }, [supabase]); // Only recreate if supabase changes (it won't)

  // Effect now only runs when fetchRoles reference changes
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Rest of component...
}
```

**2.2 Fix admin/permissions/page.tsx** (fetchUsersWithRoles)
```typescript
const fetchUsersWithRoles = useCallback(async () => {
  setLoading(true);
  const { data, error } = await supabase.from('profiles')
    .select(`...`)
    .ilike('username', `%${searchTerm}%`)
    .limit(10);
  
  if (error) {
    console.error('Error fetching users:', error);
    setUsers([]);
  } else {
    const formattedUsers = data.map((profile: any) => ({
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      email: profile.email?.email || 'N/A',
      current_roles: profile.user_roles.map((ur: any) => ur.roles.name),
    }));
    setUsers(formattedUsers);
  }
  setLoading(false);
}, [supabase, searchTerm]); // Include searchTerm for dynamic search

useEffect(() => {
  fetchUsersWithRoles();
}, [fetchUsersWithRoles]);
```

**Expected:** 2x calls → 1x call (**50% reduction**)

---

### PHASE 3: Parallelization (🟡 HIGH)

**Goal:** Detail modal from 300ms → 150ms

**3.1 Update UserDetailClient.tsx**
```typescript
const fetchData = useCallback(async () => {
  if (didFetchRef.current) return;
  didFetchRef.current = true;

  setLoading(true);
  try {
    // Batch 1: Fetch level + permissions (independent)
    const [levelRes, permsRes] = await Promise.all([
      supabase.rpc('get_my_max_level'),
      supabase.from('permissions')
        .select('id, slug, short_description, description, weight')
        .eq('is_assignable', true)
        .lt('weight', 1000), // Use default level while fetching real one
    ]);

    const myCurrentLevel = levelRes.data || 0;
    setMyLevel(myCurrentLevel);
    setAssignablePerms(permsRes.data || []);

    // Batch 2: Fetch profile + moderation data (independent)
    const [profileRes, modRes] = await Promise.all([
      supabase
        .from('profiles')
        .select(`id, username, display_name, user_roles(roles(name, role_level))`)
        .eq('id', id)
        .single(),
      supabase.rpc('get_moderation_data', { p_user_id: id }),
    ]);

    if (profileRes.error || !profileRes.data) {
      throw new Error('Usuario no encontrado');
    }

    setUser({ ...profileRes.data, moderation_perms: modRes.data || [] });
  } catch (error: any) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
    onClose();
  } finally {
    setLoading(false);
  }
}, [id, supabase, toast, onClose]);
```

**Expected:** 300ms → 150ms (**2x faster**)

---

### PHASE 4: Intelligent Query Caching with TanStack Query (🟢 MEDIUM)

**Goal:** Prevent duplicate queries + smart invalidation + error handling

**⚠️ IMPORTANT DECISION:**

| Approach | Pros | Cons | Recommendation |
|----------|------|------|-----------------|
| **DIY Manual Cache** | No dependency | Risky (stale data), maintenance burden | ❌ NOT RECOMMENDED |
| **TanStack Query** | Production-tested, auto invalidation, error retry, dev tools | +35KB bundle | ✅ **RECOMMENDED** |

**Why TanStack Query Wins:**
- Automatic request deduplication (same query in 100ms = 1 call)
- Smart cache invalidation (mutations auto-invalidate related queries)
- Built-in error retries + exponential backoff
- Background refetching (keeps data fresh automatically)
- React Query DevTools for debugging
- Used by Vercel, Supabase, and enterprise apps

**4.1 Install TanStack Query**
```bash
npm install @tanstack/react-query
```

**4.2 Create QueryClientProvider**
```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 60 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

**4.3 Wrap app/layout.tsx** (after Phase 0)
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* PermissionsProvider from Phase 1 */}
      {/* Rest of app */}
      {children}
    </QueryClientProvider>
  );
}
```

**4.4 Wrap Dashboard Queries** (examples)
```typescript
import { useQuery } from '@tanstack/react-query';

// In mod/users/page.tsx
const { data: roles, isLoading } = useQuery({
  queryKey: ['roles'], // Deduplication key
  queryFn: async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name')
      .order('role_level', { ascending: false });
    if (error) throw error;
    return data;
  },
  staleTime: 60 * 1000, // 60 seconds
});

// In admin/permissions/page.tsx
const { data: users, isLoading } = useQuery({
  queryKey: ['users', searchTerm], // Deduplication + dependency
  queryFn: async () => {
    const { data, error } = await supabase.from('profiles')
      .select(`...`)
      .ilike('username', `%${searchTerm}%`)
      .limit(10);
    if (error) throw error;
    return data;
  },
});

// Mutation with automatic invalidation
const { mutate: changeRole } = useMutation({
  mutationFn: async ({ userId, role }) => {
    return await supabase.rpc('manage_user_role', { ... });
  },
  onSuccess: () => {
    // Auto-refresh users list
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

**Expected:**
- ✅ Duplicate queries completely eliminated
- ✅ Smart cache prevents unnecessary refetches
- ✅ Error handling consistent across app
- ✅ Mutations auto-invalidate related queries

---

### PHASE 5: Admin Dashboard Safeguards (🟢 MEDIUM)

**Goal:** Prevent accidental double-clicks + add optimistic updates

**5.1 Add Loading State to handleRoleChange** (admin/permissions/page.tsx)
```typescript
const [isChanging, setIsChanging] = useState(false);

const handleRoleChange = async (userId: string, currentRoles: string[], newRole: string) => {
  if (isChanging) return; // Prevent double-click
  setIsChanging(true);
  
  try {
    const { data, error } = await supabase.rpc('manage_user_role', {
      p_target_user_id: userId,
      p_role_name: newRole,
      p_action: 'assign',
    });

    if (error) throw error;
    if (data?.success) {
      toast({ title: 'Éxito', description: data.message });
      
      // Optimistic update instead of refetch
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, current_roles: [...u.current_roles, newRole] }
          : u
      ));
    }
  } catch (error: any) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  } finally {
    setIsChanging(false);
  }
};
```

**5.2 Add Disabled State to Button**
```tsx
<Button 
  onClick={() => handleRoleChange(...)}
  disabled={isChanging} // Disable during mutation
>
  {isChanging ? 'Asignando...' : 'Asignar Rol'}
</Button>
```

---

## PART 3: FILES TO MODIFY

| File | Phase | Action | Effort |
|------|-------|--------|--------|
| lib/supabase/permissions-server.ts | 0 | CREATE | 1h |
| app/layout.tsx | 0 + 1 + 4 | MODIFY | 1.5h |
| lib/contexts/permissions-context.tsx | 1 | CREATE | 1.5h |
| components/navbar.tsx | 1 | MODIFY | 30m |
| components/dashboard/sidebar.tsx | 1 | MODIFY | 30m |
| components/dashboard/dashboard-layout.tsx | 1 | MODIFY | 30m |
| app/dashboard/page.tsx | 1 | MODIFY | 30m |
| app/dashboard/mod/users/page.tsx | 2 + 4 | MODIFY | 1.5h |
| app/dashboard/admin/permissions/page.tsx | 2 + 4 + 5 | MODIFY | 2h |
| components/dashboard/UserDetailClient.tsx | 3 | MODIFY | 1h |
| lib/query-client.ts | 4 | CREATE | 30m |
| **TOTAL** | **-** | **-** | **~11h** |

---

## PART 4: BEFORE/AFTER COMPARISON

### Before (Current)
```
Timeline:
0ms   ├─ Navbar mounts → usePermissions → RPC #1
      ├─ Sidebar mounts → usePermissions → RPC #2
      ├─ Layout mounts → usePermissions → RPC #3
      ├─ Page mounts → usePermissions → RPC #4
      └─ Strict Mode → RPC #5
3ms   fetchRoles #1
5ms   fetchRoles #2 (React Strict Mode re-run)
100ms User list visible
300ms Detail modal opens (sequential: get_my_max_level → perms → profile → modData)
500ms Page fully interactive

Total Calls: 7+
```

### After (Optimized)
```
Timeline:
0ms   [SERVER-SIDE during SSR]
      └─ getPermissionsServer() → RPC #1 (on server, not counted in client)
0ms   [BROWSER]
      ├─ Layout hydrates with initialPermissions (no RPC)
      └─ All components use Context (no RPC)
2ms   fetchRoles via TanStack Query → RPC #2 (deduped, only 1 call)
3ms   fetchUsers starts (debounced)
100ms User list visible (faster!)
150ms Detail modal opens (parallel queries)
      ├─ Promise.all([get_my_max_level, perms])
      ├─ Promise.all([profile, modData])
200ms Modal fully interactive (+2x faster!)

Total Client Calls: 2-3
Total Improvement: 50% load time, 90% permission call reduction
```

---

## PART 5: VALIDATION CHECKLIST

After each phase:

### Phase 0
- [ ] `getPermissionsServer()` runs during SSR
- [ ] Initial page load shows permissions without skeleton
- [ ] `npm run build` succeeds

### Phase 1
- [ ] `get_my_permissions` appears 0x in client console
- [ ] All components still show correct permission badges
- [ ] No hydration mismatch errors

### Phase 2
- [ ] `fetchRoles` appears 1x (was 2x)
- [ ] `fetchUsersWithRoles` appears 1x
- [ ] Role filter works correctly

### Phase 3
- [ ] Detail modal loads in ~150ms (was ~300ms)
- [ ] All 4 queries show in parallel in DevTools
- [ ] No errors opening detail

### Phase 4 (TanStack Query)
- [ ] `npm install @tanstack/react-query` succeeds
- [ ] App still builds and runs
- [ ] Open React Query DevTools (dev only)
- [ ] Same query called twice = 1 network call (deduped)

### Phase 5
- [ ] Double-clicking "Assign Role" only triggers 1 RPC
- [ ] User list updates optimistically (no flicker)
- [ ] Permission changes persist

---

## NEXT STEPS

1. **Today**: Start **Phase 0 + Phase 1** (server-side perms + Context)
   - Why: Highest impact (eliminates waterfall immediately)
   
2. **This Week**: Complete **Phase 2** (useCallback memoization)
   - Quick wins, no dependencies
   
3. **Next Week**: **Phase 3 + 4** (parallelization + TanStack Query)
   - Phase 4 is worth it for long-term maintainability

---

## WHY THIS PLAN IS BETTER

✅ **Phase 0 (Server-side prefetch)**: Solves the root problem upstream  
✅ **TanStack Query (not DIY cache)**: Production-tested, safe, maintainable  
✅ **Estimated Effort**: ~11 hours for massive performance gain  
✅ **No Major Breaking Changes**: Gradual phases, each testable independently

---

## REFERENCE: vercel-react-best-practices Violations Fixed

- ✅ Section 1.1: Waterfall Elimination (5 parallel calls → 1 server call + Context distribution)
- ✅ Section 1.2: Parallelization (sequential awaits → `Promise.all()`)
- ✅ Section 3.2: Request deduplication (TanStack Query)
- ✅ Section 5.6: useCallback memoization (fetchRoles, fetchUsersWithRoles)
- ✅ Section 4.3: Optimistic UI updates (admin role changes)

---

## FAQ

**Q: Do I have to use TanStack Query?**  
A: No, but highly recommended. DIY cache is risky for production. If you must avoid dependencies, at least use a minimal deduplication layer.

**Q: Will Phase 0 break for unauthenticated users?**  
A: No, it returns empty array if not authenticated (middleware ensures only auth'd users reach dashboard).

**Q: Can I skip phases?**  
A: Start with Phase 0 + 1 (critical). Phase 2-5 are optimizations that compound benefits.

**Q: How much will bundle size increase?**  
A: TanStack Query adds ~35KB gzipped. Worth it for what you get. Your app is Vercel-deployed (plenty of capacity).

---

Plan ready for execution! Start with Phase 0 today. 🚀
