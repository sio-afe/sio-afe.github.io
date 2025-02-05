// Check if service workers are supported
if ('serviceWorker' in navigator) {
    let refreshing = false;

    // Register the service worker
    navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful');

        // Check for updates every 2 minutes
        setInterval(() => {
            registration.update();
        }, 2 * 60 * 1000);

        // Listen for the controllerchange event
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker.addEventListener('statechange', () => {
                // When the service worker is installed
                if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // New content is available, create a notification
                        createUpdateNotification(() => {
                            newWorker.postMessage('skipWaiting');
                        });
                    }
                }
            });
        });
    }).catch(error => {
        console.log('ServiceWorker registration failed:', error);
    });
}

// Create update notification
function createUpdateNotification(onUpdate) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <span>إتقان has been updated!</span>
            <button>Update Now</button>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .update-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 95, 115, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            backdrop-filter: blur(10px);
            animation: slideUp 0.3s ease-out;
            font-family: 'Mehr Nastaleeq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', sans-serif;
        }
        .update-content {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .update-notification span {
            font-size: 1.2rem;
            line-height: 2;
        }
        .update-notification button {
            background: #ffd700;
            color: #005f73;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
            font-family: 'Poppins', sans-serif;
        }
        .update-notification button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        @keyframes slideUp {
            from {
                transform: translate(-50%, 100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
    `;

    // Add to document
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Add click handler
    notification.querySelector('button').addEventListener('click', () => {
        onUpdate();
        notification.remove();
    });
} 