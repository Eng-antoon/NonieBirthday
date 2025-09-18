class SimpleUploadManager {
    constructor() {
        this.cloudName = 'dsgrl4zf8';
        this.uploadPreset = 'nonie-birthday';
        this.selectedFiles = [];
        this.currentFileIndex = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCurrentGallery();
    }

    setupEventListeners() {
        const selectFilesBtn = document.getElementById('select-files-btn');
        const fileInput = document.getElementById('file-input');
        const refreshBtn = document.getElementById('refresh-btn');
        const previewBtn = document.getElementById('preview-btn');

        // File selection
        selectFilesBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.handleFileSelection(files);
            }
        });

        // Button events
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadCurrentGallery());
        if (previewBtn) previewBtn.addEventListener('click', () => window.open('index.html', '_blank'));
    }

    handleFileSelection(files) {
        console.log('Files selected:', files.length);
        this.selectedFiles = files;
        this.currentFileIndex = 0;

        // Show status
        this.showStatus('Files selected! Starting upload...', 'info');

        // Start processing files one by one
        this.processNextFile();
    }

    async processNextFile() {
        if (this.currentFileIndex >= this.selectedFiles.length) {
            this.showStatus('All files uploaded successfully! 🎉', 'success');
            setTimeout(() => {
                this.hideStatus();
                this.loadCurrentGallery();
            }, 3000);
            return;
        }

        const file = this.selectedFiles[this.currentFileIndex];
        const fileNum = this.currentFileIndex + 1;
        const totalFiles = this.selectedFiles.length;

        console.log(`Processing file ${fileNum}/${totalFiles}:`, file.name);

        try {
            // Update status
            this.showStatus(`Uploading ${file.name} (${fileNum}/${totalFiles})...`, 'uploading');

            // Upload to Cloudinary
            const result = await this.uploadToCloudinary(file);
            console.log('Upload successful:', result);

            // Get caption from user
            const caption = await this.getCaptionFromUser(file.name, result.secure_url, file.type.startsWith('video'));

            // Save to Firebase
            await this.saveToFirebase(result, caption);

            // Move to next file
            this.currentFileIndex++;
            setTimeout(() => this.processNextFile(), 1000);

        } catch (error) {
            console.error('Error processing file:', error);
            this.showStatus(`Error uploading ${file.name}: ${error.message}`, 'error');

            // Ask user if they want to continue with remaining files
            const continueUpload = confirm(`Error uploading "${file.name}": ${error.message}\n\nDo you want to continue with the remaining files?`);

            if (continueUpload) {
                this.currentFileIndex++;
                setTimeout(() => this.processNextFile(), 1000);
            } else {
                this.showStatus('Upload cancelled', 'error');
                setTimeout(() => this.hideStatus(), 3000);
            }
        }
    }

    async uploadToCloudinary(file) {
        return new Promise((resolve, reject) => {
            // Check file size
            if (file.size > 10 * 1024 * 1024) { // 10MB
                reject(new Error('File is too large. Maximum size is 10MB.'));
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`);

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    resolve(result);
                } else {
                    let errorMessage = 'Upload failed';
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        errorMessage = errorData.error?.message || `HTTP ${xhr.status}`;
                    } catch (e) {
                        errorMessage = `HTTP ${xhr.status}`;
                    }
                    reject(new Error(errorMessage));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during upload'));
            };

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
                    this.updateProgress(percent);
                }
            };

            xhr.send(formData);
        });
    }

    async getCaptionFromUser(fileName, fileUrl, isVideo) {
        return new Promise((resolve) => {
            // Create modal for caption input
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            `;

            const mediaElement = isVideo ?
                `<video style="width: 100%; max-height: 200px; border-radius: 10px; margin-bottom: 20px;" controls><source src="${fileUrl}" type="video/mp4"></video>` :
                `<img style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;" src="${fileUrl}" alt="Preview">`;

            modalContent.innerHTML = `
                <h3 style="color: #333; margin-bottom: 15px;">Add Caption for ${fileName}</h3>
                ${mediaElement}
                <input
                    type="text"
                    id="caption-input"
                    placeholder="Enter a beautiful caption for Nonie..."
                    value="Beautiful moment with Nonie 💕"
                    style="width: 100%; padding: 12px; border: 2px solid #F7D9D9; border-radius: 8px; font-size: 1rem; margin-bottom: 20px;"
                >
                <div>
                    <button id="save-caption" style="background: #B76E79; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; margin: 0 10px; font-size: 1rem;">
                        💕 Save Caption
                    </button>
                    <button id="skip-caption" style="background: #ccc; color: #333; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; margin: 0 10px; font-size: 1rem;">
                        Skip
                    </button>
                </div>
            `;

            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            const captionInput = document.getElementById('caption-input');
            const saveBtn = document.getElementById('save-caption');
            const skipBtn = document.getElementById('skip-caption');

            // Focus on input
            captionInput.focus();
            captionInput.select();

            const cleanup = () => {
                document.body.removeChild(modal);
            };

            saveBtn.addEventListener('click', () => {
                const caption = captionInput.value.trim() || 'Beautiful moment with Nonie 💕';
                cleanup();
                resolve(caption);
            });

            skipBtn.addEventListener('click', () => {
                cleanup();
                resolve('Beautiful moment with Nonie 💕');
            });

            // Allow Enter key to save
            captionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveBtn.click();
                }
            });
        });
    }

    async saveToFirebase(cloudinaryResult, caption) {
        try {
            if (!window.galleryData) {
                throw new Error('Firebase not ready');
            }

            // Determine resource type more intelligently
            let resourceType = cloudinaryResult.resource_type || 'image';

            // If Cloudinary didn't set resource_type properly, check file extension
            if (!resourceType || resourceType === 'auto') {
                resourceType = this.determineResourceType(cloudinaryResult.public_id, cloudinaryResult.format);
            }

            await window.galleryData.addItem(
                cloudinaryResult.public_id,
                caption,
                resourceType,
                cloudinaryResult.secure_url
            );

            console.log('✅ Saved to Firebase:', cloudinaryResult.public_id, 'as', resourceType);

        } catch (error) {
            console.error('Error saving to Firebase:', error);
            throw error;
        }
    }

    determineResourceType(publicId, format) {
        const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'm4v'];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

        // Check format first
        if (format && videoExtensions.includes(format.toLowerCase())) {
            return 'video';
        }
        if (format && imageExtensions.includes(format.toLowerCase())) {
            return 'image';
        }

        // Check file extension from public_id
        const extension = publicId.split('.').pop()?.toLowerCase();
        if (extension && videoExtensions.includes(extension)) {
            return 'video';
        }

        // Default to image
        return 'image';
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('upload-status');
        const statusText = document.getElementById('status-text');

        statusText.textContent = message;
        statusDiv.style.display = 'block';

        // Update colors based on type
        if (type === 'success') {
            statusDiv.style.background = '#d4edda';
            statusDiv.style.color = '#155724';
        } else if (type === 'error') {
            statusDiv.style.background = '#f8d7da';
            statusDiv.style.color = '#721c24';
        } else if (type === 'uploading') {
            statusDiv.style.background = '#fff3cd';
            statusDiv.style.color = '#856404';
        } else {
            statusDiv.style.background = '#d1ecf1';
            statusDiv.style.color = '#0c5460';
        }
    }

    hideStatus() {
        document.getElementById('upload-status').style.display = 'none';
        this.updateProgress(0);
    }

    updateProgress(percent) {
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = percent + '%';
    }

    async loadCurrentGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '<div class="loading">Loading gallery...</div>';

        try {
            if (!window.galleryData) {
                throw new Error('Gallery data not available');
            }

            const items = await window.galleryData.getItems();
            this.renderGallery(items);

        } catch (error) {
            console.error('Error loading gallery:', error);
            galleryGrid.innerHTML = `
                <div class="loading">
                    <p>📁 No content found</p>
                    <p>Upload your first photo or video to get started!</p>
                </div>
            `;
        }
    }

    renderGallery(items) {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        if (items.length === 0) {
            galleryGrid.innerHTML = `
                <div class="loading">
                    <p>Gallery is empty! 📸</p>
                    <p>Upload some memories for Nonie!</p>
                </div>
            `;
            return;
        }

        galleryGrid.innerHTML = items.map(item => {
            const isVideo = item.type === 'video';
            const mediaUrl = item.cloudinaryUrl || '#';
            const caption = item.caption || 'Beautiful moment with Nonie 💕';
            const uploadDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown';

            const mediaElement = isVideo ?
                `<video controls><source src="${mediaUrl}" type="video/mp4"></video>` :
                `<img src="${mediaUrl}" alt="${caption}" loading="lazy">`;

            return `
                <div class="gallery-item">
                    ${mediaElement}
                    <div class="gallery-item-content">
                        <div class="gallery-item-caption">${caption}</div>
                        <div class="gallery-item-date" style="font-size: 0.8rem; color: #999; margin: 5px 0;">${uploadDate}</div>
                        <button class="delete-btn" onclick="simpleUploadManager.deleteItem('${item.imageId}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteItem(imageId) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            if (window.galleryData) {
                await window.galleryData.removeItem(imageId);
                this.showStatus('✅ Item deleted successfully!', 'success');
                setTimeout(() => {
                    this.hideStatus();
                    this.loadCurrentGallery();
                }, 2000);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showStatus('❌ Error deleting item: ' + error.message, 'error');
        }
    }
}

// Initialize when page loads
let simpleUploadManager;
document.addEventListener('DOMContentLoaded', () => {
    simpleUploadManager = new SimpleUploadManager();
});

// Make available globally
window.simpleUploadManager = simpleUploadManager;