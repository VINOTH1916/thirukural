import os

DOWNLOADS = '/home/vinothkumar/Downloads'
OUT_DIR   = '/home/vinothkumar/Downloads/thirukural/thirukural-app/public/audio'
os.makedirs(OUT_DIR, exist_ok=True)

files = []
for n in range(125, 131):
    path = os.path.join(DOWNLOADS, f'Uyar_Valluvam_S{n}.mp3')
    if os.path.exists(path):
        size = os.path.getsize(path)
        files.append((n, path, size))

out_path = os.path.join(OUT_DIR, 'athigaram_048.mp3')
with open(out_path, 'wb') as out:
    for n, path, size in sorted(files):
        with open(path, 'rb') as f:
            out.write(f.read())
        print(f'merged S{n} ({size:,} bytes)')

final = os.path.getsize(out_path)
print(f'output: {out_path}')
print(f'total: {final:,} bytes  ({final/1024/1024:.2f} MB)')
print(f'files: {len(files)}')
