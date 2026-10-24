# `# Silhoué — Personal Styling Assistant` 

```
Silhoué is a web-based personal styling tool designed to explore clothing
recommendations using visual pose detection. Users can capture a photo through
their camera or upload an existing image to receive basic proportion-based
observations and clothing suggestions.
```

```
The goal is to make exploring personal style more accessible through a simple,
interactive interface.
```

# `## Features` 

- `**Camera Capture** — Capture a photo directly through your device's camera.` 

- `**Image Upload** — Upload an existing photo for analysis. - **Pose Detection** — Uses MediaPipe Pose Landmarker to detect key body landmarks.` 

```
- **Proportion-Based Observations** — Compares detected shoulder and hip
landmarks to generate a rough observation.
```

```
- **Clothing Recommendations** — Displays clothing suggestions based on the
detected proportions.
```

```
- **Shopping Search Links** — Explore relevant clothing through Amazon India and
Google Shopping.
- **Responsive Interface** — A clean, user-friendly interface for interacting
with the tool.
```

# `## Tech Stack` 

```
- **Frontend:** React
- **Build Tool:** Vite
- **Pose Detection:** MediaPipe Tasks Vision
```

- `**Languages:** JavaScript, HTML, CSS` 

# `## Getting Started` 

# `### Prerequisites` 

```
- Node.js and npm installed on your system
```

```
- A modern web browser
```

```
- Camera access, if you want to use the capture feature
```

# `### Installation` 

```
1. Clone the repository:
```

```
   ```bash
   git clone https://github.com/YOUR_USERNAME/Silhouette.git
   ```
```

```
2. Navigate to the project directory:
```

```
   ```bash
   cd Silhouette
   ```
```

`3. Install dependencies:` 

```
   ```bash
   npm install
   ```
```

`4. Start the development server:` 

```
   ```bash
   npm run dev
```

```
   ```
```

`5. Open the local URL displayed in your terminal, usually` 

- ``http://localhost:5173`.` 

# `## How It Works` 

`1. Capture a photo or upload an image.` 

`2. Run the pose-detection analysis.` 

`3. Review the generated proportion-based observation.` 

`4. Explore clothing recommendations.` 

`5. Open shopping search links to discover clothing options.` 

# `## Limitations` 

- `Results depend on image quality, camera angle, pose, clothing, and body visibility.` 

- `The current analysis uses pose landmarks as a rough proxy for visible proportions; it does not provide accurate body measurements or a definitive body-shape classification.` 

```
- Clothing suggestions are exploratory ideas, not professional styling advice.
- Shopping links open search results rather than guaranteeing specific product
matches.
```

# `## Project Status` 

```
Silhoué is a work in progress. Features and analysis methods may evolve as
development continues.
```

# `## License` 

```
No license has been added yet. All rights reserved unless a license is specified
in the repository.
```

