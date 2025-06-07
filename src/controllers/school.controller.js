import {
  createSchool,
  getAllSchools,
} from '../models/school.model.js';

// Haversine formula for calculating distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const createSchoolHandler = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Input validation
  if (
    typeof name !== 'string' || name.trim() === '' ||
    typeof address !== 'string' || address.trim() === '' ||
    typeof latitude !== 'number' || isNaN(latitude) ||
    typeof longitude !== 'number' || isNaN(longitude)
  ) {
    return res.status(400).json({ message: 'Invalid input: name, address must be strings; latitude and longitude must be numbers.' });
  }

  try {
    const newSchool = await createSchool({ name, address, latitude, longitude });
    res.status(201).json(newSchool);
  } catch (error) {
    res.status(500).json({ message: 'Error creating school', error });
  }
};

export const listSchoolsHandler = async (req, res) => {
  const { latitude, longitude } = req.query;

  const userLat = parseFloat(latitude);
  const userLong = parseFloat(longitude);

  if (isNaN(userLat) || isNaN(userLong)) {
    return res.status(400).json({ message: 'Invalid query: latitude and longitude must be numbers.' });
  }

  try {
    const schools = await getAllSchools();

    const schoolsWithDistance = schools.map((school) => ({
      ...school,
      distance: calculateDistance(userLat, userLong, school.latitude, school.longitude)
    }));

    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(schoolsWithDistance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schools', error });
  }
};