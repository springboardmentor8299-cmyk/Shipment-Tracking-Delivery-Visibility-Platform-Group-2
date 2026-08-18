import { useState, useEffect } from 'react';
import { fetchDeliveryProof, submitDeliveryProof } from './api';
import { DeliveryProofData } from './types';

export const useDeliveryProof = () => {
    const [deliveryProof, setDeliveryProof] = useState<DeliveryProofData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDeliveryProof = async () => {
            try {
                const data = await fetchDeliveryProof();
                setDeliveryProof(data);
            } catch (err) {
                setError('Failed to load delivery proof');
            } finally {
                setLoading(false);
            }
        };

        loadDeliveryProof();
    }, []);

    const handleSubmit = async (proofData: DeliveryProofData) => {
        setLoading(true);
        try {
            await submitDeliveryProof(proofData);
            setDeliveryProof(proofData);
        } catch (err) {
            setError('Failed to submit delivery proof');
        } finally {
            setLoading(false);
        }
    };

    return { deliveryProof, loading, error, handleSubmit };
};