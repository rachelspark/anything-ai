# Anything AI: a generative photo editing tool

Click and fill anything in your image with a simple text prompt. Segment Anything meets Stable Diffusion, in your browser.

[anything-ai.com](https://www.anything-ai.com/) is a generative photo editing tool that accepts an image, creates object masks (holes) based on where you click, and then takes in a prompt to generate content and magically fill that hole with anything you want. 

## Background & Technical Details
*Anything* takes the most recent research in image inpainting, focusing on [Inpaint Anything](https://arxiv.org/abs/2304.06790)'s Remove Anything and Fill Anything, and makes these powerful vision models easy to use on the web. Image segmentation is powered by Meta's [Segment-Anything Model (SAM)](https://segment-anything.com/) and content generation is powered by [Stable Diffusion Inpainting](https://arxiv.org/abs/2112.10752). The backend is served using Python (on a [Modal](https://modal.com/) endpoint) with a [Next.js](https://nextjs.org/) frontend.

## Development
If you want to hack on *Anything*, install the dependencies and run the frontend development server locally using a recent version of Node.js:
    npm install
    npm run dev

This automatically connects to the models deployed serverlessly on Modal. 

To modify the backend, you will need to set up a Modal account/token and make sure you have Python 3.10+ and [Poetry](https://python-poetry.org/) (Python dependency manager) installed. Run `poetry install` in the main directory to install all the backend dependencies, then make sure you're in the virtual environment whenever you run the server. Once you're happy with your changes, you can deploy your backend by running `modal deploy main.py`, which creates a public webhook such as "https://rachelspark--replace-anything-fastapi-app.modal.run". You can then point the API_ENDPOINT in the web app to your new backend URL.
