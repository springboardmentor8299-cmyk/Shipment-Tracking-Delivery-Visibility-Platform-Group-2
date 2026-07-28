import api from './api';

const getRecentActivities = () => api.get('/activities/recent', {
	headers: {
		Authorization: `Bearer ${localStorage.getItem('token')}`
	}
}).then(res => res.data);

export default { getRecentActivities };
