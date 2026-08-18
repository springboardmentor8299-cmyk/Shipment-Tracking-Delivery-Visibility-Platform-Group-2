import React from 'react';

interface StatusBadgeProps {
    status: 'pending' | 'delivered' | 'failed';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    let badgeClass = '';
    let badgeText = '';

    switch (status) {
        case 'pending':
            badgeClass = 'badge-pending';
            badgeText = 'Pending';
            break;
        case 'delivered':
            badgeClass = 'badge-delivered';
            badgeText = 'Delivered';
            break;
        case 'failed':
            badgeClass = 'badge-failed';
            badgeText = 'Failed';
            break;
        default:
            badgeClass = 'badge-default';
            badgeText = 'Unknown';
    }

    return (
        <span className={`status-badge ${badgeClass}`}>
            {badgeText}
        </span>
    );
};

export default StatusBadge;