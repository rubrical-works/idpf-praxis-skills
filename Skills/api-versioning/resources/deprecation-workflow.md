# Deprecation Workflow
**Version:** v0.4.0

Step-by-step process for deprecating and sunsetting API versions.

## Deprecation Lifecycle

```
┌─────────┐    ┌────────────┐    ┌────────┐    ┌─────────┐
│ Active  │ →  │ Deprecated │ →  │ Sunset │ →  │ Removed │
└─────────┘    └────────────┘    └────────┘    └─────────┘
    │               │                │             │
Full support   Still works      Warning       Unavailable
```

## Phase 1: Planning

### Pre-Deprecation Checklist

- [ ] Identify version to deprecate
- [ ] Determine replacement version
- [ ] Set deprecation timeline
- [ ] Write migration guide
- [ ] Identify affected clients
- [ ] Prepare communication plan

### Timeline Planning

**Minimum recommended timelines:**

| API Type | Deprecation Notice | Sunset Period | Total |
|----------|-------------------|---------------|-------|
| Internal | 1 month | 1 month | 2 months |
| Partner | 3 months | 3 months | 6 months |
| Public | 6 months | 6 months | 12 months |
| Enterprise | 12 months | 6 months | 18 months |

### Documentation Requirements

**Migration guide must include:**
1. What's changing
2. Why it's changing
3. Step-by-step migration instructions
4. Code examples (before/after)
5. FAQ
6. Support contacts

## Phase 2: Announcement

### Communication Channels

1. **Documentation**
   - Update API docs with deprecation notice
   - Add migration guide
   - Update changelog

2. **Direct Communication**
   - Email registered API users
   - Notify partner contacts
   - Post in developer forums

3. **API Response Headers**
   ```
   Deprecation: true
   Sunset: Sat, 01 Jun 2025 00:00:00 GMT
   Link: <https://api.example.com/migration>; rel="deprecation"
   ```

4. **Dashboard/Console**
   - Display deprecation banner
   - Show usage of deprecated endpoints

### Announcement Template

```markdown
# API Deprecation Notice

## Summary
API version [v1] is being deprecated in favor of [v2].

## Timeline
- **Deprecation Date:** [date] - v1 enters deprecation
- **Sunset Date:** [date] - v1 enters sunset period
- **End of Life:** [date] - v1 will be removed

## What's Changing
[Brief description of changes]

## Migration Path
See our [Migration Guide](link) for step-by-step instructions.

## Need Help?
- Email: api-support@example.com
- Forum: https://forum.example.com/api-migration
- Office Hours: [schedule]

## FAQ
Q: Can I get an extension?
A: Contact us before [date] to discuss options.
```

## Phase 3: Deprecation Period

### Implementation

**Add deprecation headers:**
```javascript
// Middleware
const deprecationMiddleware = (req, res, next) => {
  if (req.apiVersion === 'v1') {
    res.set('Deprecation', 'true');
    res.set('Sunset', 'Sat, 01 Jun 2025 00:00:00 GMT');
    res.set('Link', '<https://api.example.com/migration>; rel="deprecation"');
  }
  next();
};
```

**Log deprecated usage:**
```javascript
const logDeprecatedUsage = (req) => {
  if (req.apiVersion === 'v1') {
    metrics.increment('api.deprecated.v1.requests', {
      endpoint: req.path,
      client_id: req.auth?.clientId
    });
  }
};
```

### Monitoring

Track during deprecation:
- Request count by version
- Unique clients still using old version
- Migration progress
- Error rates during migration

### Support

During deprecation period:
- Answer migration questions promptly
- Provide code review for migrations
- Offer migration assistance for key partners
- Host office hours or webinars

## Phase 4: Sunset Period

### Increased Urgency

**Add warning to responses:**
```json
{
  "data": { ... },
  "warning": {
    "code": "DEPRECATED_VERSION",
    "message": "API v1 will be removed on 2025-06-01. Please migrate to v2.",
    "migration_guide": "https://api.example.com/migration"
  }
}
```

**Increase notification frequency:**
- Weekly emails to remaining users
- Dashboard warnings
- Direct outreach to heavy users

### Client Identification

```sql
-- Find clients still using deprecated API
SELECT
  client_id,
  COUNT(*) as request_count,
  MAX(timestamp) as last_request
FROM api_logs
WHERE version = 'v1'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY client_id
ORDER BY request_count DESC;
```

### Extension Requests

**Criteria for extensions:**
- Valid business reason
- Migration plan in progress
- Not requested previously
- Limited time extension only

**Extension process:**
1. Client requests extension
2. Review migration progress
3. Grant limited extension if valid
4. Document exception
5. Set new hard deadline

## Phase 5: Removal

### Pre-Removal Checklist

- [ ] All major clients migrated
- [ ] Extension requests processed
- [ ] Final notification sent
- [ ] Removal plan tested
- [ ] Error response prepared

### Removal Implementation

**Option 1: Return 410 Gone**
```javascript
app.use('/v1', (req, res) => {
  res.status(410).json({
    error: 'VERSION_REMOVED',
    message: 'API v1 has been removed. Please use v2.',
    migration_guide: 'https://api.example.com/migration',
    current_version: 'v2'
  });
});
```

**Option 2: Redirect to documentation**
```javascript
app.use('/v1', (req, res) => {
  res.redirect(301, 'https://api.example.com/docs/migration');
});
```

**Option 3: Proxy to new version (temporary)**
```javascript
// Only for compatible endpoints
app.use('/v1', (req, res, next) => {
  req.url = req.url.replace('/v1/', '/v2/');
  next();
});
```

### Post-Removal

1. Monitor for 410/redirect traffic
2. Keep migration guide available
3. Respond to late migration requests
4. Document lessons learned
5. Archive old version code

## Communication Templates

### Initial Announcement Email

```
Subject: [Action Required] API v1 Deprecation Notice

Dear Developer,

We're writing to inform you that API v1 will be deprecated
on [date] and removed on [date].

What this means for you:
- Your current integration will continue working until [date]
- We recommend migrating to v2 before [deprecation date]
- After [removal date], v1 requests will return errors

Next steps:
1. Review the migration guide: [link]
2. Update your integration to use v2
3. Test in our sandbox environment

Need help? Contact us at [support email]

Best regards,
The API Team
```

### Sunset Warning Email

```
Subject: [Urgent] API v1 Removal in 30 Days

Dear Developer,

This is a reminder that API v1 will be removed on [date],
which is 30 days from now.

Our records show you've made [X] requests to v1 endpoints
in the past week.

If you haven't started migration:
- Migration guide: [link]
- Office hours: [schedule]
- Priority support: [email]

If you need an extension, please contact us immediately
at [email] with your migration timeline.

Best regards,
The API Team
```

### Final Notice Email

```
Subject: [Final Notice] API v1 Removal Tomorrow

Dear Developer,

This is your final reminder that API v1 will be removed
tomorrow, [date].

After this date, all v1 requests will return HTTP 410 Gone.

If you're still using v1, please migrate immediately or
contact us for emergency support at [phone/email].

Best regards,
The API Team
```

## Metrics to Track

### Throughout Deprecation

| Metric | Target |
|--------|--------|
| v1 request % | Decreasing |
| v2 adoption % | Increasing |
| Migration support tickets | Decreasing |
| Client migration rate | Steady/increasing |

### Success Criteria

- < 1% traffic on deprecated version at sunset
- < 0.1% traffic at removal
- Zero critical client outages
- Positive migration feedback

---

**See SKILL.md for complete API versioning guidance**
