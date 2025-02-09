'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function CreateListing() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
  });

  // Cloudinary Upload Function

  //store image
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Image = reader.result;

        if (!base64Image) {
          console.error('❌ No Base64 Data');
          reject('Failed to read file');
          return;
        }

        try {
          const res = await fetch('/api/cloudinary-upload', {
            // Change API route
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
          });

          const data = await res.json();
          if (res.ok) {
            resolve(data.url); //
          } else {
            reject(data.message || 'Upload failed');
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject('Error reading file');
    });
  };

  // image upload

  const handleImageUpload = async () => {
    if (!files.length) {
      setImageUploadError('Please select at least one image.');
      return;
    }

    setUploading(true);
    setImageUploadError(false);

    try {
      const uploadedUrls = await Promise.all(
        [...files].map(async (file) => {
          return await storeImage(file);
        })
      );

      if (uploadedUrls.length === 0) {
        throw new Error('No valid images uploaded');
      }

      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls], // ✅ Store array of image URLs
      }));

      console.log('✅ Uploaded images:', uploadedUrls);
    } catch (error) {
      setImageUploadError('Failed to upload image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  //handle submit

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length < 1) {
      return setError('You must upload at least one image');
    }

    setLoading(true);
    setError(false);

    try {
      console.log('📤 Sending Listing Data:', formData);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userMongoId: user.publicMetadata.userMogoId, // ✅ Include user data
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      console.log('✅ Listing Created:', data);
      router.push(`/listing/${data.data._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  if (!isLoaded)
    return (
      <h1 className="text-center text-xl my-7 font-semibold">Loading...</h1>
    );
  if (!isSignedIn)
    return (
      <h1 className="text-center text-xl my-7 font-semibold">
        You are not authorized to view this page
      </h1>
    );

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
        {/* Left Column */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          <div className="flex gap-6 flex-wrap">
            {['sale', 'rent', 'parking', 'furnished', 'offer'].map((item) => (
              <div key={item} className="flex gap-2">
                <input
                  type="checkbox"
                  id={item}
                  className="w-5"
                  onChange={handleChange}
                  checked={formData[item] || false}
                />
                <span className="capitalize">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6">
            {['bedrooms', 'bathrooms', 'regularPrice'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <input
                  type="number"
                  id={item}
                  min="1"
                  max="10"
                  required
                  className="p-3 border rounded-lg"
                  onChange={handleChange}
                  value={formData[item]}
                />
                <p className="capitalize">{item}</p>
              </div>
            ))}
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <p>Discount Price</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:{' '}
            <span className="font-normal text-gray-600 ml-2">
              First image is cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border rounded w-full"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading}
              className="p-3 text-green-700 border rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.map((url, index) => (
            <div
              key={url}
              className="flex justify-between p-3 border items-center"
            >
              <img
                src={url}
                alt="listing"
                className="w-20 h-20 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
              >
                Delete
              </button>
            </div>
          ))}
          <button
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            disabled={loading || uploading}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
