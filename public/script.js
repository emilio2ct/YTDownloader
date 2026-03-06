document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('download-form');
    const urlInput = document.getElementById('video-url');
    const downloadBtn = document.getElementById('download-btn');
    const statusMessage = document.getElementById('status-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const url = urlInput.value.trim();

        if (!url) {
            showStatus('Please enter a YouTube URL.', 'error');
            return;
        }

        // Basic YouTube URL regex validation clientside
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!ytRegex.test(url)) {
            showStatus('Please enter a valid YouTube URL.', 'error');
            return;
        }

        startDownload(url);
    });

    function startDownload(url) {
        // UI Loading State
        downloadBtn.classList.add('is-loading');
        downloadBtn.disabled = true;
        urlInput.disabled = true;
        hideStatus();

        // The browser handles streaming file downloads via window.location directly
        // point to the backend's download endpoint.
        const encodedUrl = encodeURIComponent(url);
        const downloadUrl = `/api/download?url=${encodedUrl}`;

        // Timeout to simulate processing and revert UI (actual download happens in the background via browser)
        setTimeout(() => {
            // Trigger native download
            window.location.href = downloadUrl;

            // Revert UI State after a delay to show success
            setTimeout(() => {
                downloadBtn.classList.remove('is-loading');
                downloadBtn.disabled = false;
                urlInput.disabled = false;
                urlInput.value = ''; // Clear input
                showStatus('Download initiated! Check your browser downloads.', 'success');
            }, 1000);

        }, 800);
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message status-${type}`; // removes hidden
    }

    function hideStatus() {
        statusMessage.classList.add('hidden');
        statusMessage.className = 'status-message hidden';
    }
});
