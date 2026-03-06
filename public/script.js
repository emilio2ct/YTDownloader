const downloadBtn = document.getElementById('downloadBtn');
const videoUrlInput = document.getElementById('videoUrl');
const statusMsg = document.getElementById('status');
const formatToggle = document.getElementById('formatToggle');
const qualityChips = document.getElementById('qualityChips');
const qualityLabel = document.getElementById('qualityLabel');
const spinner = document.getElementById('spinner');
const btnText = document.getElementById('btnText');

let selectedFormat = 'mp4';
let selectedQuality = '720';

const qualities = {
    mp4: [
        { label: '720p', value: '720' },
        { label: '1080p', value: '1080' }
    ],
    mp3: [
        { label: '128kbps', value: '128' },
        { label: '192kbps', value: '192' },
        { label: '256kbps', value: '256' }
    ]
};

function renderQualityChips() {
    qualityChips.innerHTML = '';
    const currentQualities = qualities[selectedFormat];

    currentQualities.forEach((q, index) => {
        const chip = document.createElement('div');
        chip.className = `chip ${selectedQuality === q.value ? 'active' : ''}`;
        chip.textContent = q.label;
        chip.onclick = () => {
            selectedQuality = q.value;
            renderQualityChips();
        };
        qualityChips.appendChild(chip);
    });

    qualityLabel.textContent = selectedFormat === 'mp4' ? 'Resolution' : 'Bitrate';
}

// Format toggle logic
formatToggle.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.onclick = () => {
        formatToggle.querySelector('.active').classList.remove('active');
        btn.classList.add('active');
        selectedFormat = btn.dataset.value;
        // Default quality when switching
        selectedQuality = selectedFormat === 'mp4' ? '720' : '192';
        renderQualityChips();
    };
});

// Initial render
renderQualityChips();

downloadBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value.trim();
    if (!url) {
        showStatus('Please paste a YouTube URL', 'error');
        return;
    }

    setLoading(true);
    showStatus('Processing your request...', '');

    try {
        const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format=${selectedFormat}&quality=${selectedQuality}`;

        const response = await fetch(downloadUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Download failed');
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = `download.${selectedFormat}`;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match) fileName = match[1];
        }

        const blob = await response.blob();
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        showStatus('Download started successfully!', 'success');
    } catch (error) {
        showStatus(error.message, 'error');
    } finally {
        setLoading(false);
    }
});

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
}

function setLoading(isLoading) {
    downloadBtn.disabled = isLoading;
    spinner.classList.toggle('hidden', !isLoading);
    btnText.textContent = isLoading ? 'Processing...' : 'Download Now';
}
