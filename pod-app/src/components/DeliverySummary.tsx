import React from 'react';

interface DeliverySummaryProps {
    deliveryId: string;
    recipientName: string;
    deliveryDate: string;
    status: string;
}

const DeliverySummary: React.FC<DeliverySummaryProps> = ({ deliveryId, recipientName, deliveryDate, status }) => {
    return (
        <div className="delivery-summary">
            <h2>Delivery Summary</h2>
            <p><strong>Delivery ID:</strong> {deliveryId}</p>
            <p><strong>Recipient Name:</strong> {recipientName}</p>
            <p><strong>Delivery Date:</strong> {deliveryDate}</p>
            <p><strong>Status:</strong> {status}</p>
        </div>
    );
};

export default DeliverySummary;