# School API Service with Rate Limiting

## Overview

This project provides a simple REST API to manage schools in a MySQL database with built-in rate limiting functionality. It supports adding schools and listing all schools sorted by proximity to a user's location, while protecting against excessive API usage through Redis-based rate limiting.

---

## Features

- **School Management**: Add and list schools with geolocation data
- **Distance Calculation**: Sort schools by proximity using Haversine formula
- **Rate Limiting**: Protect APIs with Redis-based sliding window rate limiter
- **Geographic Sorting**: Intelligent distance-based school listing

---

## Folder Structure

```
/
├── app.js                          # Express app setup and middleware registration
├── index.js                        # Server start file - connects DB/Redis and starts Express server
├── db/
│   └── index.js                    # MySQL connection setup (using mysql2/promise)
├── config/
│   └── redis.js                    # Redis client configuration and connection
├── models/
│   └── school.model.js             # School model that creates the `schools` table
├── controllers/
│   └── school.controller.js        # Controllers for Add School and List Schools endpoints
├── routes/
│   └── school.route.js             # Express routes with rate limiting middleware
├── middlewares/
│   └── rateLimiter.middleware.js   # Rate limiting middleware using Redis
├── .env                            # Environment variables (DB, Redis, Rate limit configs)
├── package.json
└── README.md                       # This documentation
```

---

## API Endpoints

### 1. Add School

* **URL:** `/api/school/addSchool`
* **Method:** `POST`
* **Rate Limit:** 3 requests per minute per IP
* **Payload:** JSON body with fields:
  * `name` (string, required)
  * `address` (string, required)
  * `latitude` (float, required)
  * `longitude` (float, required)
* **Function:** Validates input and inserts a new school record in the database.

### 2. List Schools

* **URL:** `/api/school/listSchools`
* **Method:** `GET`
* **Rate Limit:** 3 requests per minute per IP
* **Query Parameters:**
  * `latitude` (float, required)
  * `longitude` (float, required)
* **Function:** Fetches all schools and returns them sorted by distance from the user's location.

---

## Rate Limiting Implementation

### Approach
This API implements a **sliding window rate limiter** using Redis as the backing store. The rate limiter:

- Tracks requests per IP address
- Uses a sliding time window (default: 1 minute)
- Allows a maximum number of requests per window (default: 3)
- Returns HTTP 429 (Too Many Requests) when limit is exceeded
- Provides standard rate limit headers in responses

### Technical Details
- **Store**: Redis with `rate-limit-redis` adapter
- **Window**: Configurable sliding window (default: 60 seconds)
- **Limit**: Configurable per-IP request limit (default: 3 requests)
- **Headers**: Standard rate limiting headers included in responses
- **Persistence**: Rate limit data persists across server restarts

### Rate Limit Response
When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## Distance Calculation

The distance between the user's coordinates and each school's coordinates is calculated using the **Haversine formula**, which calculates the great-circle distance between two points on a sphere based on their latitudes and longitudes.

### Formula Summary:

```js
const R = 6371; // Earth's radius in kilometers

const dLat = toRad(lat2 - lat1);
const dLon = toRad(lon2 - lon1);

const a =
  Math.sin(dLat / 2) ** 2 +
  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

const distance = R * c; // distance in kilometers
```

* `toRad(value)` converts degrees to radians.
* The result is the distance in **kilometers** between two geo points.
* This distance is used to sort schools by proximity to the user's location.

---

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=schoolsdb
DB_PORT=3306

# Server Configuration
PORT=3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=yourredispassword

# Rate Limiting Configuration (Optional)
RATE_LIMIT_WINDOW_MS=60000      # 1 minute in milliseconds
RATE_LIMIT_MAX_REQUESTS=3       # Maximum requests per window
```

---

## Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** database server
- **Redis** server (for rate limiting)

---

## How to Run

1. **Install dependencies:**
```bash
npm install
```

2. **Set up MySQL database:**
   - Create a MySQL database
   - Update `.env` with your database credentials

3. **Set up Redis:**
   - Install and start Redis server
   - Update `.env` with your Redis configuration

4. **Configure environment:**
   - Copy the environment template above to `.env`
   - Update all values according to your setup

5. **Start the server:**
```bash
node index.js
```

6. **Test the APIs:**
   
   **Add a school:**
   ```bash
   curl -X POST http://localhost:3000/api/school/addSchool \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test School",
       "address": "123 Main St",
       "latitude": 40.7128,
       "longitude": -74.0060
     }'
   ```

   **List schools by proximity:**
   ```bash
   curl "http://localhost:3000/api/school/listSchools?latitude=40.7580&longitude=-73.9855"
   ```

---

## Live Demo

**🌐 Live API URL:** https://api-rate-limiter-0cge.onrender.com

⚠️ **Note**: This is deployed on Render's free tier, so the server may be asleep. Please make an initial request to wake it up before testing.

### Quick Rate Limiting Test

**Test URL:** https://api-rate-limiter-0cge.onrender.com/api/school/listSchools?latitude=40.7128&longitude=-74.0060

**Instructions:**
1. Click the test URL above 4 times quickly (or use curl/Postman)
2. First 3 requests should return school data
3. 4th request should return HTTP 429 (rate limit exceeded)
4. Wait 1 minute and try again - it should work

---

## Testing Rate Limiting

### Local Testing
To test the rate limiting functionality locally:

1. Make 3 requests quickly to any endpoint
2. The 4th request within the same minute will return HTTP 429
3. Wait for the time window to reset and try again

Example using curl (localhost):
```bash
# These should succeed
curl -X POST http://localhost:3000/api/school/addSchool -H "Content-Type: application/json" -d '{"name":"School1","address":"Address1","latitude":40.7128,"longitude":-74.0060}'
curl -X POST http://localhost:3000/api/school/addSchool -H "Content-Type: application/json" -d '{"name":"School2","address":"Address2","latitude":40.7129,"longitude":-74.0061}'
curl -X POST http://localhost:3000/api/school/addSchool -H "Content-Type: application/json" -d '{"name":"School3","address":"Address3","latitude":40.7130,"longitude":-74.0062}'

# This should return HTTP 429
curl -X POST http://localhost:3000/api/school/addSchool -H "Content-Type: application/json" -d '{"name":"School4","address":"Address4","latitude":40.7131,"longitude":-74.0063}'
```

### Live Demo Testing
Test the live API with curl:
```bash
# Test rate limiting on live server (make 4 requests quickly)
curl "https://api-rate-limiter-0cge.onrender.com/api/school/listSchools?latitude=40.7128&longitude=-74.0060"
curl "https://api-rate-limiter-0cge.onrender.com/api/school/listSchools?latitude=40.7128&longitude=-74.0060"
curl "https://api-rate-limiter-0cge.onrender.com/api/school/listSchools?latitude=40.7128&longitude=-74.0060"
curl "https://api-rate-limiter-0cge.onrender.com/api/school/listSchools?latitude=40.7128&longitude=-74.0060"
```

---

## Dependencies

### Core Dependencies
- `express` - Web framework
- `mysql2` - MySQL database driver
- `redis` - Redis client
- `express-rate-limit` - Rate limiting middleware
- `rate-limit-redis` - Redis store for rate limiter
- `dotenv` - Environment variable management
- `cors` - CORS middleware

### Dev Dependencies
- `nodemon` - Development server with auto-restart

---

## Notes

- The school model automatically creates the `schools` table if it doesn't exist
- Input validations ensure required fields are present and of correct data type
- CORS is enabled with open policy for easy testing
- Distances are always calculated in kilometers
- Rate limiting is applied per IP address using Redis for distributed rate limiting
- Redis connection is established at application startup and reused across requests
- Rate limit headers are included in all responses for client awareness

---