"""PostToolUse: .css 수정 후 @media에 허용 외 breakpoint가 있으면 Claude에게 되돌려 수정시킨다."""
import json
import os
import re
import sys

# max-width는 767/900/1279, min-width는 같은 경계의 768/901/1280
ALLOWED = {'max': {'767', '900', '1279'}, 'min': {'768', '901', '1280'}}

fp = json.load(sys.stdin).get('tool_input', {}).get('file_path', '')
if not fp.endswith('.css') or not os.path.isfile(fp):
    sys.exit(0)

bad = []
with open(fp, encoding='utf-8') as f:
    for no, line in enumerate(f, 1):
        if '@media' in line:
            bad += [f'{no}행 {kind}-width: {v}px'
                    for kind, v in re.findall(r'(max|min)-width:\s*(\d+)px', line)
                    if v not in ALLOWED[kind]]

if bad:
    reason = f'비표준 breakpoint 사용 ({fp}): {", ".join(bad)} — max-width는 767/900/1279px, min-width는 768/901/1280px만 허용'
    print(json.dumps({'decision': 'block', 'reason': reason}, ensure_ascii=False))
