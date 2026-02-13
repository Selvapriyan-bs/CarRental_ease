# MongoDB Setup Instructions

## Install MongoDB Community Server

1. **Download MongoDB**
   - Go to https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Install with default settings

2. **Start MongoDB Service**
   ```bash
   # Option 1: Start as Windows Service (recommended)
   net start MongoDB
   
   # Option 2: Start manually
   mongod --dbpath "C:\data\db"
   ```

3. **Verify Installation**
   ```bash
   mongo --version
   # or
   mongosh --version
   ```

## Alternative: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/carrental
   ```

## Current Error Fix

The error shows MongoDB is not running. Start MongoDB service:

```bash
# Windows
net start MongoDB

# Or install and start MongoDB manually
```

Once MongoDB is running, the backend will connect successfully.