import json
import sys

files = [
    'content/pages/implant.json',
    'content/pages/laminate.json',
    'content/pages/ortho.json',
    'content/pages/equipment.json',
    'content/site/navigation.json'
]

for fpath in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"OK: {fpath}")
    except json.JSONDecodeError as e:
        print(f"ERROR in {fpath}: Line {e.lineno}, Col {e.colno}")
        print(f"  {e.msg}")
        with open(fpath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            if e.lineno <= len(lines):
                print(f"  >> {lines[e.lineno-1][:100]}")
