# Flatify for Flaticons

This is an Adobe generator plugin for [Flaticons](http://flaticons.co). It will take a PSD with individual shape layers for icons and produce individual psds, pngs (1-4x), svgs, pdfs, and an icon font with an html preview file. Much of the actual exporting is based off of [Paul Straw's](https://github.com/paulstraw) original [Flatifier](https://github.com/paulstraw/flatifier). This version has been re-worked to utilize generator and removes any external dependencies like fontcustom.

To get started, clone this repo and run `npm i`. Also, you'll probably want to familiarize yourself with Adobe's [Generator Dev Environment Setup](https://github.com/adobe-photoshop/generator-core/wiki/Generator-Development-Environment-Setup) guide. It should give you everything you need to know to get up and running.

**Note**

Pay special attention to the [node version](https://github.com/adobe-photoshop/generator-core/wiki/Node-versions) that's currently shipping with Photoshop. This bit me while testing locally with 4.2.x and PS running 0.10.x. Make sure to `npm i` while using the same Node version as ships with Photoshop.

## Exported Assets Structure

```
/flatified
-- font
	-- preview
		-- preview.css
		-- preview.html
	-- flaticons-solid-2.{svg, eot, ttf, woff}
-- icons.json
-- pdf
	-- icon-name-1.pdf
-- png
	-- 1x
		-- icon-name-1.png
	-- 2x
		-- icon-name-1.png
	-- 3x
		-- icon-name-1.png
	-- 4x
		-- icon-name-1.png
-- psd
	-- icon-name-1.psd
-- svg
	-- icon-name-1.svg
```

## Exported JSON Structure

```
[
	{
		"name": "grid-1",
		"tags": "grid-1 grid"
	}
]
```
