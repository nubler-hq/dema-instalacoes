#!/usr/bin/env python3
"""Download and organize case images from official project websites."""
from __future__ import annotations

import json
import os
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "images" / "cases"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def ext_from_url(url: str) -> str:
    m = re.search(r"\.(jpg|jpeg|png|webp)(?:\?|$)", url, re.I)
    return f".{m.group(1).lower()}" if m else ".jpg"


def download_many(folder: str, urls: list[str], start_index: int = 1) -> list[str]:
    dest = ROOT / folder
    dest.mkdir(parents=True, exist_ok=True)
    paths: list[str] = []
    for i, url in enumerate(urls, start=start_index):
        ext = ext_from_url(url)
        filename = f"image-{i:03d}{ext}"
        path = dest / filename
        print(f"  downloading {folder}/{filename}")
        path.write_bytes(fetch(url))
        paths.append(f"/images/cases/{folder}/{filename}")
    return paths


DOWNLOADS: dict[str, list[str]] = {
    "torre-principal": [
        "https://static.wixstatic.com/media/6c998c_14d5aac613b84f4e82f3aaeadaac1fe9~mv2.jpg",
        "https://static.wixstatic.com/media/6c998c_0ccc4aec43624bf5864acece76c37f3a~mv2.png",
        "https://static.wixstatic.com/media/6c998c_793dabcbce4242ffa5908db44200edc1~mv2.jpg",
        "https://static.wixstatic.com/media/6c998c_be1fff2ed900444ea9df38b3339b4db2~mv2.jpg",
    ],
    "torre-dgn-360": [
        "https://static.wixstatic.com/media/e8c13c_9ffb24768a5e42b4989032dac48d1a04~mv2.jpg",
        "https://static.wixstatic.com/media/e8c13c_214f7a80db424f5a9b1539ace6b535da~mv2.jpg",
        "https://static.wixstatic.com/media/e8c13c_3df466eee02d4f7ca6fb4b7d3dcc6d9f~mv2.png",
        "https://static.wixstatic.com/media/e8c13c_4cf5987623fe448eb6504ee41719f914~mv2.png",
        "https://static.wixstatic.com/media/e8c13c_f246ddc789d24e3fbfa9983149a64f83~mv2.png",
        "https://static.wixstatic.com/media/e8c13c_1a590ba7da00424896faa9a8d96a95c2~mv2.png",
    ],
    "torre-verona": [
        "https://static.wixstatic.com/media/e8c13c_aeb30f40916a42f680209cdc31530343~mv2.jpg",
        "https://static.wixstatic.com/media/e8c13c_e04d94e2a73842dcbf106fd4406fb760~mv2.png",
        "https://static.wixstatic.com/media/e8c13c_37dce9d810024646919fe82f338ce591~mv2.jpg",
        "https://static.wixstatic.com/media/e8c13c_e2cdc3dea7084003868924dc77b3a5af~mv2.jpg",
    ],
    "ryt-paulista": [
        "https://or.com.br/wp-content/uploads/2025/07/OR_RYT_FACHADA_02_EF_ALTA-1-1-1.jpg",
        "https://or.com.br/wp-content/uploads/2025/02/RYT_FACHADA_ENTRADA.jpg",
        "https://or.com.br/wp-content/uploads/2025/07/RYT_STATUS_OBRA_2026_JULHO_FOTO_1.jpeg",
        "https://or.com.br/wp-content/uploads/2025/07/RYT_STATUS_OBRA_2026_JULHO_FOTO_2.jpeg",
        "https://or.com.br/wp-content/uploads/2025/07/RYT_STATUS_OBRA_2026_JULHO_FOTO_3.jpeg",
    ],
    "wise-vila-clementino": [
        "https://cdn.prod.website-files.com/673f8fa8279c554824e01c07/6740dcf03676134886ec54f1_WVC_HALL_BLOCO_A_EXTERNA_R01.webp",
        "https://cdn.prod.website-files.com/673f8fa8279c554824e01c07/6740dcf09de4fe7f160714f9_WVC_PISCINA_FINAL.webp",
        "https://cdn.prod.website-files.com/673f8fa8279c554824e01c07/6740dcf0380aa8084c9b0807_WVC_AREA_GOURMET_FINAL.webp",
        "https://cdn.prod.website-files.com/673f8fa8279c554824e01c07/6744e285c9b9c4707888a69a_Implanta%C3%A7%C3%A3o.webp",
    ],
    "quintas-cidade-jardim": [
        "https://www.solidi.com.br/wp-content/uploads/2024/06/Captura-de-tela-2024-06-20-100213.png",
        "https://www.solidi.com.br/wp-content/uploads/2024/06/Captura-de-tela-2024-06-20-094729.png",
        "https://www.solidi.com.br/wp-content/uploads/2024/06/pagina-branca.png",
    ],
}

START_INDEX = {
    "torre-principal": 2,
    "torre-dgn-360": 2,
    "torre-verona": 2,
    "ryt-paulista": 8,
    "wise-vila-clementino": 6,
    "quintas-cidade-jardim": 3,
}


def main() -> None:
    manifest: dict[str, list[str]] = {}
    for folder, urls in DOWNLOADS.items():
        print(f"== {folder} ==")
        start = START_INDEX.get(folder, 1)
        new_paths = download_many(folder, urls, start_index=start)
        manifest[folder] = new_paths
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
