# apple3js

**apple3js** is an immersive 3D gallery web experience built with Three.js. It allows you to showcase images in a dynamic and interactive 3D environment.

## Installation

To get started with apple3js, follow these steps:

1. **Clone the Repository**
   Clone the project to your desired location:

   ```bash
   git clone https://github.com/RainZoneO2/apple3js.git
   cd apple3js
   ```

2. **Install Dependencies**
   Make sure you have [Node.js](https://nodejs.org/) installed. Then, install the required dependencies:

   ```bash
   npm install
   ```

## Usage

### Development

```bash
npm run dev
```

This processes any queued images, regenerates the asset manifest, and starts the Vite dev server with hot reload at `http://localhost:5173`.

### Production build

1. **Add Your Images** <a name="add-your-images"></a>
   Place your desired images into the `static/memories/textures/to-process` directory. They will be cropped/resized to 1000x1000 and converted to WebP automatically.

2. **Build locally**

   ```bash
   npm run build
   ```

3. **Preview the Local Build**

   ```bash
   npm run preview
   ```

Your application will be available at `http://localhost:4173` by default.

### Playing around in the gallery

Click the start button to enter and start the music.
To pan around the gallery hold `LEFT_CLICK` and move your mouse.
To zoom in/out, use the `SCROLL_WHEEL`.
When your camera is close enough to a memory, it will expand as a card.
Click a memory to view it fullscreen; close with `Esc`, the backdrop, or `Close`.
Press `F` or `SPACE` to throw an apple.
Use `Start tour` (bottom left) to glide between memories automatically.
Share a direct link to any memory — opening it flies there on entry (e.g. `#memory-0`).

## Project Structure

- `src`: Application code. `script.js` is the entry point; the `src/js` modules cover scene setup, physics, the gallery, sounds, and debug tooling.
- `static`: Static assets served as-is at the site root (textures, fonts, sounds). The generated `manifest.json` also lives here.
- `static/memories/textures/to-process`: Drop new images here; the pipeline converts them into `webp/`.
- `dist`: Build output.

## Asset Pipeline

Two Node scripts run automatically before `dev` and `build`:

- `process-images.js` converts everything in `to-process/` to 1000x1000 WebP (`npm run process-images`), moving originals into `processed/`.
- `generate-manifest.js` writes `static/manifest.json` listing the gallery textures, which the app fetches at runtime (`npm run generate-manifest`).

## Customizing

- **Content & theme**: edit `src/js/config.js` (title, greeting text, fog/floor colors, light intensities, sky defaults, gallery layout).
- **Captions**: add entries per image file name in `static/memories/metadata.json`:

  ```json
  { "my-photo.webp": { "title": "Summer 2024", "date": "August 2024" } }
  ```

## Contributing

Contributions are welcome! If you'd like to make changes or add new features, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes (`npm run lint` and `npm run format:check` should pass).
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a Pull Request.

For major changes, it's recommended to open an issue first to discuss what you would like to change.
