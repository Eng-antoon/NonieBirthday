// Firebase Firestore Gallery Data Management
const COLLECTION_NAME = 'nonie-gallery';
const SPECIAL_MESSAGE_DOC = 'special-message';

// Function to get gallery items from Firestore
async function getGalleryItems() {
    try {
        if (!window.db) {
            console.log('Firebase not initialized yet, waiting...');
            return [];
        }

        const snapshot = await window.db.collection(COLLECTION_NAME)
            .orderBy('uploadedAt', 'asc')
            .get();

        const items = [];
        snapshot.forEach(doc => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('✅ Loaded', items.length, 'items from Firestore');
        return items;

    } catch (error) {
        console.error('❌ Error getting gallery items:', error);
        return [];
    }
}

// Function to add a new item to Firestore
async function addGalleryItem(imageId, caption, type = 'image', cloudinaryUrl = '') {
    try {
        if (!window.db) {
            throw new Error('Firebase not initialized');
        }

        const newItem = {
            imageId: imageId,
            caption: caption,
            type: type,
            cloudinaryUrl: cloudinaryUrl,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
        };

        const docRef = await window.db.collection(COLLECTION_NAME).add(newItem);
        console.log('✅ Added item to Firestore:', docRef.id);
        return docRef.id;

    } catch (error) {
        console.error('❌ Error adding gallery item:', error);
        throw error;
    }
}

// Function to update gallery item caption
async function updateGalleryItemCaption(imageId, newCaption) {
    try {
        if (!window.db) {
            throw new Error('Firebase not initialized');
        }

        // Find the document with the matching imageId
        const snapshot = await window.db.collection(COLLECTION_NAME)
            .where('imageId', '==', imageId)
            .get();

        if (snapshot.empty) {
            console.log('No matching document found for imageId:', imageId);
            return false;
        }

        // Update the first matching document
        const doc = snapshot.docs[0];
        await doc.ref.update({
            caption: newCaption,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Updated caption for:', imageId);
        return true;

    } catch (error) {
        console.error('❌ Error updating caption:', error);
        return false;
    }
}

// Function to remove a gallery item
async function removeGalleryItem(imageId) {
    try {
        if (!window.db) {
            throw new Error('Firebase not initialized');
        }

        // Find the document with the matching imageId
        const snapshot = await window.db.collection(COLLECTION_NAME)
            .where('imageId', '==', imageId)
            .get();

        if (snapshot.empty) {
            console.log('No matching document found for imageId:', imageId);
            return false;
        }

        // Delete the first matching document
        const doc = snapshot.docs[0];
        await doc.ref.delete();

        console.log('✅ Deleted item:', imageId);
        return true;

    } catch (error) {
        console.error('❌ Error deleting item:', error);
        return false;
    }
}

// Function to listen for real-time updates
function listenToGalleryChanges(callback) {
    try {
        if (!window.db) {
            console.log('Firebase not initialized for real-time listening');
            return null;
        }

        return window.db.collection(COLLECTION_NAME)
            .orderBy('uploadedAt', 'asc')
            .onSnapshot(snapshot => {
                const items = [];
                snapshot.forEach(doc => {
                    items.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                console.log('🔄 Real-time update: received', items.length, 'items');
                callback(items);
            }, error => {
                console.error('❌ Real-time listener error:', error);
            });

    } catch (error) {
        console.error('❌ Error setting up real-time listener:', error);
        return null;
    }
}

// Special Message Functions

// Function to set/update special message
async function setSpecialMessage(imageId, caption, cloudinaryUrl) {
    try {
        if (!window.db) {
            throw new Error('Firebase not initialized');
        }

        const specialMessageData = {
            imageId: imageId,
            caption: caption,
            cloudinaryUrl: cloudinaryUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
        };

        await window.db.collection(COLLECTION_NAME).doc(SPECIAL_MESSAGE_DOC).set(specialMessageData);
        console.log('✅ Special message saved to Firestore');
        return true;

    } catch (error) {
        console.error('❌ Error saving special message:', error);
        throw error;
    }
}

// Function to get special message
async function getSpecialMessage() {
    try {
        if (!window.db) {
            console.log('Firebase not initialized yet, waiting...');
            return null;
        }

        const doc = await window.db.collection(COLLECTION_NAME).doc(SPECIAL_MESSAGE_DOC).get();

        if (doc.exists) {
            console.log('✅ Special message loaded from Firestore');
            return doc.data();
        } else {
            console.log('No special message found');
            return null;
        }

    } catch (error) {
        console.error('❌ Error getting special message:', error);
        return null;
    }
}

// Function to remove special message
async function removeSpecialMessage() {
    try {
        if (!window.db) {
            throw new Error('Firebase not initialized');
        }

        await window.db.collection(COLLECTION_NAME).doc(SPECIAL_MESSAGE_DOC).delete();
        console.log('✅ Special message deleted from Firestore');
        return true;

    } catch (error) {
        console.error('❌ Error deleting special message:', error);
        throw error;
    }
}

// Function to listen for special message changes
function listenToSpecialMessageChanges(callback) {
    try {
        if (!window.db) {
            console.log('Firebase not initialized for special message listening');
            return null;
        }

        return window.db.collection(COLLECTION_NAME).doc(SPECIAL_MESSAGE_DOC)
            .onSnapshot(doc => {
                if (doc.exists) {
                    console.log('🔄 Special message updated');
                    callback(doc.data());
                } else {
                    console.log('🔄 Special message removed');
                    callback(null);
                }
            }, error => {
                console.error('❌ Special message listener error:', error);
            });

    } catch (error) {
        console.error('❌ Error setting up special message listener:', error);
        return null;
    }
}

// Wait for Firebase to be ready, then make functions available globally
function initializeGalleryData() {
    const maxWaitTime = 10000; // 10 seconds
    const startTime = Date.now();

    function checkFirebase() {
        if (window.db) {
            console.log('🔥 Firebase ready, initializing gallery data functions');

            // Make functions available globally
            window.galleryData = {
                getItems: getGalleryItems,
                addItem: addGalleryItem,
                updateCaption: updateGalleryItemCaption,
                removeItem: removeGalleryItem,
                listen: listenToGalleryChanges,
                // Special message functions
                setSpecialMessage: setSpecialMessage,
                getSpecialMessage: getSpecialMessage,
                removeSpecialMessage: removeSpecialMessage,
                listenToSpecialMessage: listenToSpecialMessageChanges
            };

            return true;
        } else if (Date.now() - startTime < maxWaitTime) {
            setTimeout(checkFirebase, 100);
        } else {
            console.error('❌ Firebase failed to initialize within', maxWaitTime / 1000, 'seconds');
        }
    }

    checkFirebase();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGalleryData);
} else {
    initializeGalleryData();
}