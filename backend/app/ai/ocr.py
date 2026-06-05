import io
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

try:
    import pytesseract
except ImportError:
    pytesseract = None


def extract_text_from_image(image_path: Path) -> str:
    if pytesseract is None:
        raise RuntimeError("pytesseract is not installed")
    image = Image.open(image_path)
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    text = pytesseract.image_to_string(image)
    return text.strip()


def extract_text_from_pdf(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    pages: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text.strip():
            pages.append(page_text.strip())

    combined = "\n\n".join(pages).strip()
    if combined:
        return combined

    return _ocr_pdf_as_images(pdf_path)


def _ocr_pdf_as_images(pdf_path: Path) -> str:
    try:
        from pdf2image import convert_from_path
    except ImportError:
        return ""

    if pytesseract is None:
        return ""

    try:
        images = convert_from_path(str(pdf_path), dpi=200)
    except Exception:
        return ""

    chunks: list[str] = []
    for img in images:
        text = pytesseract.image_to_string(img)
        if text.strip():
            chunks.append(text.strip())
    return "\n\n".join(chunks)


def extract_text_from_bytes(content: bytes, file_type: str) -> str:
    if file_type in ("image/jpeg", "image/jpg", "image/png", "image/webp", "image/tiff"):
        image = Image.open(io.BytesIO(content))
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        if pytesseract is None:
            raise RuntimeError("pytesseract is not installed")
        return pytesseract.image_to_string(image).strip()
    return ""


def extract_text(file_path: Path, mime_type: str) -> str:
    suffix = file_path.suffix.lower()
    if mime_type == "application/pdf" or suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    if mime_type.startswith("image/") or suffix in (".jpg", ".jpeg", ".png", ".webp", ".tiff", ".bmp"):
        return extract_text_from_image(file_path)
    return ""
