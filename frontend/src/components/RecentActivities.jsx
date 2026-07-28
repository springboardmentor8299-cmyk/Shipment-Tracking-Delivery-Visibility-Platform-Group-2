import "../styles/RecentActivities.css";
import { useEffect, useState } from 'react';
import activityService from '../services/activityService';

function RecentActivities(){
    const [activities, setActivities] = useState([]);

    const load = () => {
        activityService.getRecentActivities()
            .then(setActivities)
            .catch(() => setActivities([]));
    }

    useEffect(() => {
        load();
        const handler = () => load();
        window.addEventListener('activities:update', handler);
        return () => window.removeEventListener('activities:update', handler);
    }, []);

    return (
        <div className="activity-card">
            <h3>Recent Activities</h3>
            <ul>
                {activities.length === 0 && <li>No recent activities</li>}
                {activities.map(a => (
                    <li key={a.id}>{a.createdAt ? new Date(a.createdAt).toLocaleString() + ' - ' : ''}{a.username ? `${a.username} ` : ''}{a.action} - {a.details}</li>
                ))}
            </ul>
        </div>
    );
}

export default RecentActivities;