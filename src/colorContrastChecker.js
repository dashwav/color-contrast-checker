if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function () {

    "use strict";

    var ColorContrastChecker = function() {
        this.setOptions(options);
    };

    ColorContrastChecker.prototype = {
        options : {
            font_size: 14
        },
        setOptions : function (options) {
            this.options = $.extend({}, this.options, options);
        },
        rgbClass : {
            toString: function() {
                return '<r: ' + this.r +
                    ' g: ' + this.g +
                    ' b: ' + this.b +
                    ' >';
            }
        },
        isValidColorCode : function (hex){
            var regColorcode = /^(#)?([0-9a-fA-F]{6})([0-9a-fA-F]{6})?$/;
            return regColorcode.test(hex);
        },
        check : function (colorA, colorB){
            if(!colorA || !colorB)
                return false;

            var color1, color2;
            var l1; /* higher value */
            var l2; /* lower value */


            if (!this.isValidColorCode(colorA)) {
                throw new Exception("Invalid Color :" + colorA);
            }

            if (!this.isValidColorCode(colorB)) {
                throw new Exception("Invalid Color :" + colorB);
            }

            color1 = this.getRGBFromHex(colorA);
            color2 = this.getRGBFromHex(colorB);

            var l1RGB = this.calculateLRGB(color1);
            var l2RGB = this.calculateLRGB(color2);

            /* where L is luminosity and is defined as */
            l1 = this.calculateLuminance(l1RGB);
            l2 = this.calculateLuminance(l2RGB);

            return this.verifyContrastRatio(this.getContrastRatio(l1, l2));
        },
        calculateLuminance: function(lRGB) {
            return (0.2126 * lRGB.r) + (0.7152 * lRGB.g) + (0.0722 * lRGB.b);
        },
        isLevelAA : function(colorA, colorB) {
            var result = this.check(colorA, colorB);
            return result.WCAG_AA;
        },
        getRGBFromHex : function(color) {

            var rgb = Object.create(this.rgbClass),
                rVal,
                gVal,
                bVal;

            if (typeof color !== 'string') {
                throw new Error('must use string');
            }

            rVal = parseInt(color.slice(1, 3), 16);
            gVal = parseInt(color.slice(3, 5), 16);
            bVal = parseInt(color.slice(5, 7), 16);

            rgb.r = rVal;
            rgb.g = gVal;
            rgb.b = bVal;

            return rgb;
        },
        calculateSRGB : function(rgb) {
            var sRGB = Object.create(this.rgbClass),
                key;

            for (key in rgb) {
                if (rgb.hasOwnProperty(key)) {
                    sRGB[key] = parseFloat((rgb[key] / 255), 10);
                }
            }

            return sRGB;
        },
        calculateLRGB: function (rgb) {
            var sRGB = this.calculateSRGB(rgb);
            var lRGB = Object.create(this.rgbClass),
                key,
                val = 0;

            for (key in sRGB) {
                if (sRGB.hasOwnProperty(key)) {
                    val = parseFloat(sRGB[key], 10);
                    if (val <= 0.03928) {
                        lRGB[key] = (val / 12.92);
                    } else {
                        lRGB[key] = Math.pow(((val + 0.055) / 1.055), 2.4);
                    }
                }
            }

            return lRGB;
        },
        getContrastRatio : function(lumA, lumB) {
            var ratio,
                lighter,
                darker;

            if (lumA >= lumB) {
                lighter = lumA;
                darker = lumB;
            } else {
                lighter = lumB;
                darker = lumA;
            }

            ratio = (lighter + 0.05) / (darker + 0.05);

            return ratio;
        },
        verifyContrastRatio : function(ratio) {
            var lFontSize = this.options.font_size;

            var resultsClass = {
                toString: function() {
                    return '< WCAG-AA: ' + ((this.WCAG_AA) ? 'pass' : 'fail') +
                        ' WCAG-AAA: ' + ((this.WCAG_AAA) ? 'pass' : 'fail') +
                        ' >';
                }
            };
            var WCAG_REQ_RATIO_AA_LG = 3.0,
                WCAG_REQ_RATIO_AA_SM = 4.5,
                WCAG_REQ_RATIO_AAA_LG = 4.5,
                WCAG_REQ_RATIO_AAA_SM = 7.0,
                WCAG_FONT_CUTOFF = 18;

            var results = Object.create(resultsClass),
                fontSize = lFontSize || 14;

            if (fontSize >= WCAG_FONT_CUTOFF) {
                results.WCAG_AA = (ratio >= WCAG_REQ_RATIO_AA_LG);
                results.WCAG_AAA = (ratio >= WCAG_REQ_RATIO_AAA_LG);
            } else {
                results.WCAG_AA = (ratio >= WCAG_REQ_RATIO_AA_SM);
                results.WCAG_AAA = (ratio >= WCAG_REQ_RATIO_AAA_SM);
            }

            return results;
        }

    };

    return ColorContrastChecker;
});
