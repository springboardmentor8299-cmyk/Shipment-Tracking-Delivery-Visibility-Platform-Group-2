import React from 'react';
import Header from '../../components/Header';
import DeliverySummary from '../../components/DeliverySummary';
import ProofOfDeliveryForm from '../../components/ProofOfDeliveryForm';
import SignatureCapture from '../../components/SignatureCapture';
import PhotoUpload from '../../components/PhotoUpload';
import StatusBadge from '../../components/StatusBadge';

const DeliveryProof: React.FC = () => {
    return (
        <div className="delivery-proof">
            <Header />
            <DeliverySummary />
            <ProofOfDeliveryForm />
            <SignatureCapture />
            <PhotoUpload />
            <StatusBadge />
        </div>
    );
};

export default DeliveryProof;