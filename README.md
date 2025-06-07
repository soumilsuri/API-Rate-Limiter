# School API Service

## Overview

This project provides a simple REST API to manage schools in a MySQL database.
It supports adding schools and listing all schools sorted by proximity to a user’s location.

---

## Folder Structure

```
/
├── app.js               # Express app setup and middleware registration
├── index.js             # Server start file - connects DB and starts Express server
├── db/
│   └── index.js         # MySQL connection setup (using mysql2/promise)
├── models/
│   └── school.model.js  # School model that creates the `schools` table
├── controllers/
│   └── school.controller.js  # Controllers for Add School and List Schools endpoints
├── routes/
│   └── school.route.js   # Express routes for /addSchool and /listSchools
├── .env                 # Environment variables (DB credentials, PORT, etc.)
├── package.json
└── README.md            # This documentation
```

---

## API Endpoints

### 1. Add School

* **URL:** `/api/school/addSchool`
* **Method:** `POST`
* **Payload:** JSON body with fields:

  * `name` (string, required)
  * `address` (string, required)
  * `latitude` (float, required)
  * `longitude` (float, required)
* **Function:** Validates input and inserts a new school record in the database.

### 2. List Schools

* **URL:** `/api/school/listSchools`
* **Method:** `GET`
* **Query Parameters:**

  * `latitude` (float, required)
  * `longitude` (float, required)
* **Function:**
  Fetches all schools and returns them sorted by distance from the user's location.

---

## Distance Calculation

The distance between the user’s coordinates and each school’s coordinates is calculated using the **Haversine formula**, which calculates the great-circle distance between two points on a sphere based on their latitudes and longitudes.

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

## How to Run

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your MySQL credentials and optional PORT:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdbname
DB_PORT=3306
PORT=3000
```

3. Start the server:

```bash
node index.js
```

4. Test APIs via Postman or any HTTP client:

* **Add school:** POST to `/api/school/addSchool` with JSON body
* **List schools:** GET `/api/school/listSchools?latitude=XX.XXXX&longitude=YY.YYYY`

---

## Notes

* The school model automatically creates the `schools` table if it doesn’t exist.
* Input validations ensure required fields are present and of correct data type.
* CORS is enabled with open policy for easy testing.
* Distances are always calculated in kilometers.

---