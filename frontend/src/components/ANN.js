import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import axios from 'axios';

const ANN = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Cloudinary configuration (same as Personal.js)
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlcujlif7/upload";
  const CLOUDINARY_UPLOAD_PRESET = "personal_space";

  useEffect(() => {
    // Check authentication
    if (!AuthService.isAuthenticated()) {
      navigate('/');
      return;
    }

    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    loadSubjectData();
  }, [navigate]);

  // Load subject data from backend (same pattern as Personal.js)
  const loadSubjectData = async () => {
    try {
      const token = await AuthService.getApiToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      if (!token) {
        console.error('❌ No valid token available');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/user/subject/ANN`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setNotes(data.notes || '');
        setFiles(data.files || []);
        console.log('✅ Loaded ANN subject data from backend:', data);
      }
    } catch (error) {
      console.error('❌ Failed to load ANN subject data:', error);
      // Set defaults on error
      setNotes('');
      setFiles([]);
    }
  };

  // Save data to backend (same pattern as Personal.js)
  const saveSubjectData = async (dataToUpdate) => {
    try {
      setIsSaving(true);
      const token = await AuthService.getApiToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      if (!token) {
        console.error('❌ No valid token available for saving');
        return false;
      }

      console.log('🔄 Saving ANN subject data:', dataToUpdate);
      const response = await axios.put(`${API_BASE_URL}/api/user/subject/ANN`, dataToUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ ANN subject data saved successfully:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Failed to save ANN subject data:', error);
      console.error('❌ Error details:', error.response?.data);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save for notes (same pattern as Personal.js)
  const saveTimeoutRef = useRef(null);
  const debouncedSaveNotes = useCallback((newNotes) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveSubjectData({ notes: newNotes });
    }, 2000);
  }, []);

  // Handle notes change
  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    debouncedSaveNotes(newNotes);
  };

  // Upload file to Cloudinary (same as Personal.js)
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.secure_url) {
        return {
          url: data.secure_url,
          publicId: data.public_id,
          originalName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size
        };
      } else {
        console.error('❌ Cloudinary upload failed:', data);
        return null;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  // Handle file upload (same pattern as Personal.js)
  const handleFileUpload = async (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    const newFiles = [...files];

    for (const file of selectedFiles) {
      const uploadResult = await uploadToCloudinary(file);
      if (uploadResult) {
        const fileData = {
          id: Date.now() + Math.random(),
          name: uploadResult.originalName,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          type: uploadResult.fileType,
          size: uploadResult.fileSize,
          uploadDate: new Date().toISOString()
        };
        newFiles.push(fileData);
      }
    }

    setFiles(newFiles);
    const saveSuccess = await saveSubjectData({ files: newFiles });

    if (saveSuccess) {
      console.log('✅ Files uploaded and saved successfully');
    } else {
      console.error('❌ Failed to save files to backend');
      setFiles(files); // Revert on failure
    }

    setIsUploading(false);
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // Delete file
  const deleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const updatedFiles = files.filter(file => file.id !== fileId);
      setFiles(updatedFiles);
      await saveSubjectData({ files: updatedFiles });
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileType, fileName = '') => {
    const type = fileType?.toLowerCase() || '';
    const name = fileName?.toLowerCase() || '';

    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(name)) return '🖼️';
    if (type.includes('pdf') || name.endsWith('.pdf')) return '📕';
    if (type.includes('word') || type.includes('document') || /\.(doc|docx)$/i.test(name)) return '📘';
    if (type.includes('excel') || type.includes('spreadsheet') || /\.(xls|xlsx|csv)$/i.test(name)) return '📗';
    if (type.includes('powerpoint') || type.includes('presentation') || /\.(ppt|pptx)$/i.test(name)) return '📙';
    if (type.includes('zip') || type.includes('rar') || /\.(zip|rar|7z|tar|gz)$/i.test(name)) return '📦';
    if (type.includes('text') || /\.(txt|md|rtf)$/i.test(name)) return '📄';
    return '📁';
  };

  // Download file
  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="ann-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2rem' }}>🧠</span>
          <h1 style={{ color: 'white', margin: 0 }}>Artificial Neural Networks</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isSaving && <span style={{ color: 'white' }}>💾 Saving...</span>}
          <button
            onClick={() => navigate('/general')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer'
            }}
          >
            ← Back to General
          </button>
        </div>
      </header>

      <main style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* File Upload Section */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>📁 Files & Resources</h2>

          <div style={{
            border: '2px dashed rgba(255,255,255,0.3)',
            borderRadius: '10px',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '20px',
            background: 'rgba(255,255,255,0.05)'
          }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,*/*"
              style={{ display: 'none' }}
            />

            <div style={{ color: 'white' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📤</div>
              <p>Upload ANN study materials</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {isUploading ? 'Uploading...' : 'Browse Files'}
              </button>
            </div>
          </div>

          {/* Files List */}
          <div>
            {files.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>No files uploaded yet</p>
            ) : (
              files.map(file => (
                <div key={file.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.type, file.name)}</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>{file.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => downloadFile(file)}
                      style={{
                        background: 'rgba(0,255,0,0.2)',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                      title="Download file"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      style={{
                        background: 'rgba(255,0,0,0.2)',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                      title="Delete file"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>📝 ANN Notes</h2>
          <textarea
            style={{
              width: '100%',
              height: '400px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              padding: '15px',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="Write your ANN notes here..."
            value={notes}
            onChange={handleNotesChange}
          />
          <div style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            marginTop: '10px',
            textAlign: 'right'
          }}>
            Words: {notes.split(/\s+/).filter(word => word.length > 0).length}
          </div>
        </div>
      </main>

      {/* ANN Topics Reference Section */}
      <div style={{
        marginTop: '30px',
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>📚 ANN Study Topics</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '10px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>🔤 Fundamentals</h3>
            <ul style={{ color: 'rgba(255,255,255,0.8)', margin: 0, paddingLeft: '20px' }}>
              <li>Introduction to Neural Networks</li>
              <li>Perceptron Model</li>
              <li>Multi-layer Perceptrons</li>
              <li>Activation Functions</li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '10px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>🎯 Learning Algorithms</h3>
            <ul style={{ color: 'rgba(255,255,255,0.8)', margin: 0, paddingLeft: '20px' }}>
              <li>Backpropagation</li>
              <li>Gradient Descent</li>
              <li>Learning Rate Optimization</li>
              <li>Regularization Techniques</li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '10px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>🚀 Advanced Topics</h3>
            <ul style={{ color: 'rgba(255,255,255,0.8)', margin: 0, paddingLeft: '20px' }}>
              <li>Convolutional Neural Networks</li>
              <li>Recurrent Neural Networks</li>
              <li>Deep Learning Architectures</li>
              <li>Transfer Learning</li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '10px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>💡 Practical Applications</h3>
            <ul style={{ color: 'rgba(255,255,255,0.8)', margin: 0, paddingLeft: '20px' }}>
              <li>Image Recognition</li>
              <li>Natural Language Processing</li>
              <li>Time Series Prediction</li>
              <li>Pattern Recognition</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ANN;
