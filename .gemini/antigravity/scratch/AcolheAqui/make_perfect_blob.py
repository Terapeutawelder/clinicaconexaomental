from PIL import Image, ImageDraw
import os

input_path = "c:/Users/Welder de Aquino/.gemini/antigravity/scratch/AcolheAqui/welder_nobg.png"
output_dir = "C:/Users/Welder de Aquino/.gemini/antigravity/brain/94558e5c-16ec-4293-800c-d74bac35c704"

def make_perfect_blob_faded(filename):
    welder = Image.open(input_path).convert("RGBA")
    bbox = welder.getbbox()
    if bbox:
        welder = welder.crop(bbox)
        
    welder.thumbnail((500, 500), Image.Resampling.LANCZOS)
    w, h = welder.size

    # The background Canvas
    bg_size = 650
    bg = Image.new("RGBA", (bg_size, bg_size), (0, 0, 0, 0))
    canvas = ImageDraw.Draw(bg)
    
    # Draw blob
    blob_w, blob_h = 500, 500
    blob_x = (bg_size - blob_w) // 2
    blob_y = (bg_size - blob_h) // 2
    canvas.ellipse([blob_x, blob_y, blob_x + blob_w, blob_y + blob_h], fill="#a978f5")
    
    # Create fade gradient for the bottom of the welder image
    # We will create an alpha mask for the 'welder' image
    fade_height = 80
    alpha_mask = welder.split()[3]
    alpha_data = list(alpha_mask.getdata())
    
    # Modify alpha pixels to fade out at the bottom
    # h = height of welder
    new_alpha_data = []
    for y in range(h):
        # Calculate fade factor (1.0 at top, 0.0 at bottom)
        if y < h - fade_height:
            factor = 1.0
        else:
            factor = 1.0 - ((y - (h - fade_height)) / fade_height)
            
        for x in range(w):
            idx = y * w + x
            orig_alpha = alpha_data[idx]
            new_alpha_data.append(int(orig_alpha * factor))
            
    alpha_mask.putdata(new_alpha_data)
    welder.putalpha(alpha_mask)
    
    paste_x = (bg_size - w) // 2
    paste_y = bg_size - h - 30
    
    bg.paste(welder, (paste_x, paste_y), welder)
    
    out_path = os.path.join(output_dir, filename)
    bg.save(out_path)
    print(f"Saved {out_path}")

make_perfect_blob_faded("welder_perfect_blob_faded.png")
