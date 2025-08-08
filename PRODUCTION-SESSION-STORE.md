# 🔐 Production Session Store Configuration

## Current Issue

Your Render deployment shows this warning:

```
Warning: connect.session() MemoryStore is not designed for a production environment, as it will leak memory, and will not scale past a single process.
```

## Why This Matters

- **Memory Leaks**: MemoryStore keeps all sessions in memory indefinitely
- **Scalability**: Won't work with multiple server instances
- **Data Loss**: Sessions are lost when server restarts
- **Performance**: Memory usage grows over time

## Solution Options

### Option 1: MongoDB Session Store (Recommended)

Since you're already using MongoDB, this is the most efficient solution.

#### Install Dependencies

Add to [`backend/package.json`](backend/package.json):

```json
{
  "dependencies": {
    "connect-mongo": "^5.1.0"
  }
}
```

#### Update Session Configuration

In your session configuration file, replace the current setup:

```typescript
// Before (MemoryStore)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// After (MongoDB Store)
import MongoStore from "connect-mongo";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600, // lazy session update
      ttl: 14 * 24 * 60 * 60, // 14 days session expiry
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
```

### Option 2: Redis Session Store (High Performance)

For high-traffic applications, Redis provides the best performance.

#### Install Dependencies

```json
{
  "dependencies": {
    "connect-redis": "^7.1.0",
    "redis": "^4.6.0"
  }
}
```

#### Configuration

```typescript
import RedisStore from "connect-redis";
import { createClient } from "redis";

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL, // Add this to Render environment variables
});

redisClient.connect().catch(console.error);

// Configure session with Redis
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "ltocms:",
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
```

## Implementation Steps

### For MongoDB Session Store (Recommended):

1. **Update package.json**:

   ```bash
   npm install connect-mongo
   ```

2. **Find your session configuration** (likely in `src/server.ts` or `src/config/`)

3. **Replace the session middleware** with MongoDB store configuration

4. **Add SESSION_SECRET** to Render environment variables:

   ```
   SESSION_SECRET=your-very-secure-random-string-here
   ```

5. **Redeploy** to Render

### For Redis Session Store:

1. **Add Redis service** to your Render account (paid feature)
2. **Install Redis dependencies**
3. **Configure Redis connection**
4. **Update session middleware**
5. **Add REDIS_URL** to environment variables

## Environment Variables to Add

Add these to your Render dashboard:

```
SESSION_SECRET=generate-a-secure-random-string-here
```

For Redis (if using Option 2):

```
REDIS_URL=redis://your-redis-instance-url
```

## Benefits After Implementation

✅ **No Memory Leaks**: Sessions stored in database, not memory
✅ **Scalable**: Works with multiple server instances
✅ **Persistent**: Sessions survive server restarts
✅ **Configurable**: Set custom expiry times
✅ **Production Ready**: Designed for high-traffic applications

## Testing

After implementation, the warning should disappear and you should see:

```
✅ Session store configured: MongoDB
✅ Server running on port 5000 in production mode
```

## Session Store Comparison

| Feature          | MemoryStore | MongoDB Store | Redis Store |
| ---------------- | ----------- | ------------- | ----------- |
| Production Ready | ❌          | ✅            | ✅          |
| Scalable         | ❌          | ✅            | ✅          |
| Persistent       | ❌          | ✅            | ✅          |
| Performance      | Fast        | Good          | Excellent   |
| Setup Complexity | Simple      | Easy          | Medium      |
| Additional Cost  | Free        | Free\*        | Paid        |

\*Free if using existing MongoDB instance

## Recommended Implementation

For your LTOCMS project, I recommend **MongoDB Session Store** because:

- You're already using MongoDB
- No additional infrastructure needed
- Easy to implement
- Production-ready
- Cost-effective

---

**🎯 Implementing MongoDB session store will eliminate the warning and make your application production-ready!**
