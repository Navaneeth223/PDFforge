import os
import io
from PIL import Image
from rembg import remove
from services.storage import get_output_path

def compress_image(session_id: str, file_path: str, quality: int = 70) -> str:
    img = Image.open(file_path)
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".png":
        img = img.convert("P", palette=Image.ADAPTIVE)
    output_path = get_output_path(session_id, ext)
    img.save(output_path, quality=quality, optimize=True)
    return output_path

def convert_image(session_id: str, file_path: str, target_fmt: str) -> str:
    img = Image.open(file_path).convert("RGB")
    ext = f".{target_fmt.lower()}"
    output_path = get_output_path(session_id, ext)
    img.save(output_path)
    return output_path

def resize_image(session_id: str, file_path: str, width: int, height: int) -> str:
    img = Image.open(file_path)
    img = img.resize((width, height), Image.LANCZOS)
    ext = os.path.splitext(file_path)[1].lower()
    output_path = get_output_path(session_id, ext)
    img.save(output_path)
    return output_path

def remove_background(session_id: str, file_path: str) -> str:
    with open(file_path, "rb") as i:
        input_data = i.read()
    output_data = remove(input_data)
    output_path = get_output_path(session_id, ".png")
    with open(output_path, "wb") as o:
        o.write(output_data)
    return output_path
