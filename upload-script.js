class UploadManager {
    constructor() {
        this.cloudName = 'dsgrl4zf8';
        this.uploadPreset = 'nonie-birthday'; // You'll need to create this in Cloudinary
        this.folderName = 'nonie-birthday';
        this.uploadedFiles = [];
        this.currentGallery = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCurrentGallery();
        this.initCloudinaryWidget();
    }

    initCloudinaryWidget() {
        // Check if Cloudinary is loaded
        if (typeof cloudinary === 'undefined') {
            this.showStatus('❌ Cloudinary upload widget not loaded. Please refresh the page.', 'error');
            return;
        }

        try {
            // Initialize Cloudinary Upload Widget with minimal configuration to avoid errors
            this.widget = cloudinary.createUploadWidget({
                cloudName: this.cloudName,
                uploadPreset: this.uploadPreset,
                sources: ['local'],
                multiple: true,
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'],
                maxFileSize: 10000000, // 10MB
                cropping: false,
                showAdvancedOptions: false,
                showSkipCropButton: true,
                showUploadMoreButton: false,
                theme: 'minimal',
                styles: {
                    palette: {
                        window: "#FFFBF5",
                        sourceBg: "#F7D9D9",
                        windowBorder: "#B76E79",
                        tabIcon: "#B76E79",
                        inactiveTabIcon: "#999",
                        menuIcons: "#B76E79",
                        link: "#B76E79",
                        action: "#B76E79",
                        inProgress: "#B76E79",
                        complete: "#4CAF50",
                        error: "#f44336"
                    }
                }
            }, (error, result) => {
                console.log('Upload event:', result?.event, result?.info);

                if (error) {
                    console.error('Upload error:', error);
                    this.showStatus('❌ Upload error: ' + error.message, 'error');
                    return;
                }

                if (result && result.event === "success") {
                    console.log('✅ Upload successful:', result.info);
                    this.handleUploadSuccess(result.info);
                } else if (result && result.event === "close") {
                    console.log('📤 Upload widget closed');
                } else if (result && result.event === "display-changed") {
                    console.log('🎨 Widget display changed');
                }
            });

            console.log('✅ Cloudinary widget initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing Cloudinary widget:', error);
            this.showStatus('❌ Error setting up upload. Please check console for details.', 'error');
        }
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const refreshBtn = document.getElementById('refresh-btn');
        const previewBtn = document.getElementById('preview-btn');
        const saveCaptionsBtn = document.getElementById('save-captions-btn');

        // Upload area click
        uploadArea.addEventListener('click', () => {
            console.log('Upload area clicked, opening widget...');
            if (this.widget) {
                try {
                    this.widget.open();
                    this.showStatus('📤 Opening upload dialog...', 'warning');
                } catch (error) {
                    console.error('Error opening widget:', error);
                    this.showStatus('❌ Error opening upload dialog: ' + error.message, 'error');
                }
            } else {
                this.showStatus('❌ Upload widget not initialized. Please refresh the page.', 'error');
            }
        });

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            console.log('Files dropped, opening widget...');
            if (this.widget) {
                this.widget.open();
            }
        });

        // Button events
        refreshBtn.addEventListener('click', () => this.loadCurrentGallery());
        previewBtn.addEventListener('click', () => window.open('index.html', '_blank'));
        saveCaptionsBtn.addEventListener('click', () => this.saveCaptions());

        // Backup upload method
        const backupUploadBtn = document.getElementById('backup-upload-btn');
        if (backupUploadBtn) {
            backupUploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // Handle file input change
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                this.handleManualUpload(files);
            }
        });
    }

    async handleManualUpload(files) {
        console.log('Manual upload started for', files.length, 'files');
        this.showStatus('📤 Preparing to upload ' + files.length + ' file(s)...', 'warning');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log('Uploading file:', file.name);

            try {
                const result = await this.uploadFileToCloudinary(file);
                await this.handleUploadSuccess(result);
            } catch (error) {
                console.error('Upload failed for', file.name, ':', error);
                this.showStatus('❌ Upload failed for ' + file.name + ': ' + error.message, 'error');
            }
        }
    }

    async uploadFileToCloudinary(file) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('folder', this.folderName);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`);

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    console.log('✅ Manual upload successful:', result);
                    resolve(result);
                } else {
                    reject(new Error('Upload failed with status: ' + xhr.status));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during upload'));
            };

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    console.log('Upload progress:', percentComplete.toFixed(2) + '%');
                }
            };

            xhr.send(formData);
        });
    }

    async handleUploadSuccess(fileInfo) {
        console.log('Upload success:', fileInfo);

        this.uploadedFiles.push(fileInfo);
        this.showStatus(`✅ Uploaded: ${fileInfo.original_filename}`, 'success');

        // Save to Firestore immediately with Cloudinary URL
        try {
            const caption = `Beautiful moment with Nonie 💕`;
            const resourceType = fileInfo.resource_type || 'image';
            const cloudinaryUrl = fileInfo.secure_url || fileInfo.url;

            if (window.galleryData) {
                await window.galleryData.addItem(fileInfo.public_id, caption, resourceType, cloudinaryUrl);
                this.showStatus(`💾 Saved to gallery: ${fileInfo.original_filename}`, 'success');
            }

            // Add to caption form for editing
            this.addToCaptionForm(fileInfo);

            // Show caption section
            document.getElementById('caption-section').style.display = 'block';

            // Refresh gallery
            setTimeout(() => this.loadCurrentGallery(), 2000);

        } catch (error) {
            console.error('Error saving to Firestore:', error);
            this.showStatus(`⚠️ Upload succeeded but failed to save to database: ${error.message}`, 'warning');
        }
    }

    addToCaptionForm(fileInfo) {
        const captionForms = document.getElementById('caption-forms');

        const formDiv = document.createElement('div');
        formDiv.className = 'caption-form';
        formDiv.dataset.publicId = fileInfo.public_id;

        const isVideo = fileInfo.resource_type === 'video';
        const fileUrl = fileInfo.secure_url || fileInfo.url;
        const fileName = fileInfo.original_filename || fileInfo.public_id;

        const mediaElement = isVideo ?
            `<video class="caption-preview" controls><source src="${fileUrl}" type="video/mp4"></video>` :
            `<img class="caption-preview" src="${fileUrl}" alt="Preview">`;

        formDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                ${mediaElement}
                <div style="flex: 1; min-width: 200px;">
                    <label for="caption-${fileInfo.public_id}" style="display: block; margin-bottom: 5px; font-weight: 500;">
                        Caption for ${fileName}:
                    </label>
                    <input
                        type="text"
                        id="caption-${fileInfo.public_id}"
                        class="caption-input"
                        placeholder="Enter a beautiful caption for Nonie..."
                        value="Beautiful moment with Nonie 💕"
                    >
                    <button
                        type="button"
                        style="margin-top: 10px; padding: 8px 16px; background: var(--success); color: white; border: none; border-radius: 5px; cursor: pointer;"
                        onclick="uploadManager.saveIndividualCaption('${fileInfo.public_id}')"
                    >
                        💾 Save This Caption
                    </button>
                </div>
            </div>
        `;

        captionForms.appendChild(formDiv);
    }

    async saveIndividualCaption(publicId) {
        try {
            const captionInput = document.getElementById(`caption-${publicId}`);
            if (!captionInput) {
                this.showStatus('❌ Caption input not found', 'error');
                return;
            }

            const caption = captionInput.value.trim();
            if (!caption) {
                this.showStatus('⚠️ Please enter a caption first', 'warning');
                return;
            }

            if (window.galleryData) {
                await window.galleryData.updateCaption(publicId, caption);
                this.showStatus('✅ Caption saved successfully!', 'success');

                // Remove this form since it's saved
                const form = document.querySelector(`[data-public-id="${publicId}"]`);
                if (form) {
                    form.remove();
                }

                // Hide caption section if no more forms
                const remainingForms = document.querySelectorAll('.caption-form');
                if (remainingForms.length === 0) {
                    document.getElementById('caption-section').style.display = 'none';
                }

                // Refresh gallery
                setTimeout(() => this.loadCurrentGallery(), 1000);
            }

        } catch (error) {
            console.error('Error saving caption:', error);
            this.showStatus('❌ Error saving caption: ' + error.message, 'error');
        }
    }

    async saveCaptions() {
        const captionForms = document.querySelectorAll('.caption-form');

        this.showStatus('💾 Saving captions...', 'warning');

        try {
            for (const form of captionForms) {
                const publicId = form.dataset.publicId;
                const captionInput = form.querySelector('.caption-input');
                const caption = captionInput.value.trim();

                if (caption && window.galleryData) {
                    // Update caption in the data management system
                    window.galleryData.updateCaption(publicId, caption);
                }
            }

            this.showStatus('✅ Captions saved! They will appear on the website.', 'success');

            // Hide caption section and refresh gallery
            document.getElementById('caption-section').style.display = 'none';
            document.getElementById('caption-forms').innerHTML = '';
            this.uploadedFiles = [];

            setTimeout(() => this.loadCurrentGallery(), 1000);

        } catch (error) {
            this.showStatus('❌ Error saving captions: ' + error.message, 'error');
        }
    }

    async loadCurrentGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        galleryGrid.innerHTML = '<div class="loading">Loading gallery...</div>';

        try {
            // Load gallery items from localStorage (managed by data.js)
            const galleryItems = window.galleryData ? window.galleryData.getItems() : [];

            if (galleryItems && galleryItems.length > 0) {
                this.currentGallery = galleryItems;
                this.renderGallery(galleryItems);
            } else {
                galleryGrid.innerHTML = `
                    <div class="loading">
                        <p>No images uploaded yet! 📸</p>
                        <p>Upload some beautiful memories for Nonie's birthday!</p>
                    </div>
                `;
            }

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

    renderGallery(galleryItems) {
        const galleryGrid = document.getElementById('gallery-grid');

        if (galleryItems.length === 0) {
            galleryGrid.innerHTML = `
                <div class="loading">
                    <p>Gallery is empty! 📸</p>
                    <p>Upload some memories for Nonie!</p>
                </div>
            `;
            return;
        }

        galleryGrid.innerHTML = galleryItems.map(item => {
            const isVideo = item.type === 'video';
            const caption = item.caption || 'Beautiful moment with Nonie 💕';

            // Use the Cloudinary URL from Firestore if available, otherwise construct it
            let mediaUrl;
            if (item.cloudinaryUrl) {
                mediaUrl = item.cloudinaryUrl;
            } else {
                // Fallback: construct Cloudinary URL
                const resourceType = isVideo ? 'video' : 'image';
                mediaUrl = `https://res.cloudinary.com/${this.cloudName}/${resourceType}/upload/${item.imageId}`;
            }

            const mediaElement = isVideo ?
                `<video controls><source src="${mediaUrl}" type="video/mp4"></video>` :
                `<img src="${mediaUrl}" alt="${caption}" loading="lazy">`;

            const uploadDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown';

            return `
                <div class="gallery-item">
                    ${mediaElement}
                    <div class="gallery-item-content">
                        <div class="gallery-item-caption">${caption}</div>
                        <div class="gallery-item-id">ID: ${item.imageId}</div>
                        <div class="gallery-item-date" style="font-size: 0.8rem; color: #999; margin: 5px 0;">Uploaded: ${uploadDate}</div>
                        <button class="delete-btn" onclick="uploadManager.deleteResource('${item.imageId}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteResource(imageId) {
        if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) {
            return;
        }

        try {
            this.showStatus('🗑️ Deleting...', 'warning');

            // Remove from data management system
            if (window.galleryData) {
                window.galleryData.removeItem(imageId);
            }

            this.showStatus('✅ Item removed from gallery!', 'success');

            // Refresh gallery
            setTimeout(() => this.loadCurrentGallery(), 500);

        } catch (error) {
            this.showStatus('❌ Error deleting: ' + error.message, 'error');
        }
    }

    showStatus(message, type = 'success') {
        const statusDiv = document.getElementById('status-message');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type} show`;

        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 4000);
    }
}

// Initialize upload manager when page loads
let uploadManager;
document.addEventListener('DOMContentLoaded', () => {
    uploadManager = new UploadManager();
});

// Make uploadManager available globally for button clicks
window.uploadManager = uploadManager;