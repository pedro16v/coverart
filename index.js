import fetch from 'node-fetch';
import express from 'express';

const app = express();
const host = '127.0.0.1';
const port = 3000;

app.get('/cover-art/:mbid', (req, res) => {
    const mbid = req.params.mbid;

    fetchCoverArtImage(mbid)
        .then(stream => {
            // Set the content type header
            res.setHeader('Content-Type', 'image/jpeg');
            // Stream the image data to the response
            stream.body.pipe(res);
        })
        .catch(error => {
            console.error('Error fetching cover art:', error.message);
            res.status(500).send(error.message);
        });
});

function fetchCoverArtImage(mbid) {
    return fetchCoverArt(mbid)
        .then(thumbnailUrl => {
            if (!thumbnailUrl) {
                throw new Error('Cover art not available.');
            }
            return fetch(thumbnailUrl, {
                method: 'GET',
                redirect: 'follow'
            });
        });
}

function fetchCoverArt(mbid) {
    const url = `https://coverartarchive.org/release-group/${mbid}`;

    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        redirect: 'follow'
    })
    .then(response => {
        if (response.status === 200) {     
            return response.json();
        } else if (response.status === 400) {
            throw new Error('Invalid MBID format.');
        } else if (response.status === 404) {
            throw new Error('No release group found with the provided MBID, or no chosen image to represent the release group.');
        } else if (response.status === 501) {
            throw new Error('Request method not supported.');
        } else if (response.status === 503) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else {
            throw new Error('An unexpected error occurred.');
        }
    })
    .then(data => {
        if (data.images && data.images.length > 0) {
            console.log('Fetching image for ' + mbid);
            
            // Try to find an image with type "Front"
            const frontImage = data.images.find(image => image.types && image.types.includes("Front"));

            // Use the front image if found, otherwise fallback to the first image
            const targetImage = frontImage || data.images[0];
            
            // Check if the target image has a 'small' thumbnail
            if (targetImage.thumbnails && targetImage.thumbnails['small']) {
                return targetImage.thumbnails['small'];
            }
        }
        
        // Return null if no images are found or if no image has a 'small' thumbnail
        return null;
    });
}

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});
