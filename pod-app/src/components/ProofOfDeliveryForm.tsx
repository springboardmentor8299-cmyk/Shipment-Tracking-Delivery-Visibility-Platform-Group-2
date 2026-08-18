import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SignatureCapture from './SignatureCapture';
import PhotoUpload from './PhotoUpload';

const ProofOfDeliveryForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [signature, setSignature] = useState(null);
    const [photo, setPhoto] = useState(null);

    const onSubmit = (data) => {
        const formData = {
            ...data,
            signature,
            photo,
        };
        console.log('Form submitted:', formData);
        // Here you would typically send formData to your API
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="recipientName">Recipient Name</label>
                <input
                    id="recipientName"
                    {...register('recipientName', { required: true })}
                />
                {errors.recipientName && <span>This field is required</span>}
            </div>
            <div>
                <label htmlFor="deliveryDate">Delivery Date</label>
                <input
                    type="date"
                    id="deliveryDate"
                    {...register('deliveryDate', { required: true })}
                />
                {errors.deliveryDate && <span>This field is required</span>}
            </div>
            <div>
                <label htmlFor="deliveryAddress">Delivery Address</label>
                <input
                    id="deliveryAddress"
                    {...register('deliveryAddress', { required: true })}
                />
                {errors.deliveryAddress && <span>This field is required</span>}
            </div>
            <PhotoUpload setPhoto={setPhoto} />
            <SignatureCapture setSignature={setSignature} />
            <button type="submit">Submit Proof of Delivery</button>
        </form>
    );
};

export default ProofOfDeliveryForm;