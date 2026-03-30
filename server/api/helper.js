const axios = require('axios');

// Helper function to calculate distance using Mapbox API
const calculateDistance = async (origin, destination) => {
  try {
    const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_API_KEY}`;

    const response = await axios.get(url);
    const distanceInMeters = response.data.routes[0].distance;
    const distanceInKm = Math.round(distanceInMeters / 1000); // Convert meters to kilometers and round to nearest integer

    return distanceInKm;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
};

module.exports = {
  calculateDistance,
};
