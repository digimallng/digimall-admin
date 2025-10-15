# Performance Optimization Quick Reference

## Cache Times Reference

| Data Type | Stale Time | Cache Time | Refresh |
|-----------|------------|------------|---------|
| Dashboard Analytics | 3 minutes | 10 minutes | Manual |
| Revenue Data | 5 minutes | 15 minutes | Manual |
| Order Analytics | 3 minutes | 10 minutes | Manual |
| System Metrics | 2 minutes | 5 minutes | Manual |

## React Query Options Explained

```typescript
staleTime: 3 * 60 * 1000        // Data considered fresh for 3 minutes
                                 // Won't refetch during this time

cacheTime: 10 * 60 * 1000       // Keep in memory for 10 minutes
                                 // Used for instant navigation

refetchInterval: false           // No automatic background refresh
                                 // User controls refresh with button

refetchOnWindowFocus: false      // Don't refetch when window gains focus
                                 // Prevents unnecessary requests
```

## React Optimization Hooks

### useMemo
Caches computed values:
```typescript
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]); // Only recomputes when data changes
```

### useCallback
Caches functions:
```typescript
const handleClick = useCallback(() => {
  doSomething();
}, []); // Same function reference on every render
```

### React.memo
Caches components:
```typescript
export const MyComponent = memo(function MyComponent(props) {
  return <div>{props.value}</div>;
}); // Only re-renders when props change
```

## When to Use Each

### useMemo
Use for:
- Array transformations (map, filter)
- Complex calculations
- Expensive operations
- Derived state

### useCallback
Use for:
- Event handlers passed to children
- Functions used in dependencies
- Stable function references

### React.memo
Use for:
- Components that render often
- Components with expensive render
- List items
- Child components with stable props

## Common Patterns

### Memoized Formatter
```typescript
const formatCurrency = useCallback((value: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(value);
}, []);
```

### Memoized Data Transform
```typescript
const chartData = useMemo(() => {
  return rawData?.map(item => ({
    x: item.date,
    y: item.value,
  })) || [];
}, [rawData]);
```

### Memoized Component
```typescript
export const ListItem = memo(function ListItem({ id, name, onClick }) {
  return (
    <div onClick={onClick}>
      {name}
    </div>
  );
});
```

## Performance Checklist

### Loading States
- [ ] Progressive loading implemented
- [ ] Show cached data immediately
- [ ] Background refetch doesn't block UI

### Caching
- [ ] Appropriate staleTime set
- [ ] Reasonable cacheTime set
- [ ] Auto-refetch disabled (unless needed)
- [ ] Window focus refetch disabled

### Memoization
- [ ] Expensive computations use useMemo
- [ ] Event handlers use useCallback
- [ ] Child components use React.memo
- [ ] Dependencies are minimal

### API Calls
- [ ] Parallel requests when possible
- [ ] No waterfall requests
- [ ] Cached responses reused
- [ ] Manual refresh available

## Debug Performance

### React DevTools Profiler
1. Install React DevTools
2. Open Profiler tab
3. Start recording
4. Interact with page
5. Check render times

### Network Monitoring
```javascript
// Check request count
Performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/'))
  .length
```

### Component Re-renders
Add to component:
```typescript
useEffect(() => {
  console.log('Component rendered');
});
```

## Quick Wins

### Immediate Improvements
1. Add staleTime to all queries
2. Disable auto-refetch
3. Add useMemo for array operations
4. Add useCallback for event handlers

### Medium Improvements
5. Create memoized child components
6. Implement progressive loading
7. Add proper loading states
8. Optimize images

### Advanced Improvements
9. Code splitting
10. Lazy loading
11. Virtual scrolling
12. Web Workers

## Anti-Patterns to Avoid

❌ **Don't**
```typescript
// Creating objects in render
<Component config={{ foo: 'bar' }} />

// Creating functions in render
<Component onClick={() => handleClick()} />

// No dependencies
useMemo(() => expensive(), [])
```

✅ **Do**
```typescript
// Stable object reference
const config = useMemo(() => ({ foo: 'bar' }), []);
<Component config={config} />

// Memoized callback
const onClick = useCallback(() => handleClick(), []);
<Component onClick={onClick} />

// Proper dependencies
useMemo(() => expensive(data), [data])
```

## Measure Before Optimize

1. **Identify bottleneck** - DevTools Profiler
2. **Measure baseline** - Performance metrics
3. **Apply fix** - Specific optimization
4. **Measure improvement** - Compare metrics
5. **Verify no regression** - Test thoroughly

## Tools

- **React DevTools** - Component profiling
- **Chrome DevTools** - Network, Performance
- **Lighthouse** - Overall performance score
- **React Query DevTools** - Cache inspection

---

**Quick Tip**: Start with caching strategy, then add memoization where needed. Don't over-optimize!
