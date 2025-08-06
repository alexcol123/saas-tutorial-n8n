'use client'

import React, { useState, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { Upload, User, MessageSquare, MapPin, Palette, Star, Mail, Loader2, X, AlertCircle } from 'lucide-react';

interface FormData {
  facePhoto: File | null;
  spokenTextTopic: string;
  gender: string;
  sceneSetting: string;
  characterStyle: string;
  famousFaceBlend: string;
  email: string;
}

const CartoonVideoForm = () => {
  const [formData, setFormData] = useState<FormData>({
    facePhoto: null,
    spokenTextTopic: '',
    gender: '',
    sceneSetting: '',
    characterStyle: '',
    famousFaceBlend: '',
    email: ''
  });
  
  const [formState, setFormState] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  console.log(generatedImage)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { 
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        facePhoto: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      facePhoto: null
    }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('face-photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('image')) {
        setFormData(prev => ({
          ...prev,
          facePhoto: file
        }));
        
        // Create preview URL for dropped file
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            setImagePreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async () => {
    // Reset error message
    setErrorMessage('');
    
    // Basic validation
    if (!formData.facePhoto || !formData.spokenTextTopic || !formData.gender || 
        !formData.sceneSetting || !formData.characterStyle || !formData.famousFaceBlend || 
        !formData.email) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setFormState('processing');
    
    try {
      // Create FormData for API
      const formDataToSend = new FormData();
      formDataToSend.append('Face_Photo', formData.facePhoto);
      formDataToSend.append('Spoken_Text_Topic', formData.spokenTextTopic);
      formDataToSend.append('Gender', formData.gender);
      formDataToSend.append('Scene_Setting', formData.sceneSetting);
      formDataToSend.append('Character_Style', formData.characterStyle);
      formDataToSend.append('Famous_Face_Blend', formData.famousFaceBlend);
      formDataToSend.append('Email', formData.email);

      // Send to our API route
      const response = await fetch('/api/create-video', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      // Check if we received a generated image
      if (result.imageGenerated) {
        setGeneratedImage(result.imageGenerated);
      }

      setFormState('success');

    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setErrorMessage(errorMsg);
      setFormState('error');
    }
  };

  const resetForm = () => {
    setFormData({
      facePhoto: null,
      spokenTextTopic: '',
      gender: '',
      sceneSetting: '',
      characterStyle: '',
      famousFaceBlend: '',
      email: ''
    });
    setFormState('form');
    setImagePreview(null);
    setErrorMessage('');
    setGeneratedImage(null);
  };

  const retrySubmission = () => {
    setFormState('form');
    setErrorMessage('');
  };

  if (formState === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Creating Your Video</h2>
          <p className="text-gray-600 leading-relaxed">
            Your cartoon video is being processed! Our AI is working its magic to create something amazing for you.
          </p>
          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Success!</h2>
          
          {/* Display Generated Image if available */}
          {generatedImage && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Generated Image Preview:</h3>
              <div className="relative inline-block">
                <Image 
                  src={`data:image/png;base64,${generatedImage}`}
                  alt="Generated cartoon"
                  width={300}
                  height={300}
                  className="max-w-full h-auto rounded-lg shadow-lg border-2 border-gray-200"
                  style={{ maxHeight: '300px' }}
                  unoptimized
                />
                <a
                  href={`data:image/png;base64,${generatedImage}`}
                  download="cartoon-preview.png"
                  className="absolute bottom-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {generatedImage 
              ? "Your cartoon image has been generated! The full video will be sent to your email in about 3 minutes."
              : "Check your email in about 3 minutes for your cartoon video!"
            }
          </p>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              📧 Video will be sent to: <strong>{formData.email}</strong>
            </p>
          </div>
          
          <button
            onClick={resetForm}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Create Another Video
          </button>
        </div>
      </div>
    );
  }

  if (formState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="space-y-3">
            <button
              onClick={retrySubmission}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={resetForm}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Cartoon Video Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your photo into an amazing animated cartoon video!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <Upload className="h-5 w-5 mr-2" />
                Face Photo *
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <Image 
                    src={imagePreview} 
                    alt="Preview"
                    width={96}
                    height={96}
                    className="object-cover rounded-lg border-2 border-gray-200"
                    unoptimized
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="face-photo"
                />
                <label htmlFor="face-photo" className="cursor-pointer">
                  {formData.facePhoto ? (
                    <div>
                      <div className="text-green-600 mb-2">✓ File uploaded</div>
                      <div className="text-sm text-gray-600">{formData.facePhoto.name}</div> 
                      <div className="text-xs text-gray-400 mt-1">Click to change image</div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Drop your photo here or <span className="text-purple-600 font-semibold">browse</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-2">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Spoken Text Topic */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <MessageSquare className="h-5 w-5 mr-2" />
                What should your character talk about? *
              </label>
              <textarea
                name="spokenTextTopic"
                value={formData.spokenTextTopic}
                onChange={handleInputChange}
                placeholder="e.g., Explaining quantum physics, sharing a favorite recipe, telling a joke..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <User className="h-5 w-5 mr-2" />
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Scene Setting */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <MapPin className="h-5 w-5 mr-2" />
                Scene Setting *
              </label>
              <input
                type="text"
                name="sceneSetting"
                value={formData.sceneSetting}
                onChange={handleInputChange}
                placeholder="e.g., coffee shop, office, beach, fantasy world, space station..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Character Style */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <Palette className="h-5 w-5 mr-2" />
                Character Style *
              </label>
              <input
                type="text"
                name="characterStyle"
                value={formData.characterStyle}
                onChange={handleInputChange}
                placeholder="e.g., Pixar, Disney, anime, comic book, realistic cartoon..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Famous Face Blend */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <Star className="h-5 w-5 mr-2" />
                Famous Face Blend *
              </label>
              <input
                type="text"
                name="famousFaceBlend"
                value={formData.famousFaceBlend}
                onChange={handleInputChange}
                placeholder="e.g., Ryan Reynolds, Jennifer Lawrence, Zendaya, Morgan Freeman..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <Mail className="h-5 w-5 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Create My Cartoon Video ✨
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Your video will be ready in about 3-5 minutes and sent to your email!
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartoonVideoForm;