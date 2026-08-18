export const formatDeliveryDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const validateSignature = (signature: string): boolean => {
    return signature.trim().length > 0;
};

export const generateDeliverySummary = (deliveryDetails: {
    recipient: string;
    address: string;
    items: string[];
}): string => {
    return `Delivery to: ${deliveryDetails.recipient}\nAddress: ${deliveryDetails.address}\nItems: ${deliveryDetails.items.join(', ')}`;
};