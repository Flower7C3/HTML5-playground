/*
 * Floodfill - Linear Floodfill with tolerance in plain Javascript.
 * 
 * Autor: Markus Ritberger
 * Version: 1.0.1 (2012-04-16)
 * Examples at: http://demos.ritberger.at/floodfill
 * 
 * Modified by: BartĹomiej Kwiatek (quidnam.net)
 * Version: 1.0.2 (2013-09-23)
 * 
 * licensed under MIT license:
 * 
 * Copyright (c) 2012 Markus Ritberger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
 * THE SOFTWARE.
 */


/* image data and colors */
var fImageData;
var fStartColor = {};
var fMaxColor = {};
var fMinColor = {};
var fFillColor = {};

/**
 * Flood fill alghoritm.
 * @param {int} x - pixel for flood fill start
 * @param {int} y - pixel for flood fill start
 * @param {context} ctx - canvas context data
 * @param {string} color - as hex value
 * @param {int} tolerance - color tolerance for fill
 * @returns {undefined}
 */
function floodFill(x, y, ctx, color, tolerance) {
    /* config */
    var fPixelStack = [[x, y]];
    var fPixelPos = (y * ctx.canvas.width + x) * 4;
    /* image data */
    fImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    /* start color */
    fStartColor.R = fImageData.data[fPixelPos];
    fStartColor.G = fImageData.data[fPixelPos + 1];
    fStartColor.B = fImageData.data[fPixelPos + 2];
    /* maximum color calculated with start color and tolerance */
    fMaxColor.R = fStartColor.R + (fStartColor.R * (tolerance / 100));
    fMaxColor.G = fStartColor.G + (fStartColor.G * (tolerance / 100));
    fMaxColor.B = fStartColor.B + (fStartColor.B * (tolerance / 100));
    /* minimal color calculated with start color and tolerance */
    fMinColor.R = fStartColor.R - (fStartColor.R * (tolerance / 100));
    fMinColor.G = fStartColor.G - (fStartColor.G * (tolerance / 100));
    fMinColor.B = fStartColor.B - (fStartColor.B * (tolerance / 100));
    /* fill color */
    fFillColor.R = hex2RGB(color).R;
    fFillColor.G = hex2RGB(color).G;
    fFillColor.B = hex2RGB(color).B;
    fFillColor.A = 255;
    /* flood fill calculations */
    while (fPixelStack.length) {
        newPos = fPixelStack.pop();
        x = newPos[0];
        y = newPos[1];
        fPixelPos = (y * ctx.canvas.width + x) * 4;
        while (y-- >= 0 && matchColorToleranceAt(fPixelPos)) {
            fPixelPos -= ctx.canvas.width * 4;
        }
        fPixelPos += ctx.canvas.width * 4;
        ++y;
        ffReachLeft = false;
        ffReachRight = false;
        while (y++ < ctx.canvas.height - 1 && matchColorToleranceAt(fPixelPos)) {
            fillColorAt(fPixelPos);
            if (x > 0) {
                if (matchColorToleranceAt(fPixelPos - 4)) {
                    if (!ffReachLeft) {
                        fPixelStack.push([x - 1, y]);
                        ffReachLeft = true;
                    }
                } else if (ffReachLeft) {
                    ffReachLeft = false;
                }
            }
            if (x < ctx.canvas.width - 1) {
                if (matchColorToleranceAt(fPixelPos + 4)) {
                    if (!ffReachRight) {
                        fPixelStack.push([x + 1, y]);
                        ffReachRight = true;
                    }
                } else if (matchColorToleranceAt(fPixelPos + 4 - (ctx.canvas.width * 4))) {
                    if (!ffReachLeft) {
                        fPixelStack.push([x + 1, y - 1]);
                        ffReachLeft = true;
                    }
                } else if (ffReachRight) {
                    ffReachRight = false;
                }
            }
            fPixelPos += ctx.canvas.width * 4;
        }
    }
    /* draw image data to context */
    ctx.putImageData(fImageData, 0, 0);
}

/**
 * Calculate RGB value for given hex color value.
 * @param {string} hex - hex value of color (7 signs with # or 6 signs)
 * @returns {object} 3 elements object with int color values
 */
function hex2RGB(hex) {
    hex = (hex.charAt(0) === "#") ? hex.substring(1, 7) : hex;
    return {
        R: parseInt(hex.substring(0, 2), 16),
        G: parseInt(hex.substring(2, 4), 16),
        B: parseInt(hex.substring(4, 6), 16)
    };
}

/**
 * Fill calculated colors at given position.
 * @param {int} pixelPos - position of pixel to fill
 * @returns {undefined}
 */
function fillColorAt(pixelPos) {
    fImageData.data[pixelPos] = fFillColor.R;
    fImageData.data[pixelPos + 1] = fFillColor.G;
    fImageData.data[pixelPos + 2] = fFillColor.B;
    fImageData.data[pixelPos + 3] = fFillColor.A;
}

/**
 * Check if given pixel (pixelPos) mach to color tolereance (ffMin and ffMax) and given pixel has different color than fill color
 * @param {int} pixelPos - position of pixel to check
 * @returns {boolean}
 */
function matchColorToleranceAt(pixelPos) {
    var r = fImageData.data[pixelPos];
    var g = fImageData.data[pixelPos + 1];
    var b = fImageData.data[pixelPos + 2];
    return ((
            (r >= fMinColor.R && r <= fMaxColor.R)
            && (g >= fMinColor.G && g <= fMaxColor.G)
            && (b >= fMinColor.B && b <= fMaxColor.B)
            )
            &&
            !(r === fFillColor.R
            && g === fFillColor.G
            && b === fFillColor.B
            )
            );
}
