import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import axios from 'axios';
import '../styles/SubjectDetail.css';

const SubjectDetail = () => {
  const { subjectId, section } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Cloudinary configuration (same as Personal.js)
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlcujlif7/upload";
  const CLOUDINARY_UPLOAD_PRESET = "personal_space";

  // Subject data (in real app, this would come from backend)
  const subjects = {
    java: { name: 'Java Programming', icon: '☕', description: 'Object-oriented programming with Java' },
    python: { name: 'Python Programming', icon: '🐍', description: 'Python programming and data structures' },
    ann: { name: 'Artificial Neural Networks', icon: '🧠', description: 'Deep learning and neural networks' },
    statistics: { name: 'Statistics', icon: '📊', description: 'Statistical analysis and probability' },
    web_tech: { name: 'Web Technology', icon: '🌐', description: 'HTML, CSS, JavaScript and web development' },
    ai: { name: 'Artificial Intelligence', icon: '🤖', description: 'AI algorithms and machine learning' }
  };

  const subject = subjects[subjectId];
  const sectionTitle = section === 'theory' ? '📚 Theory' : '🧪 Lab';
  const sectionDescription = section === 'theory' 
    ? 'Theoretical concepts, notes, and study materials'
    : 'Practical exercises, lab manuals, and hands-on materials';

  useEffect(() => {
    // Check authentication
    if (!AuthService.isAuthenticated()) {
      navigate('/');
      return;
    }

    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    loadSubjectData();

    // Check if admin is logged in (persist admin state across pages)
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, section, navigate]);

  // Load subject data from backend (same pattern as Personal.js)
  const loadSubjectData = useCallback(async () => {
    try {
      const token = await AuthService.getApiToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      if (!token) {
        console.error('❌ No valid token available');
        return;
      }

      // Create a unique key for this subject-section combination
      const sectionKey = `${subjectId}_${section}`;

      const response = await axios.get(`${API_BASE_URL}/api/user/subject/${sectionKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setFiles(data.files || []);
        setNotes(data.notes || '');
        console.log('✅ Loaded subject-section data from backend:', data);
      }
    } catch (error) {
      console.error('❌ Failed to load subject-section data:', error);
      // Set defaults on error
      setFiles([]);
      setNotes('');
    }
  }, [subjectId, section]);

  // Save data to backend (same pattern as Personal.js)
  const saveSubjectData = useCallback(async (dataToUpdate) => {
    try {
      setIsSaving(true);
      const token = await AuthService.getApiToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      if (!token) {
        console.error('❌ No valid token available for saving');
        return false;
      }

      // Create a unique key for this subject-section combination
      const sectionKey = `${subjectId}_${section}`;

      console.log('🔄 Saving subject-section data:', dataToUpdate);
      const response = await axios.put(`${API_BASE_URL}/api/user/subject/${sectionKey}`, dataToUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Subject-section data saved successfully:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Failed to save subject-section data:', error);
      console.error('❌ Error details:', error.response?.data);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [subjectId, section]);

  // Debounced save for notes (same pattern as Personal.js)
  const saveTimeoutRef = useRef(null);
  const debouncedSaveNotes = useCallback((newNotes) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveSubjectData({ notes: newNotes });
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Admin authentication
  const handleAdminLogin = () => {
    if (adminCode === 'ansh_is_sexy') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminCode('');
      // Persist admin state across pages
      localStorage.setItem('isAdmin', 'true');
      alert('🎉 Admin access granted!');
    } else {
      alert('❌ Invalid admin code!');
      setAdminCode('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    // Remove admin state from localStorage
    localStorage.removeItem('isAdmin');
    alert('👋 Admin logged out');
  };

  // File upload function (updated to use backend API like Personal.js)
  const handleFileUpload = async (event) => {
    if (!isAdmin) return;

    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);
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
      alert(`✅ ${selectedFiles.length} file(s) uploaded successfully!`);
    } else {
      console.error('❌ Failed to save files to backend');
      setFiles(files); // Revert on failure
      alert('❌ Upload failed. Please try again.');
    }

    setUploadingFiles(false);
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete file function (updated to use backend API)
  const deleteFile = async (fileId) => {
    if (!isAdmin) return;

    if (window.confirm('Are you sure you want to delete this file?')) {
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      await saveSubjectData({ files: updatedFiles });
    }
  };

  // Update notes (updated to use backend API with debouncing like Personal.js)
  const updateNotes = (newNotes) => {
    if (!isAdmin) return;

    setNotes(newNotes);
    debouncedSaveNotes(newNotes);
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

  // Format file size (same as Personal.js)
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type (same as Personal.js)
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

  if (!user || !subject) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="subject-detail-container">
      {/* Header */}
      <header className="subject-detail-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate('/general')}>
            ← Back to Subjects
          </button>
          
          <div className="admin-section">
            {isSaving && <span className="saving-indicator">💾 Saving...</span>}
            {!isAdmin ? (
              <button
                className="admin-btn"
                onClick={() => setShowAdminLogin(true)}
              >
                🔐 Admin Access
              </button>
            ) : (
              <div className="admin-controls">
                <span className="admin-badge">👑 Admin Mode</span>
                <button className="admin-logout-btn" onClick={handleAdminLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="subject-info">
          <div className="subject-icon">{subject.icon}</div>
          <div className="subject-text">
            <h1>{subject.name}</h1>
            <p className="subject-description">{subject.description}</p>
            <div className="section-badge">
              <span className="section-title">{sectionTitle}</span>
              <span className="section-description">{sectionDescription}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="admin-login-modal">
            <h3>🔐 Admin Access</h3>
            <p>Enter the admin code to manage content:</p>
            <input
              type="password"
              placeholder="Enter admin code..."
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            <div className="modal-buttons">
              <button className="login-btn" onClick={handleAdminLogin}>
                Login
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminCode('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="subject-detail-main">
        {/* Files Section */}
        <div className="files-section">
          <h2>📁 Study Materials</h2>
          <div className="files-grid">
            {files.length === 0 ? (
              <div className="no-files">
                <span className="no-files-icon">📂</span>
                <p>No materials uploaded yet</p>
                {isAdmin && <small>Upload some files to get started!</small>}
              </div>
            ) : (
              files.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-icon">
                    {getFileIcon(file.type, file.name)}
                  </div>
                  <div className="file-info">
                    <h4 className="file-name">{file.name}</h4>
                    <p className="file-meta">
                      {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="download-btn"
                      onClick={() => downloadFile(file)}
                      title={`Download ${file.name}`}
                    >
                      ⬇️ Download
                    </button>
                    {isAdmin && (
                      <button 
                        className="delete-btn"
                        onClick={() => deleteFile(file.id)}
                        title="Delete file"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <h2>📝 Notes</h2>
          {isAdmin ? (
            <textarea
              className="notes-textarea"
              placeholder={`Write ${section} notes for ${subject.name}...`}
              value={notes}
              onChange={(e) => updateNotes(e.target.value)}
            />
          ) : (
            <div className="notes-display">
              {notes || `No ${section} notes available yet`}
            </div>
          )}
        </div>

        {/* Upload Section (Admin Only) - Moved to bottom */}
        {isAdmin && (
          <div className="upload-section">
            <h2>📤 Upload Materials</h2>
            <div className="upload-area">
              <input
                type="file"
                ref={fileInputRef}
                id="file-upload"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.mp3,*/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="upload-label">
                {uploadingFiles ? (
                  <div className="uploading">
                    <span>⏳ Uploading...</span>
                  </div>
                ) : (
                  <div className="upload-content">
                    <span className="upload-icon">📤</span>
                    <span>Click to upload or drag files here</span>
                    <small>PDF, DOC, PPT, TXT, ZIP supported</small>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubjectDetail;
