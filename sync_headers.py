import os
import re

files_to_update = [
    'src/app/page.tsx',
    'src/app/pawn/page.tsx',
    'src/app/gold-loan/page.tsx',
    'src/app/dashboard/page.tsx'
]

def update_file(path):
    if not os.path.exists(path):
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Gold Calculator
    if 'src/app/page.tsx' in path:
        content = re.sub(
            r'<div className="flex items-center justify-between mb-4">\s*<div className="flex flex-col gap-1 md:gap-1\.5 mt-1">',
            r'<div className="flex items-start justify-between mb-4 md:mb-6">\n      <div className="flex flex-col gap-1.5 pt-1">',
            content
        )
        content = re.sub(
            r'<p className="font-poppins text-\[9px\] md:text-\[10px\] font-semibold text-\[#8C6B00\] uppercase tracking-\[0\.2em\]">',
            r'<p className="font-poppins text-[9px] md:text-[10px] font-semibold text-[#8C6B00] uppercase tracking-[0.2em] m-0 leading-none">',
            content
        )

    # 2. Pawn Calculator
    if 'src/app/pawn/page.tsx' in path:
        content = re.sub(
            r'<div className="flex items-center justify-between mb-4">\s*<div className="flex flex-col gap-1 md:gap-1\.5 mt-1">',
            r'<div className="flex items-start justify-between mb-4 md:mb-6">\n                    <div className="flex flex-col gap-1.5 pt-1">',
            content
        )
        content = re.sub(
            r'<p className="font-poppins text-\[9px\] md:text-\[10px\] font-semibold text-\[#8C6B00\] uppercase tracking-\[0\.2em\] mt-0">',
            r'<p className="font-poppins text-[9px] md:text-[10px] font-semibold text-[#8C6B00] uppercase tracking-[0.2em] m-0 leading-none">',
            content
        )
        # remove the empty spacer h-4 we added
        content = content.replace('<div className="h-4"></div>', '')

    # 3. Gold Loan
    if 'src/app/gold-loan/page.tsx' in path:
        content = re.sub(
            r'<div className="mb-4 md:mb-6">\s*<h1 className="font-cinzel',
            r'<div className="flex items-start justify-between mb-4 md:mb-6">\n                    <div className="flex flex-col gap-1.5 pt-1">\n                        <h1 className="font-cinzel',
            content
        )
        content = re.sub(
            r'<p className="font-poppins text-\[9px\] md:text-\[10px\] font-semibold text-\[#8C6B00\] uppercase tracking-\[0\.2em\] mt-1">\s*\{t\(\'manageLoansRecords\'\)\}\s*</p>\s*</div>',
            r'<p className="font-poppins text-[9px] md:text-[10px] font-semibold text-[#8C6B00] uppercase tracking-[0.2em] m-0 leading-none">\n                        {t(\'manageLoansRecords\')}\n                    </p>\n                    </div>\n                </div>',
            content
        )

    # 4. Dashboard
    if 'src/app/dashboard/page.tsx' in path:
        content = re.sub(
            r'<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">\s*<div>\s*<h1 className="font-cinzel',
            r'<div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 md:mb-6">\n                    <div className="flex flex-col gap-1.5 pt-1">\n                        <h1 className="font-cinzel',
            content
        )
        content = re.sub(
            r'<p className="font-poppins text-\[9px\] md:text-\[10px\] font-semibold text-\[#8C6B00\] uppercase tracking-\[0\.2em\] mt-1">\s*\{t\(\'businessOverview\'\)\}\s*</p>\s*</div>',
            r'<p className="font-poppins text-[9px] md:text-[10px] font-semibold text-[#8C6B00] uppercase tracking-[0.2em] m-0 leading-none">\n                            {t(\'businessOverview\')}\n                        </p>\n                    </div>',
            content
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {path}')

for file in files_to_update:
    update_file(file)
print('Done!')
