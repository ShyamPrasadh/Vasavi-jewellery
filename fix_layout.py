import re

with open('src/app/pawn/page.tsx', 'r') as f:
    content = f.read()

# 1. Update grid for Left Column top inputs
content = content.replace(
    '                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">',
    '                                <div className="flex flex-col gap-6">'
)

# 2. Extract Extra Cash section
start_marker = "                {/* Extra Cash Section */}"
end_marker = "                </div >\n\n                <p className=\"mt-12"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

extra_cash_old = content[start_idx:end_idx + len("                </div >")]

# Generate the new extra cash section that uses flex-col
new_extra_cash = """                                {/* Extra Cash Section Moved Here */}
                                <div className="mt-4 border-t border-gray-100 pt-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-[#A67C00]/10 flex items-center justify-center text-[#A67C00] shrink-0 font-black text-lg">
                                            ₹
                                        </div>
                                        <div>
                                            <h3 className="text-base text-gray-800 uppercase font-heading">{t('additionalLoans')}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('addEntry')}</p>
                                        </div>
                                        <button
                                            onClick={addExtraCash}
                                            className="ml-auto flex items-center justify-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl hover:bg-black active:scale-[0.98] transition-all duration-200 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <Plus size={14} />
                                            <span className="hidden sm:inline">{t('addEntry')}</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {extraCash.map((cash) => (
                                            <div key={cash.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                <div className="flex flex-col gap-5">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-2">
                                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('loanAmount')}</label>
                                                            <div className="relative flex items-center group/icon">
                                                                <span className="absolute left-0 text-sm font-bold text-gray-400 transition-colors group-hover/icon:text-[#8B2332] group-focus-within/icon:text-[#8B2332]">₹</span>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={cash.amount}
                                                                    onFocus={() => { if (cash.amount === '0') updateExtraCash(cash.id, 'amount', ''); }}
                                                                    onBlur={() => { if (cash.amount === '') updateExtraCash(cash.id, 'amount', '0'); }}
                                                                    onChange={(e) => updateExtraCash(cash.id, 'amount', e.target.value.replace(/\D/g, ''))}
                                                                    className="w-full pl-5 py-1.5 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[#8B2332] outline-none transition-all duration-200 font-bold text-lg text-gray-800 leading-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('loanDate')}</label>
                                                            <div className="relative w-full">
                                                                <CustomDatePicker
                                                                    variant="underline"
                                                                    selected={cash.date ? new Date(parseInt(cash.date.split('-')[0]), parseInt(cash.date.split('-')[1]) - 1, parseInt(cash.date.split('-')[2])) : null}
                                                                    onChange={(date) => {
                                                                        if (date) {
                                                                            const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                                                                            updateExtraCash(cash.id, 'date', dateString);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                                {t('durationMonths', { months: calculations.extraBreakdown.find(b => b.id === cash.id)?.months.toFixed(2) || '0.00' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('interest')}:</span>
                                                                <span className="text-sm font-black text-[#8B2332]">
                                                                    ₹{Math.round(calculations.extraBreakdown.find(b => b.id === cash.id)?.interest || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeExtraCash(cash.id)}
                                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>"""

# Remove old Extra Cash section
if extra_cash_old in content:
    content = content.replace(extra_cash_old, "")
else:
    print("Could not find Extra Cash section old")

# Insert new Extra Cash section at the end of Left Column
target_insert = """                                </div>
                            </div>

                            {/* Right Column — Summary & Results (The longer card) */}"""

replacement_insert = f"""                                </div>
{new_extra_cash}
                            </div>

                            {{/* Right Column — Summary & Results (The longer card) */}}"""

if target_insert in content:
    content = content.replace(target_insert, replacement_insert)
else:
    print("Could not find left column end")

with open('src/app/pawn/page.tsx', 'w') as f:
    f.write(content)

