import React, { useState } from 'react';

const PhotoUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            // Logic to upload the file goes here
            console.log('Uploading:', selectedFile.name);
        }
    };

    return (
        <div className="photo-upload">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {selectedFile && (
                <div>
                    <p>Selected file: {selectedFile.name}</p>
                    <button onClick={handleUpload}>Upload Photo</button>
                </div>
            )}
        </div>
    );
};

export default PhotoUpload;