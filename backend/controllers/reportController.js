const FraudReport = require('../models/FraudReport');
const ScanResult = require('../models/ScanResult');

// City coordinates lookup for India
const CITY_COORDS = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'patna': { lat: 25.6093, lng: 85.1376 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
};

async function reportScam(req, res, next) {
  try {
    const { city, scamType, description, platform, severity } = req.body;

    const cityLower = city.toLowerCase().trim();
    const coords = CITY_COORDS[cityLower] || { lat: 20.5937, lng: 78.9629 };

    const report = await FraudReport.create({
      location: { ...coords, city: city.trim() },
      scamType,
      description,
      platform: platform || 'Unknown',
      severity: severity || 'Medium',
      reportedBy: 'Anonymous',
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

async function getFraudMap(req, res, next) {
  try {
    const reports = await FraudReport.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const cityStats = await FraudReport.aggregate([
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          lat: { $first: '$location.lat' },
          lng: { $first: '$location.lng' },
          types: { $push: '$scamType' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      reports,
      cityStats,
      totalReports: await FraudReport.countDocuments(),
    });
  } catch (err) {
    // Return seed data if DB not available
    res.json({
      reports: getSeedReports(),
      cityStats: getSeedCityStats(),
      totalReports: 937,
    });
  }
}

async function getStats(req, res, next) {
  try {
    const totalScans = await ScanResult.countDocuments();
    const totalReports = await FraudReport.countDocuments();
    const recentScans = await ScanResult.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Aggregate threat types
    const threatBreakdown = await ScanResult.aggregate([
      { $match: { 'result.riskLevel': { $in: ['SUSPICIOUS', 'FRAUD'] } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({ totalScans, totalReports, recentScans, threatBreakdown });
  } catch (err) {
    res.json({
      totalScans: 9680,
      totalReports: 937,
      recentScans: [],
      threatBreakdown: [
        { _id: 'text', count: 5230 },
        { _id: 'image', count: 2100 },
        { _id: 'url', count: 1580 },
        { _id: 'file', count: 420 },
        { _id: 'breach', count: 350 },
      ],
    });
  }
}

function getSeedReports() {
  return [
    { location: { lat: 19.076, lng: 72.8777, city: 'Mumbai' }, scamType: 'Digital Arrest', description: 'Fake CBI officer demanding money via video call', platform: 'WhatsApp', severity: 'High', createdAt: new Date() },
    { location: { lat: 28.7041, lng: 77.1025, city: 'Delhi' }, scamType: 'Phishing SMS', description: 'Fake bank KYC update link', platform: 'SMS', severity: 'High', createdAt: new Date() },
    { location: { lat: 12.9716, lng: 77.5946, city: 'Bangalore' }, scamType: 'Job Fraud', description: 'Fake remote job offer asking for deposit', platform: 'Telegram', severity: 'Medium', createdAt: new Date() },
    { location: { lat: 17.385, lng: 78.4867, city: 'Hyderabad' }, scamType: 'Investment Scam', description: 'Crypto doubling scheme via Instagram', platform: 'Instagram', severity: 'High', createdAt: new Date() },
    { location: { lat: 18.5204, lng: 73.8567, city: 'Pune' }, scamType: 'Digital Arrest', description: 'Impersonating customs officer about seized parcel', platform: 'Phone Call', severity: 'High', createdAt: new Date() },
    { location: { lat: 13.0827, lng: 80.2707, city: 'Chennai' }, scamType: 'Lottery Scam', description: 'Fake lottery winning notification via email', platform: 'Email', severity: 'Low', createdAt: new Date() },
    { location: { lat: 22.5726, lng: 88.3639, city: 'Kolkata' }, scamType: 'Romance Scam', description: 'Fake profile on dating app asking for money', platform: 'Dating App', severity: 'Medium', createdAt: new Date() },
    { location: { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad' }, scamType: 'Phishing Link', description: 'Fake e-commerce delivery notification', platform: 'SMS', severity: 'Medium', createdAt: new Date() },
    { location: { lat: 26.9124, lng: 75.7873, city: 'Jaipur' }, scamType: 'Tech Support', description: 'Fake Microsoft support call demanding remote access', platform: 'Phone Call', severity: 'High', createdAt: new Date() },
    { location: { lat: 26.8467, lng: 80.9462, city: 'Lucknow' }, scamType: 'UPI Fraud', description: 'Collect request instead of payment on PhonePe', platform: 'WhatsApp', severity: 'High', createdAt: new Date() },
  ];
}

function getSeedCityStats() {
  return [
    { _id: 'Delhi', count: 320, lat: 28.7041, lng: 77.1025, types: ['Phishing SMS', 'UPI Fraud', 'Digital Arrest'] },
    { _id: 'Mumbai', count: 245, lat: 19.076, lng: 72.8777, types: ['Digital Arrest', 'Investment Scam', 'Phishing'] },
    { _id: 'Bangalore', count: 210, lat: 12.9716, lng: 77.5946, types: ['Job Fraud', 'Tech Support', 'Phishing'] },
    { _id: 'Chennai', count: 112, lat: 13.0827, lng: 80.2707, types: ['Lottery Scam', 'UPI Fraud'] },
    { _id: 'Hyderabad', count: 85, lat: 17.385, lng: 78.4867, types: ['Investment Scam', 'Romance Scam'] },
    { _id: 'Pune', count: 65, lat: 18.5204, lng: 73.8567, types: ['Digital Arrest', 'Phishing'] },
    { _id: 'Kolkata', count: 58, lat: 22.5726, lng: 88.3639, types: ['Romance Scam', 'Lottery Scam'] },
    { _id: 'Jaipur', count: 42, lat: 26.9124, lng: 75.7873, types: ['Tech Support', 'UPI Fraud'] },
  ];
}

module.exports = { reportScam, getFraudMap, getStats };
