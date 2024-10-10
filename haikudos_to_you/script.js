// script.js

let currentPoemIndex = 0;
let selectedColor = '#FFFFFF'; // Default white

// Initialize Color Thief
const colorThief = new ColorThief();

// Handle Color Picker Change
const colorPicker = document.getElementById('color-picker');
colorPicker.addEventListener('input', (event) => {
    selectedColor = event.target.value;
    updatePoemStyle();
});

// Handle Preset Color Selection
const presetColorContainer = document.getElementById('preset-colors');

function createPresetColorButton(color) {
    const button = document.createElement('button');
    button.classList.add('preset-color');
    button.setAttribute('data-color', color);
    button.style.backgroundColor = color;
    presetColorContainer.appendChild(button);

    // Add event listener
    button.addEventListener('click', () => {
        selectedColor = color;
        colorPicker.value = color;
        updatePoemStyle();
    });
}

// Function to Extract Colors from Image and Create Preset Swatches
function generatePresetColors() {
    const img = document.getElementById('poem-image');

    // Ensure the image is loaded
    if (img.complete && img.naturalHeight !== 0) {
        try {
            // Get dominant colors
            const palette = colorThief.getPalette(img, 5); // Get top 5 colors

            // Clear existing preset colors
            presetColorContainer.innerHTML = '';

            // Select 4 preset colors: first 4 from palette
            if (palette.length >= 4) {
                const selectedColors = [
                    rgbToHex(palette[0][0], palette[0][1], palette[0][2]),
                    rgbToHex(palette[1][0], palette[1][1], palette[1][2]),
                    rgbToHex(palette[2][0], palette[2][1], palette[2][2]),
                    rgbToHex(palette[3][0], palette[3][1], palette[3][2]),
                ];

                selectedColors.forEach(color => createPresetColorButton(color));
            } else {
                // Fallback preset colors if not enough colors are extracted
                presetColorContainer.innerHTML = '';
                const fallbackColors = ['#FFFFFF', '#FFA500', '#FF8C00', '#000000'];
                fallbackColors.forEach(color => createPresetColorButton(color));
            }
        } catch (error) {
            console.error('Color Thief error:', error);
            // Fallback preset colors
            presetColorContainer.innerHTML = '';
            const fallbackColors = ['#FFFFFF', '#FFA500', '#FF8C00', '#000000'];
            fallbackColors.forEach(color => createPresetColorButton(color));
        }
    } else {
        // If image not loaded yet, wait and retry
        img.addEventListener('load', generatePresetColors);
    }
}

// Helper function to convert RGB to HEX
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Function to Update Poem Style
function updatePoemStyle() {
    const poemContainer = document.getElementById('poem');
    const lines = poemContainer.querySelectorAll('p');
    lines.forEach(line => {
        line.style.color = selectedColor;
    });

    // Ensure inscription number remains unchanged
    const inscriptionNumber = document.getElementById('inscription-number');
    inscriptionNumber.style.color = '#aaa'; // Fixed grey color
}

// Function to Display a Poem Based on Index
function displayPoem(index) {
    const poemData = poems[index];
    const poemContainer = document.getElementById('poem');
    const inscriptionNumber = document.getElementById('inscription-number');
    const poemImage = document.getElementById('poem-image');

    // Clear previous content
    poemContainer.innerHTML = '';

    // Create and append poem lines with empty lines between
    poemData.lines.forEach((line, idx) => {
        const lineElement = document.createElement('p');
        lineElement.textContent = line;
        poemContainer.appendChild(lineElement);

        if (idx < poemData.lines.length - 1) {
            // Add an empty line
            const emptyLine = document.createElement('p');
            emptyLine.textContent = '';
            poemContainer.appendChild(emptyLine);
        }
    });

    // Update inscription number with hyperlink and security attributes
    inscriptionNumber.innerHTML = `#${poemData.shortID} - <a href="https://ordinals.com/inscription/${poemData.longID}" target="_blank" rel="noopener noreferrer">${poemData.longID}</a>`;

    // Ensure the image is loaded before adjusting font sizes
    if (poemImage.complete && poemImage.naturalHeight !== 0) {
        // Adjust font sizes and spacing
        adjustFontSizes(poemContainer);
        generatePresetColors(); // Generate preset colors after image loads
    } else {
        poemImage.onload = function() {
            adjustFontSizes(poemContainer);
            generatePresetColors(); // Generate preset colors after image loads
        };
    }

    // Apply the selected color to the poem
    updatePoemStyle();
}

function adjustFontSizes(container) {
    const lines = container.querySelectorAll('p');
    const containerWidth = container.offsetWidth;

    // Reset styles
    lines.forEach(line => {
        line.style.fontSize = '100px'; // Start with a large font size
        line.style.display = 'inline-block'; // Ensure inline-block for pseudo-element
        line.style.textAlign = 'justify'; // Default to justify
        line.style.margin = '0'; // Reset margin
    });

    // Find the maximum natural width among text lines
    let maxLineWidth = 0;
    lines.forEach(line => {
        const lineWidth = line.offsetWidth;
        if (lineWidth > maxLineWidth) {
            maxLineWidth = lineWidth;
        }
    });

    // Scale font size to fit the longest line within the container width
    const scalingFactor = containerWidth / maxLineWidth;

    // Ensure scalingFactor is reasonable
    if (!isFinite(scalingFactor) || scalingFactor <= 0) {
        console.error('Invalid scaling factor:', scalingFactor);
        return;
    }

    lines.forEach(line => {
        const fontSize = parseFloat(window.getComputedStyle(line).fontSize);
        const newFontSize = fontSize * scalingFactor;
        line.style.fontSize = `${newFontSize}px`;

        // Check the number of words
        const textContent = line.textContent.trim();
        const numWords = textContent.split(/\s+/).length;

        if (numWords <= 2) {
            // Center-align lines with one or two words
            line.style.textAlign = 'center';
            line.style.display = 'block'; // Remove inline-block for centering
            line.style.margin = '0 auto';
        } else {
            line.style.textAlign = 'justify';
            line.style.display = 'inline-block';
        }
    });

    // Adjust vertical spacing
    adjustVerticalSpacing(container);
}

function adjustVerticalSpacing(container) {
    const poemContainer = container.parentElement; // .poem-container
    const lines = container.querySelectorAll('p');
    const image = document.querySelector('.left-panel img');
    const imageHeight = image.offsetHeight;

    const totalTextHeight = Array.from(lines).reduce((total, line) => total + line.offsetHeight, 0);

    // Center the poem vertically within the image height
    const topMargin = (imageHeight - totalTextHeight) / 2;

    // Ensure topMargin is not negative
    const adjustedTopMargin = Math.max(topMargin, 0);

    poemContainer.style.marginTop = `${adjustedTopMargin}px`;
    poemContainer.style.marginBottom = `${adjustedTopMargin}px`;
}

// Navigation buttons
document.getElementById('prev-poem').addEventListener('click', () => {
    currentPoemIndex = (currentPoemIndex - 1 + poems.length) % poems.length;
    displayPoem(currentPoemIndex);
});

document.getElementById('next-poem').addEventListener('click', () => {
    currentPoemIndex = (currentPoemIndex + 1) % poems.length;
    displayPoem(currentPoemIndex);
});

// Handle Download Banner Button
document.getElementById('download-banner').addEventListener('click', () => {
    generateBannerImage();
});

// Initial display
window.onload = function() {
    const img = document.querySelector('.left-panel img');
    if (img.complete && img.naturalHeight !== 0) {
        displayPoem(currentPoemIndex);
    } else {
        img.onload = function() {
            displayPoem(currentPoemIndex);
        };
    }
};

// Adjust on window resize
window.addEventListener('resize', () => {
    displayPoem(currentPoemIndex);
});

// Handle image selection
const imageInput = document.getElementById('image-input');
const poemImage = document.getElementById('poem-image');

imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            poemImage.src = e.target.result;
            // Re-adjust font sizes after image loads
            poemImage.onload = function() {
                displayPoem(currentPoemIndex);
            };
        };
        reader.readAsDataURL(file);
    } else {
        // Handle invalid file types or reset if necessary
        alert('Please upload a valid image file.');
    }
});

// Handle drag and drop
const dropArea = document.getElementById('drop-area');

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('hover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('hover');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('hover');
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            poemImage.src = e.target.result;
            // Re-adjust font sizes after image loads
            poemImage.onload = function() {
                displayPoem(currentPoemIndex);
            };
        };
        reader.readAsDataURL(file);
    } else {
        // Handle invalid file types or reset if necessary
        alert('Please upload a valid image file.');
    }
});

// Function to generate the banner image
function generateBannerImage() {
    const canvas = document.getElementById('banner-canvas');
    const context = canvas.getContext('2d');

    // Get the image and poem data
    const poemImageElement = document.getElementById('poem-image');
    const poemContainer = document.getElementById('poem');
    let poemLines = Array.from(poemContainer.querySelectorAll('p'));

    // Filter out empty lines
    poemLines = poemLines.filter(line => line.textContent.trim() !== '');

    // Canvas dimensions
    const canvasWidth = 1500;
    const canvasHeight = 500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Fill background with black color
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Margins
    const margin = 20;

    // Image dimensions and position
    const imageAreaWidth = canvasWidth / 3; // 500px
    const imageAreaHeight = canvasHeight;
    const imageX = margin;
    const imageY = margin;
    const imageWidth = imageAreaWidth - margin * 2;
    const imageHeight = imageAreaHeight - margin * 2;

    // Draw the image with rounded corners
    drawRoundedImage(context, poemImageElement, imageX, imageY, imageWidth, imageHeight, 20);

    // Text area dimensions
    const textAreaX = imageAreaWidth + margin;
    const textAreaY = margin;
    const textAreaWidth = canvasWidth - imageAreaWidth - margin * 2;
    const textAreaHeight = canvasHeight - margin * 2;

    // Render the poem text with selected color
    renderPoemText(context, poemLines, textAreaX, textAreaY, textAreaWidth, textAreaHeight);

    // Create a temporary link to download the image
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'haikudos_banner.png';
    link.href = dataUrl;
    link.click();
    link.remove();
}

// Function to draw an image with rounded corners
function drawRoundedImage(ctx, img, x, y, width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();

    // Draw the image within the clipped area
    ctx.drawImage(img, x, y, width, height);
    ctx.restore();
}

// Function to render the poem text
function renderPoemText(ctx, poemLines, x, y, width, height) {
    // Minimum and maximum font size and spacing
    const minFontSize = 24;
    const maxFontSize = 150;
    const minLetterSpacing = 1; // Adjust as per your preference
    const minWordSpacing = 19; // Adjust as per your preference
    const minLineSpacing = minWordSpacing; // Use the same as word spacing
    const maxLineSpacing = 21; // Adjust as needed

    // First, calculate font sizes and metrics for each line
    const lineMetrics = poemLines.map((line) => {
        const text = line.textContent.trim().toUpperCase();
        let fontSize = maxFontSize;
        let fits = false;
        let letterSpacing = minLetterSpacing;
        let wordSpacing = minWordSpacing;

        ctx.font = `bold ${fontSize}px Arial`;

        while (!fits && fontSize >= minFontSize) {
            ctx.font = `bold ${fontSize}px Arial`;
            const textWidth = measureTextWidth(ctx, text, letterSpacing, wordSpacing);

            if (textWidth <= width) {
                fits = true;
            } else {
                fontSize -= 2; // Decrease font size
            }
        }

        // Ensure letterSpacing and wordSpacing are not negative
        letterSpacing = Math.max(letterSpacing, minLetterSpacing);
        wordSpacing = Math.max(wordSpacing, minWordSpacing);

        return {
            text: text,
            fontSize: fontSize,
            letterSpacing: letterSpacing,
            wordSpacing: wordSpacing,
            textWidth: measureTextWidth(ctx, text, letterSpacing, wordSpacing),
            textHeight: fontSize,
        };
    });

    // Calculate total text height with minimal line spacing
    const totalTextHeightWithMinSpacing = lineMetrics.reduce((sum, metrics) => sum + metrics.textHeight, 0)
        + (lineMetrics.length - 1) * minLineSpacing;

    // Calculate total text height with maximum line spacing
    const totalTextHeightWithMaxSpacing = lineMetrics.reduce((sum, metrics) => sum + metrics.textHeight, 0)
        + (lineMetrics.length - 1) * maxLineSpacing;

    // Determine the line spacing to use
    let lineSpacing = minLineSpacing;

    if (totalTextHeightWithMinSpacing > height) {
        // Need to reduce font sizes proportionally
        const scalingFactor = height / totalTextHeightWithMinSpacing;
        lineMetrics.forEach(metrics => {
            metrics.fontSize *= scalingFactor;
            metrics.textHeight = metrics.fontSize;
            // Recalculate text width with new font size
            ctx.font = `bold ${metrics.fontSize}px Arial`;
            metrics.textWidth = measureTextWidth(ctx, metrics.text, metrics.letterSpacing, metrics.wordSpacing);
        });
        lineSpacing = minLineSpacing * scalingFactor;
    } else if (totalTextHeightWithMaxSpacing < height) {
        // Can increase line spacing up to maxLineSpacing to fill the space
        const extraSpace = height - totalTextHeightWithMinSpacing;
        const availableLineSpacing = Math.min(maxLineSpacing, minLineSpacing + extraSpace / (lineMetrics.length - 1 || 1));
        lineSpacing = availableLineSpacing;
    } else {
        // Use proportional line spacing to fill the height between min and max
        const extraSpace = height - totalTextHeightWithMinSpacing;
        const spacingRange = maxLineSpacing - minLineSpacing;
        const proportion = extraSpace / (totalTextHeightWithMaxSpacing - totalTextHeightWithMinSpacing);
        lineSpacing = minLineSpacing + spacingRange * proportion;
    }

    // Recalculate total text height with the determined line spacing
    const adjustedTotalTextHeight = lineMetrics.reduce((sum, metrics) => sum + metrics.textHeight, 0)
        + (lineMetrics.length - 1) * lineSpacing;

    // Vertical centering
    let currentY = y + (height - adjustedTotalTextHeight) / 2;

    // Draw each line
    lineMetrics.forEach((metrics) => {
        ctx.font = `bold ${metrics.fontSize}px Arial`;
        ctx.fillStyle = selectedColor; // Use the selected color from the color picker
        ctx.textBaseline = 'top';

        // Adjust starting X position to center the text
        const startX = x + (width - metrics.textWidth) / 2;

        // Draw text with calculated spacing
        drawTextWithSpacing(ctx, metrics.text, startX, currentY, metrics.letterSpacing, metrics.wordSpacing);

        currentY += metrics.textHeight + lineSpacing;
    });
}

// Function to measure text width with spacing
function measureTextWidth(ctx, text, letterSpacing, wordSpacing) {
    const words = text.split(/\s+/);
    const numWords = words.length;
    let width = 0;

    words.forEach((word, wordIndex) => {
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            width += ctx.measureText(char).width;
            if (i < word.length - 1) {
                width += letterSpacing;
            }
        }
        if (wordIndex < numWords - 1) {
            width += wordSpacing;
        }
    });

    return width;
}

// Function to draw text with letter and word spacing
function drawTextWithSpacing(ctx, text, x, y, letterSpacing, wordSpacing) {
    const words = text.split(/\s+/);
    const numWords = words.length;
    let currentX = x;

    words.forEach((word, wordIndex) => {
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            ctx.fillText(char, currentX, y);
            currentX += ctx.measureText(char).width + letterSpacing;
        }
        if (wordIndex < numWords - 1) {
            currentX += wordSpacing;
        }
    });
}
