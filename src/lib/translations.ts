export type Language = 'en' | 'ta';

export const translations = {
    en: {
        // Nav
        goldCalculator: 'GOLD CALCULATOR',
        pawnInterest: 'PAWN INTEREST',

        // Gold Calculator Page
        productName: 'Product Name',
        weightGrams: 'Weight (Grams)',
        goldRate22: 'Gold Rate (22KT)',
        detailedBreakup: 'Detailed Breakup',
        goldValue: 'Gold Value',
        wastageCost: 'Wastage Cost',
        labourCharge: 'Labour Charge',
        totalAmount: 'Total Amount',
        valueAddition: 'Value Addition (VA)',
        wasteMg: 'Waste (mg)',
        overallVaPercent: 'Overall VA %',
        totalVaAmount: 'Total VA Amount',
        viewReferenceTable: 'View Reference Rate Table',

        // Pawn Page
        loanAmount: 'Loan Amount',
        loanDate: 'Loan Date',
        monthlyInterestRate: 'Monthly Interest Rate',
        additionalLoans: 'Additional Loans',
        addEntry: 'Add Entry',
        principalEntries: 'Principal Entries',
        loanSummarySettlement: 'Loan Summary & Settlement',
        rateMonth: 'Rate: {rate}% / month',
        principal: 'PRINCIPAL',
        rate: 'RATE',
        duration: 'DURATION',
        interest: 'INTEREST',
        finalSettlement: 'Final Settlement',
        totalPrincipal: 'Total Principal',
        totalInterest: 'Total Interest',
        totalPayable: 'Total Payable',
        printBill: 'Print Bill',
        viewPrintBill: 'View & Print Bill',
        entryInterest: 'Entry Interest',
        durationMonths: '{months}m duration',
        noExtraEntries: 'No extra cash entries added yet',

        // Pawn Shop Mode
        shopMode: 'Shop Mode',
        calculatorMode: 'Calculator Mode',
        customerDetails: 'Customer Details',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        aadhaarNumber: 'Aadhaar Number',
        address: 'Address',
        assetDetails: 'Asset Details',
        productType: 'Product Type',
        returnDate: 'Potential Return Date',
        returnDateLabel: 'Return Date',
        pawnShopTitle: 'Pawn Shop Management',
        submitPawn: 'Record Pawn Entry',

        // Table Page
        referenceRateTable: 'Reference Rate Table',
        standardWastageLabour: 'Standard Wastage & Labour Standards',
        backToCalculator: 'Back to Calculator',
        weight: 'Weight',
        coinLab: 'Coin (Lab)',
        ringEarringWL: 'Ring/Earring (W/L)',
        chainWL: 'Chain (W/L)',
        haramNecklaceWL: 'Haram/Necklace (W/L)',
        fixedLab: 'Fixed Lab',
        policyNote: 'Policy Note',
        policyNoteDescription: 'For weights not explicitly listed above, the system automatically uses the parameters from the closest lower weight tier to ensure fair valuation. All calculations are real-time and based on market rates.',
        launchCalculator: 'Launch Calculator',

        // Common
        sriVasaviJewellery: 'Sri Vasavi Jewellery',
        syncing: 'Syncing...'
    },
    ta: {
        // Nav
        goldCalculator: 'தங்கக் கணக்கீடு',
        pawnInterest: 'அடமான வட்டி',

        // Gold Calculator Page
        productName: 'பொருள் பெயர்',
        weightGrams: 'எடை (கிராம்)',
        goldRate22: 'தங்க விலை (22KT)',
        detailedBreakup: 'விரிவான கணக்கு',
        goldValue: 'தங்கத்தின் மதிப்பு',
        wastageCost: 'சேதாரம்',
        labourCharge: 'கூலி',
        totalAmount: 'மொத்த தொகை',
        valueAddition: 'கூடுதல் மதிப்பு (VA)',
        wasteMg: 'சேதாரம் (mg)',
        overallVaPercent: 'மொத்த VA %',
        totalVaAmount: 'மொத்த VA தொகை',
        viewReferenceTable: 'விலை அட்டவணையை பார்க்க',

        // Pawn Page
        loanAmount: 'கடன் தொகை',
        loanDate: 'கடன் தேதி',
        monthlyInterestRate: 'மாத வட்டி விகிதம்',
        additionalLoans: 'கூடுதல் கடன்கள்',
        addEntry: 'சேர்க்கவும்',
        principalEntries: 'கடன் பதிவுகள்',
        loanSummarySettlement: 'கடன் சுருக்கம் மற்றும் தீர்வு',
        rateMonth: 'விகிதம்: {rate}% / மாதம்',
        principal: 'அசல்',
        rate: 'விகிதம்',
        duration: 'காலம்',
        interest: 'வட்டி',
        finalSettlement: 'இறுதி தீர்வு',
        totalPrincipal: 'மொத்த அசல்',
        totalInterest: 'மொத்த வட்டி',
        totalPayable: 'மொத்த தொகை',
        printBill: 'பில் பிரிண்ட்',
        viewPrintBill: 'பில் பார்க்க & பிரிண்ட்',
        entryInterest: 'பதிவு வட்டி',
        durationMonths: '{months}மீ காலம்',
        noExtraEntries: 'கூடுதல் பதிவுகள் எதுவும் இல்லை',

        // Pawn Shop Mode
        shopMode: 'கடை முறை',
        calculatorMode: 'கணக்கீட்டு முறை',
        customerDetails: 'வாடிக்கையாளர் விவரங்கள்',
        fullName: 'முழு பெயர்',
        phoneNumber: 'தொலைபேசி எண்',
        aadhaarNumber: 'ஆதார் எண்',
        address: 'முகவரி',
        assetDetails: 'பொருள் விவரங்கள்',
        productType: 'பொருள் வகை',
        returnDate: 'திரும்பப் பெறும் தேதி',
        returnDateLabel: 'திரும்பும் தேதி',
        pawnShopTitle: 'அடமான கடை மேலாண்மை',
        submitPawn: 'பதிவு செய்க',

        // Table Page
        referenceRateTable: 'விலை அட்டவணை',
        standardWastageLabour: 'தரமான சேதாரம் மற்றும் கூலி தரநிலைகள்',
        backToCalculator: 'கணக்கீட்டிற்கு திரும்பு',
        weight: 'எடை',
        coinLab: 'நாணயம் (கூலி)',
        ringEarringWL: 'மோதிரம்/கம்மல் (W/L)',
        chainWL: 'செயின் (W/L)',
        haramNecklaceWL: 'ஹாரம்/நெக்லஸ் (W/L)',
        fixedLab: 'நிலையான கூலி',
        policyNote: 'கொள்கை குறிப்பு',
        policyNoteDescription: 'மேலே தெளிவாக பட்டியலிடப்படாத எடைகளுக்கு, நியாயமான மதிப்பீட்டை உறுதி செய்ய கணினி தானாகவே அடுத்த கீழ்நிலை எடை அடுக்கிலிருந்து அளவுருக்களைப் பயன்படுத்துகிறது. அனைத்து கணக்கீடுகளும் நேரலை நேரத்தின் அடிப்படையிலானவை.',
        launchCalculator: 'கணக்கீட்டைத் தொடங்கு',

        // Common
        sriVasaviJewellery: 'ஸ்ரீ வாசவி ஜுவல்லரி',
        syncing: 'இணைக்கப்படுகிறது...'
    }
};
