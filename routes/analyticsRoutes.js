const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth');

const readJSON = (filename) => {
  try {
    const filePath = path.join(__dirname, '..', 'data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return filename.endsWith('.json') && filename !== 'analytics.json' ? [] : {};
  }
};

router.get('/dashboard', auth, (req, res) => {
  try {
    const sportchilar = readJSON('sportchilar.json');
    const matches = readJSON('matches.json');
    const videos = readJSON('videos.json');
    const fans = readJSON('fans.json');
    const news = readJSON('news.json');
    const referees = readJSON('referees.json');
    const analytics = readJSON('analytics.json');

    const upcomingMatches = matches.filter(m => m.status === 'upcoming').length;
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const liveMatches = matches.filter(m => m.status === 'live').length;
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

    const dashboard = {
      stats: {
        totalFighters: sportchilar.length,
        activeFighters: sportchilar.filter(s => s.isActive).length,
        totalMatches: matches.length,
        upcomingMatches,
        completedMatches,
        liveMatches,
        totalVideos: videos.length,
        totalVideoViews: totalViews,
        totalFans: fans.length,
        totalNews: news.length,
        totalReferees: referees.length
      },
      recentActivities: analytics.recentActivities || [],
      revenue: {
        total: analytics.totalRevenue || 0,
        monthly: analytics.monthlyRevenue || []
      },
      topFighters: sportchilar
        .sort((a, b) => (b.wins || 0) - (a.wins || 0))
        .slice(0, 5)
        .map(f => ({ id: f.id, name: f.name, nickname: f.nickname, wins: f.wins, losses: f.losses, rank: f.rank })),
      recentMatches: matches
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Analytics olish xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
