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

Follow these three steps:

1. **Add Your Images** <a name="add-your-images"></a>  
   Place your desired images into the `static/memories/textures/to-process` directory. These images will be used as textures in the 3D gallery.


2. **Build locally**  
   To see the local build of your 3D gallery, run:

   ```bash
   npm run build
   ```

   If you did [Step 1](#add-your-images) correctly, then you should see some output regarding image processing in the console.

3. **Preview the Local Build**  
   To see the local build of your 3D gallery, run:

   ```bash
   npm run preview
   ```

Your application will be available at `http://localhost:5173` by default.

## Project Structure

- `public`: Static files served by the web server.
- `src`: Contains the main code for the application.
- `static`: Directory that contains all assets for the application.
- `static/memories/textures`: Directory with images to be used for the gallery.


## Contributing

Contributions are welcome! If you’d like to make changes or add new features, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a Pull Request.

For major changes, it's recommended to open an issue first to discuss what you would like to change.

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).