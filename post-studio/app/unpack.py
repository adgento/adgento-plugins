#!/usr/bin/env python3
"""Unpack Post Studio's app files. The bundle in this folder is locked; the key comes from adgento.app
(resource unlock.json) at install time, so the public plugin holds no readable copy of the app.
Usage: python3 unpack.py --key <hex> --sha256 <hex> --out <folder>
Writes post-studio.html, capabilities.json and pack.py into <folder>. Standard library only."""
import argparse, hashlib, io, pathlib, sys, zipfile

def stream(key: bytes, n: int) -> bytes:
    out, i = bytearray(), 0
    while len(out) < n:
        out += hashlib.sha256(key + i.to_bytes(8, "big")).digest(); i += 1
    return bytes(out[:n])

def main():
    a = argparse.ArgumentParser(); a.add_argument("--key", required=True); a.add_argument("--sha256", required=True); a.add_argument("--out", required=True)
    o = a.parse_args()
    blob = (pathlib.Path(__file__).parent / "post-studio.bundle").read_bytes()
    try: key = bytes.fromhex(o.key.strip())
    except ValueError: sys.exit("bad key: copy it again from unlock.json")
    data = bytes(x ^ y for x, y in zip(blob, stream(key, len(blob))))
    if hashlib.sha256(data).hexdigest() != o.sha256.strip().lower():
        sys.exit("key or bundle mismatch: fetch unlock.json again; if it still fails, update the plugin")
    out = pathlib.Path(o.out); out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for n in z.namelist():
            if "/" in n or n.startswith("."): continue
            (out / n).write_bytes(z.read(n)); print(out / n)

if __name__ == "__main__":
    main()
