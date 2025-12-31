export type ProductType = 'Ring' | 'Earring' | 'Chain' | 'Haram' | 'Necklace' | 'Coin';

export interface TierData {
    weight: number;
    "Ring/Earring"?: { waste: number; lab: number };
    "Chain"?: { waste: number; lab: number };
    "Haram/Necklace"?: { waste: number; lab: number };
    "Coin"?: { lab: number };
}

export const RATE_DATA: TierData[] = [
    {
        weight: 0.5,
        "Coin": { lab: 50 },
    },
    {
        weight: 1,
        "Ring/Earring": { waste: 0.2, lab: 100 },
        "Coin": { lab: 100 },
    },
    {
        weight: 2,
        "Ring/Earring": { waste: 0.45, lab: 250 },
    },
    {
        weight: 4,
        "Ring/Earring": { waste: 0.8, lab: 250 },
        "Chain": { waste: 0.5, lab: 250 },
    },
    {
        weight: 6,
        "Ring/Earring": { waste: 1.2, lab: 350 },
        "Chain": { waste: 0.7, lab: 400 },
    },
    {
        weight: 8,
        "Ring/Earring": { waste: 1.25, lab: 500 },
        "Chain": { waste: 1, lab: 500 },
        "Haram/Necklace": { waste: 1.125, lab: 500 },
        "Coin": { lab: 800 }
    },
    {
        weight: 16,
        "Haram/Necklace": { waste: 2.15, lab: 750 },
        "Coin": { lab: 1600 }
    },
    {
        weight: 24,
        "Haram/Necklace": { waste: 3.375, lab: 1000 },
        "Coin": { lab: 2400 }
    },
    {
        weight: 32,
        "Haram/Necklace": { waste: 5.125, lab: 1500 },
        "Coin": { lab: 3200 }
    },
    {
        weight: 40,
        "Haram/Necklace": { waste: 6.5, lab: 2000 },
        "Coin": { lab: 4000 }
    },
];

export const getTierData = (weight: number, product: ProductType) => {
    if (product === 'Coin') {
        // For coins, Labour = weight * 100 based on the provided logic
        return { waste: 0, lab: weight * 100 };
    }

    // Find closest lower tier
    const tiers = [...RATE_DATA].sort((a, b) => b.weight - a.weight);
    const tier = tiers.find(t => t.weight <= weight) || RATE_DATA[0];

    let category: "Ring/Earring" | "Chain" | "Haram/Necklace" | "Coin" = "Ring/Earring";
    if (product === 'Ring' || product === 'Earring') category = "Ring/Earring";
    else if (product === 'Chain') category = "Chain";
    else if (product === 'Haram' || product === 'Necklace') category = "Haram/Necklace";
    else if (product === 'Coin') category = "Coin";

    return tier[category];
};
