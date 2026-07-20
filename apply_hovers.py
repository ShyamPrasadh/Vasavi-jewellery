import os
import re

files_to_update = [
    'src/app/page.tsx',
    'src/app/pawn/page.tsx',
    'src/app/components/CustomDatePicker.tsx'
]

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pass 1: Add 'group' to relative wrappers of inputs (excluding those that already have it)
    content = re.sub(
        r'<div\s+className=([\"\'`])relative([\"\'`])>',
        r'<div className=\g<1>relative group\g<2>>',
        content
    )
    
    content = re.sub(
        r'<div\s+className=([\"\'`])relative flex items-center([\"\'`])>',
        r'<div className=\g<1>relative flex items-center group\g<2>>',
        content
    )

    content = re.sub(
        r'<div\s+className=([\"\'`])relative h-\[40px\] flex items-center([\"\'`])>',
        r'<div className=\g<1>relative h-[40px] flex items-center group\g<2>>',
        content
    )
    
    content = re.sub(
        r'<div\s+className=([\"\'`])relative w-full overflow-visible([\"\'`])>',
        r'<div className=\g<1>relative w-full overflow-visible group\g<2>>',
        content
    )

    # Pass 2: Inject group-hover:text-[#A67C00] into the icon spans/lucide icons
    content = re.sub(
        r'text-gray-400([\s\"\'`])(?!group-hover)',
        r'text-gray-400 group-hover:text-[#A67C00] group-focus-within:text-[#A67C00] transition-colors\g<1>',
        content
    )
    
    content = re.sub(
        r'text-gray-500([\s\"\'`])(?!group-hover)',
        r'text-gray-500 group-hover:text-[#A67C00] group-focus-within:text-[#A67C00] transition-colors\g<1>',
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {path}')

for file in files_to_update:
    if os.path.exists(file):
        update_file(file)
print('Done!')
