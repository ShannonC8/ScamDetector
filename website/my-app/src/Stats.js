import './Stats.css';
import NavBar from './NavBar';
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const Stats = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/stats?email=${email}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="stats-container">Loading stats...</div>;
  if (!user) return <div className="stats-container">No data found.</div>;

  const analyzed = user.emails_analyzed || 0;
  const scams = user.scams_detected || 0;
  const reports = user.scams_reported || 0;
  const scamPercent = analyzed > 0 ? Math.round((scams / analyzed) * 100) : 0;

  const groupByDay = (timestamps) => {
    const dayCounts = {};
    timestamps.forEach(t => {
      const day = new Date(t).toISOString().split('T')[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    return Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => new Date(a.day) - new Date(b.day));
  };

  const scamGraphData = groupByDay(user.scam_history || []);
  const reportGraphData = groupByDay(user.report_history || []);

  const pieData = [
    { name: 'Likely Scam', value: user.likely_scam || 0 },
    { name: 'Maybe Scam', value: user.maybe_scam || 0 },
    { name: 'Not Scam', value: user.not_scam || 0 },
  ];

  const pieColors = ['#f44336', '#ff9800', '#4caf50'];

  return (
    <div className="stats-container">
      <NavBar />
      <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Scam Detection Dashboard
      </motion.h2>

      <motion.div className="stats-cards" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
        <div className="card green"><h3>{analyzed}</h3><p>Emails Analyzed</p></div>
        <div className="card red"><h3>{scams}</h3><p>Scams Detected</p></div>
        <div className="card blue"><h3>{reports}</h3><p>Scams Reported</p></div>
        <div className="card gray"><h3>{scamPercent}%</h3><p>Scam Percent</p></div>
      </motion.div>

      <h3>Scam Classification Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3>Scams Detected Per Day</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={scamGraphData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#4caf50" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <h3>Reports Submitted Per Day</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={reportGraphData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#f44336" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      
    </div>
  );
};

export default Stats;
