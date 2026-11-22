"""Génère les icônes de l'app (écran d'accueil iPhone, Android, onglet).

Usage : python3 cube/icones.py  (nécessite Pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parent.parent / "public"
FOND = (22, 24, 29)
Y, W, G, B, O, R = "#FFD60A", "#F7F8FA", "#12A150", "#1F5FE0", "#FF7A00", "#D6202F"
FACE = [
    [Y, B, Y],
    [R, Y, G],
    [Y, O, Y],
]


def icone(taille: int) -> Image.Image:
    echelle = 4  # dessin en grand puis réduction, pour des bords lisses
    s = taille * echelle
    img = Image.new("RGB", (s, s), FOND)
    d = ImageDraw.Draw(img)
    # La grille occupe le centre (zone sûre des icônes « maskable »).
    marge = s * 0.2
    pas = (s - 2 * marge) / 3
    ecart = pas * 0.09
    rayon = pas * 0.16
    for ligne in range(3):
        for col in range(3):
            x0 = marge + col * pas + ecart / 2
            y0 = marge + ligne * pas + ecart / 2
            d.rounded_rectangle(
                [x0, y0, x0 + pas - ecart, y0 + pas - ecart],
                radius=rayon,
                fill=FACE[ligne][col],
            )
    return img.resize((taille, taille), Image.LANCZOS)


for nom, taille in [("icone-192.png", 192), ("icone-512.png", 512), ("apple-touch-icon.png", 180)]:
    icone(taille).save(PUBLIC / nom, optimize=True)
    print("écrit", nom)
