document.getElementById('syncButton').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value;

    if (inputText) {
        processText(inputText);
    } else {
        alert('Please enter text.');
    }
});

const mouthImages = [
    'mouth_a.png',
    'mouth_d.png',
    'mouth_e.png',
    'mouth_f.png',
    'mouth_l.png',
    'mouth_o.png',
    'mouth_r.png',
    'mouth_s.png',
    'mouth_uh.png',
    'mouth_woo.png',
    'mouth_neutral.png'
];

const neutralMouthImage = 'mouth_neutral.png';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set default image as neutral mouth
window.onload = () => {
    const image = new Image();
    image.src = neutralMouthImage;
    image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
        const x = (canvas.width / 2) - (image.width / 2) * scale;
        const y = (canvas.height / 2) - (image.height / 2) * scale;
        ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
    };
};

function getRandomMouthShape() {
    const randomIndex = Math.floor(Math.random() * (mouthImages.length - 1)); // Exclude the last image (neutral mouth)
    return mouthImages[randomIndex];
}

function splitIntoParts(text) {
    const sentences = text.split(/(?<=[.!?\n])/);
    const parts = sentences.flatMap(sentence => sentence.split(/(?<=,)/));
    return parts.map(part => part.trim()).filter(part => part);
}

function processText(text) {
    const parts = splitIntoParts(text);
    let partIndex = 0;

    function processNextPart() {
        if (partIndex < parts.length) {
            const part = parts[partIndex];
            if (part) {
                calculateAndDisplayMouthShapes(part, () => {
                    const lastChar = part[part.length - 1];
                    let neutralFrames = 1; // Always end with one neutral frame

                    if (lastChar === ',') {
                        neutralFrames = 1; // One neutral frame for commas
                    } else if (['.', '!', '?'].includes(lastChar)) {
                        neutralFrames = 2; // Two neutral frames for sentence-ending punctuation
                    }

                    displayNeutralMouth(neutralFrames, () => {
                        partIndex++;
                        processNextPart(); // Immediately process the next part
                    }, 10); // Neutral mouth lasts for 10 milliseconds
                });
            } else {
                partIndex++;
                processNextPart();
            }
        }
    }

    processNextPart();
}

function calculateAndDisplayMouthShapes(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // Set the rate of speech

    let currentIndex = 0;
    const numImages = Math.ceil((text.length * 0.05) / 0.07); // Approximate duration calculation with 70ms spawn rate

    function drawMouth() {
        if (currentIndex < numImages) {
            const image = new Image();
            image.src = getRandomMouthShape();
            image.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
                const x = (canvas.width / 2) - (image.width / 2) * scale;
                const y = (canvas.height / 2) - (image.height / 2) * scale;
                ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
                currentIndex++;
                setTimeout(drawMouth, 70); // Schedule next draw in 70ms
            };
        } else {
            // Draw the neutral mouth at the end
            displayNeutralMouth(1, callback, 10); // Ensure the neutral mouth is displayed for 10 milliseconds
        }
    }

    utterance.onstart = drawMouth;

    utterance.onend = () => {
        // Do not clear the canvas here to avoid flashing
        if (callback) callback();
    };

    speechSynthesis.speak(utterance);
}

function displayNeutralMouth(frames, callback, duration = 10) {
    let frameCount = 0;

    function drawNeutral() {
        if (frameCount < frames) {
            const image = new Image();
            image.src = neutralMouthImage;
            image.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
                const x = (canvas.width / 2) - (image.width / 2) * scale;
                const y = (canvas.height / 2) - (image.height / 2) * scale;
                ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
                frameCount++;
                setTimeout(drawNeutral, duration); // Each neutral frame lasts for the specified duration
            };
        } else {
            if (callback) callback();
        }
    }

    drawNeutral();
}
