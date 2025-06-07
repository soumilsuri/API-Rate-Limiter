import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helpers to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main log analysis controller
export const analyzeLogs = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../sample_api_logs.json');
    const rawData = await readFile(filePath, 'utf-8');
    const logs = JSON.parse(rawData);

    const ipCount = new Map();
    const endpointCount = new Map();
    const error5xx = new Map();

    logs.forEach(({ ip, endpoint, status }) => {
      // Count IPs
      ipCount.set(ip, (ipCount.get(ip) || 0) + 1);

      // Count Endpoints
      endpointCount.set(endpoint, (endpointCount.get(endpoint) || 0) + 1);

      // Track 5xx errors
      if (status >= 500 && status < 600) {
        error5xx.set(endpoint, (error5xx.get(endpoint) || 0) + 1);
      }
    });

    // Convert Maps to sorted arrays
    const topIPs = [...ipCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }));

    const topEndpoints = [...endpointCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([endpoint, count]) => ({ endpoint, count }));

    const errorStats = [...error5xx.entries()]
      .map(([endpoint, count]) => ({ endpoint, error_5xx_count: count }));

    // Send JSON response
    res.json({
      topIPs,
      topEndpoints,
      error5xxByEndpoint: errorStats,
      totalLogs: logs.length,
    });

  } catch (error) {
    console.error('Log analysis failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
