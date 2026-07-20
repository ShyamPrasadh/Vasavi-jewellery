import re

with open('src/app/pawn/page.tsx', 'r') as f:
    content = f.read()

# Replace the specific labels in the user's list
labels_to_update = [
    "{t('loanAmount')}",
    "{t('monthlyInterestRate')}",
    "{t('loanDate')}",
    "{t('totalPayable')}",
    "{t('totalPrincipal')}",
    "{t('totalInterest')}"
]

for label in labels_to_update:
    # Pattern to find the HTML element wrapping these specific t() calls
    # Usually looks like <label className="... text-gray-400 ..."> or <span className="... text-gray-400 ...">
    # We want to change the text-gray-400 to text-gray-800 and trackings to tracking-[0.2em]
    pattern = r'<(label|span) className="([^"]*text-gray-400[^"]*)"([^>]*)>(' + re.escape(label) + r')</\1>'
    
    def replacer(match):
        tag = match.group(1)
        classes = match.group(2)
        rest = match.group(3)
        inner = match.group(4)
        
        # Replace color and tracking
        classes = classes.replace('text-gray-400', 'text-gray-800')
        classes = classes.replace('tracking-widest', 'tracking-[0.2em]')
        
        return f'<{tag} className="{classes}"{rest}>{inner}</{tag}>'
    
    content = re.sub(pattern, replacer, content)

with open('src/app/pawn/page.tsx', 'w') as f:
    f.write(content)

