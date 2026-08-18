export type DeliveryProof = {
    id: string;
    deliveryId: string;
    recipientName: string;
    recipientSignature: string;
    photos: string[];
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
};

export interface DeliverySummaryProps {
    deliveryId: string;
    recipientName: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
}

export interface ProofOfDeliveryFormProps {
    onSubmit: (data: DeliveryProof) => void;
}

export interface SignatureCaptureProps {
    onCapture: (signature: string) => void;
}

export interface PhotoUploadProps {
    onUpload: (photo: string) => void;
}

export interface StatusBadgeProps {
    status: 'pending' | 'completed' | 'failed';
}