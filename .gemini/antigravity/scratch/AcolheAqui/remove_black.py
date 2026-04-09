from PIL import Image
import numpy as np

# Load original image
img_path = 'welder_original.jpg'
img = Image.open(img_path).convert("RGBA")
data = np.array(img)

# Find black pixels (R, G, B all below threshold)
r, g, b, a = data.T
threshold = 30 # very dark pixels
black_areas = (r < threshold) & (g < threshold) & (b < threshold)

# Set alpha to 0 for black pixels
data[..., :-1][black_areas.T] = (0, 0, 0)
data[..., -1][black_areas.T] = 0

result = Image.fromarray(data)

# Let's crop it to bounding box so he's not floating
bbox = result.getbbox()
if bbox:
    result = result.crop(bbox)

# To soften the edges, let's do a little alpha matting or blurring on the alpha channel (Optional, skipping for now)

result.save('welder_nobg_fixed.png')
print("Saved welder_nobg_fixed.png")
