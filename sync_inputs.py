import os
import re

files_to_update = [
    'src/app/gold-loan/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/table/page.tsx'
]

def update_file(path):
    if not os.path.exists(path):
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update standard inputs without left padding (px-4 py-3.5 or py-3)
    content = re.sub(
        r'className=([\"\'`])([^\"]*)px-4 py-3(?:\.5)? bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-gray-100 focus:border-\[#A67C00\] focus:ring-0 outline-none transition-all(.*)([\"\'`])',
        r'className=\g<1>\g<2>px-4 py-2 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[#A67C00] outline-none transition-all font-black text-sm md:text-base text-[#0A192F]\g<3>\g<4>',
        content
    )
    
    # 2. Update inputs with left padding for icons (pl-12, pl-8, pl-9)
    # We will preserve their specific left/right padding like pl-9 pr-3
    def replace_padded_input(match):
        prefix = match.group(1)
        padding = match.group(2) # e.g. w-full pl-9 pr-3
        suffix = match.group(3) 
        return f'className="{padding} py-2 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[#A67C00] outline-none transition-all font-black text-sm md:text-base text-[#0A192F] {suffix}"'

    content = re.sub(
        r'className=([\"\'`])(w-full p[lr]-\d+.*?)(?: py-3(?:\.5)?| py-4(?:\.5)?) bg-(?:white|gray-50) border border-gray-200 rounded-(?:xl|2xl) (?:text-base font-bold text-gray-900|font-bold text-sm text-gray-900|font-bold text-lg text-gray-800).*?focus:border-\[#A67C00\].*?transition-all(.*?)[\"\'`]',
        replace_padded_input,
        content
    )
    
    # 3. Fix the active gold loan card container styles: 
    # from: bg-white rounded-2xl shadow-sm border border-gray-100
    # to: bg-white rounded-xl md:rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border-transparent border
    content = re.sub(
        r'bg-white rounded-2xl (?:shadow-sm border border-gray-100|border border-gray-200)',
        r'bg-white rounded-xl md:rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border-transparent border',
        content
    )

    # 4. Fix labels in gold-loan form to match tracking-widest text-gray-500
    content = re.sub(
        r'block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 leading-none',
        r'block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4',
        content
    )
    content = re.sub(
        r'block text-\[11px\] font-black text-gray-500 uppercase tracking-widest mb-1\.5 leading-none',
        r'block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4',
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {path}')

for file in files_to_update:
    update_file(file)
print('Done!')
