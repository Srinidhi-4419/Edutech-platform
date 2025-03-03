require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { YoutubeTranscript } = require('youtube-transcript');
const { Groq } = require('groq-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
const urlParser = require('url');
const path = require('path');
const morgan = require('morgan');
const router = express.Router();
// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging
app.use(express.static('public')); // Serve static files

// Initialize Groq client
const client = new Groq(process.env.key);

const summarizePrompt = "Summarize the following content in bullet points: ";
const videoPrompt = "This is a video file that couldn't be transcribed. Please provide a general summary of what might be in this video based on its URL and any context: ";
const combineSummaryPrompt = "Combine these summaries of different parts of content into a single coherent summary with the most important points: ";

// Determine URL type and extract content
async function extractContent(url) {
    try {
        const parsedUrl = urlParser.parse(url);
        const hostname = parsedUrl.hostname;
        const pathname = parsedUrl.pathname || '';
        const extension = path.extname(pathname).toLowerCase();
        
        // Detect URL type
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            return await extractYoutubeTranscript(url);
        } else if (
            extension.match(/\.(mp4|webm|mov|avi|wmv|m4v|flv|mkv)$/i) || 
            (hostname.includes('cloudinary.com') && pathname.includes('/video/'))
        ) {
            return await handleVideoUrl(url);
        } else {
            try {
                return await extractWebsiteContent(url);
            } catch (webError) {
                // If website extraction fails, try handling as video/media
                if (webError.message.includes('maxContentLength') || 
                    webError.message.includes('content-type') ||
                    webError.message.includes('timeout')) {
                    console.log("Website extraction failed, trying fallback video handling:", webError.message);
                    return await handleVideoUrl(url);
                }
                throw webError;
            }
        }
    } catch (error) {
        throw new Error(`Content extraction failed: ${error.message}`);
    }
}

// Handle video URLs (returns metadata about the video when transcription isn't available)
async function handleVideoUrl(url) {
    try {
        // Extract filename from URL
        const parsedUrl = urlParser.parse(url);
        const filename = path.basename(parsedUrl.pathname);
        
        // Extract any identifiable information from the URL
        const urlParts = url.split('/');
        const videoId = urlParts[urlParts.length - 1].split('.')[0];
        
        // If this was a real implementation, you would send the video to a transcription service here
        // For now, we'll create a placeholder content with information about the video
        
        let content = `Video URL: ${url}\n`;
        content += `Video ID/Filename: ${filename || videoId}\n`;
        content += `Source: ${parsedUrl.hostname}\n`;
        
        // Try to get some metadata via a HEAD request (this won't download the whole file)
        try {
            const headResponse = await axios.head(url, { timeout: 5000 });
            if (headResponse.headers['content-type']) {
                content += `Content-Type: ${headResponse.headers['content-type']}\n`;
            }
            if (headResponse.headers['content-length']) {
                const sizeInMB = Math.round(headResponse.headers['content-length'] / 1048576 * 100) / 100;
                content += `File Size: ${sizeInMB} MB\n`;
            }
        } catch (headError) {
            console.log("Could not fetch video metadata:", headError.message);
        }
        
        return { 
            content: content, 
            type: 'video', 
            title: `Video File: ${filename || videoId}`,
            isVideoFile: true,
            url: url
        };
    } catch (error) {
        throw new Error(`Video handling failed: ${error.message}`);
    }
}

// Extract YouTube video transcript
async function extractYoutubeTranscript(youtubeVideoUrl) {
    try {
        let videoId;
        if (youtubeVideoUrl.includes('youtu.be')) {
            videoId = youtubeVideoUrl.split('/').pop().split('?')[0];
        } else if (youtubeVideoUrl.includes('v=')) {
            videoId = youtubeVideoUrl.split('v=')[1].split('&')[0];
        } else {
            throw new Error('Invalid YouTube URL format');
        }

        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
        let transcript = transcriptItems.map(item => item.text).join(' ');

        // Limit transcript length to prevent memory issues
        if (transcript.length > 100000) {
            transcript = transcript.substring(0, 100000) + "...";
            console.log("Transcript truncated to 100,000 characters");
        }

        return { content: transcript, type: 'youtube', videoId: videoId };
    } catch (error) {
        throw new Error(`YouTube transcript extraction failed: ${error.message}`);
    }
}

// Extract website content
async function extractWebsiteContent(url) {
    try {
        // Add header to appear as a browser request
        const response = await axios.get(url, { 
            timeout: 20000,  // 20 second timeout
            maxContentLength: 25000000,  // 25MB
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        // Check content type to prevent processing binary files
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('video/') || contentType.includes('audio/') || 
            contentType.includes('application/octet-stream')) {
            throw new Error(`Binary content type detected: ${contentType}`);
        }
        
        // If it's an image, we'll handle it differently
        if (contentType.includes('image/')) {
            return { 
                content: `Image URL: ${url}\nContent-Type: ${contentType}`, 
                type: 'image', 
                title: 'Image Content',
                url: url
            };
        }
        
        // For text content, proceed with HTML parsing
        const html = response.data;
        if (typeof html !== 'string') {
            throw new Error('Response is not text/HTML content');
        }
        
        const $ = cheerio.load(html, { 
            normalizeWhitespace: true, 
            decodeEntities: true 
        });

        // Remove elements that typically don't contain main content
        $('script, style, nav, footer, header, iframe, [role="banner"], [role="navigation"], .sidebar, .comments, .nav, .menu, .advertisement').remove();

        const title = $('title').text().trim();
        let mainContent = '';

        const contentSelectors = [
            'article', 'main', '.content', '#content', '.post', '.article', 
            '[role="main"]', '.main-content', '.post-content', '.entry-content'
        ];

        // Try to get content from common content containers
        for (const selector of contentSelectors) {
            if ($(selector).length) {
                mainContent += $(selector).text().trim() + ' ';
            }
        }

        // If no content found, get paragraphs instead
        if (!mainContent.trim()) {
            $('p').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 20) { // Only add substantial paragraphs
                    mainContent += text + ' ';
                }
            });
        }

        // If still no content, use body as last resort
        if (!mainContent.trim()) {
            mainContent = $('body').text().trim();
        }

        // Clean up whitespace
        mainContent = mainContent.replace(/\s+/g, ' ').trim();

        // Limit content length to prevent memory issues
        if (mainContent.length > 100000) {
            mainContent = mainContent.substring(0, 100000) + "...";
            console.log("Website content truncated to 100,000 characters");
        }

        return { content: mainContent, type: 'website', title: title, url: url };
    } catch (error) {
        throw new Error(`Website content extraction failed: ${error.message}`);
    }
}

// Split text into manageable chunks
function chunkText(text, maxCharacters = 3000) {
    // Ensure text is a string
    if (typeof text !== 'string') {
        console.error("Invalid text type received:", typeof text);
        text = String(text || "");
    }
    
    // If text is short enough, return as a single chunk
    if (text.length <= maxCharacters) {
        return [text];
    }
    
    const chunks = [];
    let startIndex = 0;
    
    while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + maxCharacters, text.length);
        
        // Try to find a natural break point
        if (endIndex < text.length) {
            const naturalBreaks = ['. ', '? ', '! ', '.\n', '?\n', '!\n'];
            let bestBreakPoint = -1;
            
            // Look for natural breaks within the last 20% of the chunk
            const searchStart = Math.max(startIndex, endIndex - (maxCharacters * 0.2));
            for (let i = endIndex; i >= searchStart; i--) {
                const twoChars = text.substring(i - 2, i);
                if (naturalBreaks.some(breakChar => twoChars.endsWith(breakChar))) {
                    bestBreakPoint = i;
                    break;
                }
            }
            
            // If found a break point, use it
            if (bestBreakPoint > startIndex) {
                endIndex = bestBreakPoint;
            }
        }
        
        chunks.push(text.substring(startIndex, endIndex));
        startIndex = endIndex;
    }
    
    return chunks;
}

// Generate summary using Groq API
async function generateGroqContent(text, prompt, model = "llama3-70b-8192", maxTokens = 1024) {
    try {
        // Ensure text isn't too large
        if (text.length > 10000) {
            console.log(`Truncating text from ${text.length} to 10,000 characters for API call`);
            text = text.substring(0, 10000) + "...";
        }
        
        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: "You are a helpful assistant specialized in summarizing content." },
                { role: "user", content: prompt + text }
            ],
            temperature: 0.5,
            max_tokens: maxTokens
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("API Error:", error);
        return `Error generating content: ${error.message}`;
    }
}

// Process content in chunks and generate final summary
async function processContentInChunks(content, initialPrompt, combinePrompt, isVideoFile = false) {
    try {
        // Defensive check
        if (!content || typeof content !== 'string' || content.length === 0) {
            return "No content to summarize.";
        }
        
        // For video files that couldn't be transcribed, use a special prompt
        if (isVideoFile) {
            return await generateGroqContent(content, videoPrompt, "llama3-70b-8192", 1500);
        }
        
        // Chunk content by character length
        const chunks = chunkText(content, 3000);
        console.log(`Content split into ${chunks.length} chunks`);
        
        if (chunks.length === 0) {
            return "Unable to process content.";
        }
        
        // Process each chunk with a limit on concurrent requests
        const MAX_CONCURRENT = 3;
        const results = [];
        
        for (let i = 0; i < chunks.length; i += MAX_CONCURRENT) {
            const batch = chunks.slice(i, i + MAX_CONCURRENT);
            const batchPromises = batch.map(chunk => 
                generateGroqContent(chunk, initialPrompt, "llama3-70b-8192", 1024)
            );
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Add small delay between batches to avoid rate limits
            if (i + MAX_CONCURRENT < chunks.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // If only one chunk, return its summary
        if (results.length === 1) {
            return results[0];
        }

        // Combine summaries if multiple chunks
        let combinedResults = results.join("\n\n");
        if (combinedResults.length > 6000) {
            combinedResults = combinedResults.substring(0, 6000) + "...";
        }
        
        return await generateGroqContent(combinedResults, combinePrompt, "llama3-70b-8192", 1500);
    } catch (error) {
        console.error("Error in processContentInChunks:", error);
        return "An error occurred while processing the content: " + error.message;
    }
}

// Get preview image
function getPreviewImage(contentData) {
    if (contentData.type === 'youtube' && contentData.videoId) {
        return `https://img.youtube.com/vi/${contentData.videoId}/0.jpg`;
    } else if (contentData.type === 'video') {
        return `/img/video-placeholder.png`;
    } else if (contentData.type === 'image') {
        return contentData.url; // Use the actual image URL
    } else {
        return `/img/website-placeholder.png`;
    }
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the URL Summarizer API",
        instructions: "Send a POST request to /api/process with a 'url' in the body."
    });
});

app.post('/api/process', async (req, res) => {
    const inputUrl = req.body.url;

    if (!inputUrl) {
        return res.status(400).json({ error: "URL is required in the request body." });
    }

    try {
        console.log(`Processing URL: ${inputUrl}`);
        const startTime = Date.now();
        
        const contentData = await extractContent(inputUrl);
        console.log(`Content extracted in ${Date.now() - startTime}ms`);

        if (contentData && contentData.content) {
            console.log(`Content length: ${contentData.content.length} characters`);
            console.log(`Content type: ${contentData.type}`);
            
            const summaryStart = Date.now();
            const summary = await processContentInChunks(
                contentData.content,
                summarizePrompt,
                combineSummaryPrompt,
                contentData.isVideoFile
            );
            console.log(`Summary generated in ${Date.now() - summaryStart}ms`);

            const previewImage = getPreviewImage(contentData);

            let contentTitle;
            switch (contentData.type) {
                case 'youtube':
                    contentTitle = 'YouTube Video Summary';
                    break;
                case 'video':
                    contentTitle = contentData.title || 'Video Content Summary';
                    break;
                case 'image':
                    contentTitle = 'Image Content Summary';
                    break;
                default:
                    contentTitle = contentData.title || 'Website Content Summary';
            }

            res.json({
                preview: previewImage,
                summary: summary,
                contentTitle: contentTitle,
                contentType: contentData.type,
                url: inputUrl,
                processTime: `${(Date.now() - startTime) / 1000} seconds`
            });
        } else {
            res.status(400).json({ error: "Could not extract meaningful content from URL." });
        }
    } catch (error) {
        console.error("Process route error:", error);
        res.status(500).json({ 
            error: `Error processing URL: ${error.message}`,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
// const client=new Groq(process.env.key);

router.post('/ask-groq', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required in the request body.' });
    }

    try {
        // Send the prompt to Groq with a stricter educational instruction
        const response = await client.chat.completions.create({
            model: "llama3-70b-8192",  // or whatever model you want to use
            messages: [
                {
                    role: "system", 
                    content: "You are an educational bot only. Please strictly answer only questions that are educational in nature. If the question is not educational, kindly respond by stating that you can only answer educational-related questions."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 1000  // Adjust based on response length
        });

        // Extract and send the response back
        const groqReply = response.choices[0].message.content;

        res.json({
            message: "Groq API Response",
            reply: groqReply,
            note: "You are speaking to a bot that strictly answers only educational questions."
        });
    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: `Error with Groq API: ${error.message}` });
    }
});
module.exports = router;