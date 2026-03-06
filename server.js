const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pLimit = require('p-limit');

// Dynamically resolve ffmpeg path using Windows system variables (hides your username)
const FFMPEG_PATH = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.WinGet.Source_8wekyb3d8bbwe', 'ffmpeg-8.0.1-full_build', 'bin', 'ffmpeg.exe');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Rate limiting (e.g., 30 requests per 15 minutes per IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', limiter);

// Security: Concurrent download limit (max 3 simultaneous downloads)
const concurrencyLimit = pLimit(3);

app.use(cors());
// Security & Cache Control - MUST be above static middleware to affect static files
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; img-src 'self' data:; connect-src 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Helper: get video title using yt-dlp with timeout
function getVideoTitle(url) {
    return new Promise((resolve, reject) => {
        // Enforce the URL as a positional argument using '--'
        const proc = spawn('python', ['-m', 'yt_dlp', '--get-title', '--no-playlist', '--', url], { windowsHide: true });
        let title = '';
        const timeout = setTimeout(() => {
            proc.kill();
            resolve('video');
        }, 10000); // 10s timeout

        proc.stdout.on('data', d => { title += d.toString(); });
        proc.on('close', code => {
            clearTimeout(timeout);
            if (code === 0 && title.trim()) {
                resolve(title.trim().replace(/[^\w\s-]/gi, '') || 'video');
            } else {
                resolve('video');
            }
        });
    });
}

// Helper: download video/audio to a temp file using yt-dlp
function downloadToTemp(url, outputPathPattern, format = 'mp4', quality = '720') {
    return new Promise((resolve, reject) => {
        const args = [
            '-m', 'yt_dlp',
            '--no-playlist',
            '--ffmpeg-location', FFMPEG_PATH,
            '--output', outputPathPattern,
            '--', url
        ];

        if (format === 'mp3') {
            args.splice(3, 0,
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', `${quality}K`
            );
        } else {
            const height = quality === '1080' ? '1080' : '720';
            args.splice(3, 0,
                '--format', `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`,
                '--merge-output-format', 'mp4'
            );
        }

        const ytDlp = spawn('python', args, { windowsHide: true });
        ytDlp.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`yt-dlp exited with code ${code}`));
        });
        ytDlp.on('error', reject);
    });
}

app.get('/api/download', async (req, res) => {
    const videoURL = req.query.url;
    const format = req.query.format || 'mp4';
    const quality = req.query.quality || (format === 'mp3' ? '192' : '720');

    if (!videoURL) {
        return res.status(400).send('Please provide a YouTube URL.');
    }

    // Security: Strict regex for YouTube URLs
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(watch\?v=|embed\/|v\/|shorts\/)?([0-9A-Za-z_-]{10,12})(\S+)?$/;
    if (!ytRegex.test(videoURL)) {
        return res.status(400).send('Invalid YouTube URL format.');
    }

    const tmpId = randomUUID();
    const tmpBase = `yt-${tmpId}`;
    const tmpPathTemplate = path.join(os.tmpdir(), `${tmpBase}.%(ext)s`);

    try {
        console.log(`\n[+] Download requested (Rate/Limit applied): ${videoURL}`);

        // Limit concurrency for both metadata and actual download
        await concurrencyLimit(async () => {
            // 1. Get title
            const title = await getVideoTitle(videoURL);

            // 2. Download
            await downloadToTemp(videoURL, tmpPathTemplate, format, quality);

            // 3. Resolve actual file
            const tmpDir = os.tmpdir();
            const matchedFile = fs.readdirSync(tmpDir).find(f => f.startsWith(tmpBase));

            if (!matchedFile) {
                throw new Error('Output file not found after processing.');
            }

            const tmpPath = path.join(tmpDir, matchedFile);
            const fileStat = fs.statSync(tmpPath);
            const ext = path.extname(matchedFile);

            // 4. Send as attachment
            res.header('Content-Disposition', `attachment; filename="${title}${ext}"`);
            res.header('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
            res.header('Content-Length', fileStat.size);

            const readStream = fs.createReadStream(tmpPath);
            readStream.pipe(res);

            // 5. Cleanup
            const cleanup = () => {
                if (fs.existsSync(tmpPath)) {
                    fs.unlinkSync(tmpPath);
                    console.log(`[+] Cleaned: ${tmpPath}`);
                }
            };
            readStream.on('end', cleanup);
            req.on('close', cleanup);
        });

    } catch (error) {
        console.error('[!] Process Error:', error.message);
        if (!res.headersSent) {
            res.status(500).send(`Server Error: ${error.message}`);
        }
    }
});

app.listen(PORT, () => {
    console.log(`\nSECURE YouTube Downloader running on http://localhost:${PORT}`);
    console.log('Features: Rate Limiting, Concurrency Protection, CSP enabled.\n');
});
