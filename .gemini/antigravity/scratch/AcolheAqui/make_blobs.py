from PIL import Image, ImageDraw
import os

input_path = "c:/Users/Welder de Aquino/.gemini/antigravity/scratch/AcolheAqui/welder_nobg.png"
output_dir = "C:/Users/Welder de Aquino/.gemini/antigravity/brain/94558e5c-16ec-4293-800c-d74bac35c704"

welder = Image.open(input_path).convert("RGBA")
welder.thumbnail((600, 600), Image.Resampling.LANCZOS)
w, h = welder.size

def make_composed(filename, draw_func):
    bg = Image.new("RGBA", (700, 700), (0, 0, 0, 0))
    canvas = ImageDraw.Draw(bg)
    draw_func(canvas)
    paste_x = (700 - w) // 2
    paste_y = 700 - h
    bg.paste(welder, (paste_x, paste_y), welder)
    out_path = os.path.join(output_dir, filename)
    bg.save(out_path)
    print(f"Saved {out_path}")

def draw_circle(draw):
    draw.ellipse([100, 100, 600, 600], fill="#a978f5")

def draw_egg(draw):
    draw.ellipse([150, 50, 550, 650], fill="#b692ee")

def draw_blob(draw):
    draw.rounded_rectangle([120, 120, 580, 580], radius=180, fill="#7C3AED")

make_composed("welder_blob1.png", draw_circle)
make_composed("welder_blob2.png", draw_egg)
make_composed("welder_blob3.png", draw_blob)

print("Created 3 images")
