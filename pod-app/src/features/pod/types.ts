export interface ProofOfDelivery {
    id: string;
    deliveryId: string;
    recipientName: string;
    recipientSignature: string;
    deliveryDate: Date;
    photos: string[];
    status: 'pending' | 'delivered' | 'failed';
}

export interface DeliverySummary {
    deliveryId: string;
    recipientName: string;
    deliveryDate: Date;
    status: 'pending' | 'delivered' | 'failed';
}

export interface PhotoUploadResponse {
    url: string;
    success: boolean;
    message?: string;
}