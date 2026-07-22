export type ProductType = 'Ring' | 'Earring' | 'Chain' | 'Haram' | 'Necklace' | 'Coin';

export type RateCategory = 'Ring/Earring' | 'Chain' | 'Haram/Necklace' | 'Coin';

export interface WasteLab {
    waste: number;
    lab: number;
}

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
        "Haram/Necklace": { waste: 0.565, lab: 300 },
    },
    {
        weight: 6,
        "Ring/Earring": { waste: 1.2, lab: 350 },
        "Chain": { waste: 0.7, lab: 400 },
        "Haram/Necklace": { waste: 0.845, lab: 400 },
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
        "Chain": { waste: 2, lab: 750 },
        "Haram/Necklace": { waste: 2.15, lab: 750 },
        "Coin": { lab: 1600 }
    },
    {
        weight: 24,
        "Chain": { waste: 3, lab: 1000 },
        "Haram/Necklace": { waste: 3.375, lab: 1000 },
        "Coin": { lab: 2400 }
    },
    {
        weight: 32,
        "Chain": { waste: 4, lab: 1500 },
        "Haram/Necklace": { waste: 5.125, lab: 1500 },
        "Coin": { lab: 3200 }
    },
    {
        weight: 40,
        "Chain": { waste: 5, lab: 2000 },
        "Haram/Necklace": { waste: 6.5, lab: 2000 },
        "Coin": { lab: 4000 }
    },
];

function getCategory(product: ProductType): RateCategory {
    if (product === 'Ring' || product === 'Earring') return 'Ring/Earring';
    if (product === 'Chain') return 'Chain';
    if (product === 'Haram' || product === 'Necklace') return 'Haram/Necklace';
    return 'Coin';
}

function scaleFromEdge(weight: number, edgeWeight: number, edge: WasteLab): WasteLab {
    if (edgeWeight <= 0) return { waste: 0, lab: 0 };
    const ratio = weight / edgeWeight;
    return {
        waste: edge.waste * ratio,
        lab: edge.lab * ratio,
    };
}

/** Resolve wastage grams + labour for a product weight from the reference table. */
export const getTierData = (weight: number, product: ProductType): WasteLab => {
    if (!Number.isFinite(weight) || weight <= 0) {
        return { waste: 0, lab: 0 };
    }

    if (product === 'Coin') {
        return { waste: 0, lab: weight * 100 };
    }

    const category = getCategory(product);
    const tiers = RATE_DATA
        .filter((row) => row[category] != null)
        .map((row) => {
            const entry = row[category] as { waste?: number; lab: number };
            return {
                weight: row.weight,
                waste: entry.waste ?? 0,
                lab: entry.lab,
            };
        })
        .sort((a, b) => a.weight - b.weight);

    if (tiers.length === 0) {
        return { waste: 0, lab: 0 };
    }

    const exact = tiers.find((t) => t.weight === weight);
    if (exact) {
        return { waste: exact.waste, lab: exact.lab };
    }

    if (weight < tiers[0].weight) {
        return scaleFromEdge(weight, tiers[0].weight, tiers[0]);
    }

    if (weight > tiers[tiers.length - 1].weight) {
        const last = tiers[tiers.length - 1];
        return scaleFromEdge(weight, last.weight, last);
    }

    let low = tiers[0];
    let high = tiers[tiers.length - 1];
    for (let i = 0; i < tiers.length - 1; i++) {
        if (tiers[i].weight < weight && weight < tiers[i + 1].weight) {
            low = tiers[i];
            high = tiers[i + 1];
            break;
        }
    }

    const span = high.weight - low.weight;
    const t = span === 0 ? 0 : (weight - low.weight) / span;
    return {
        waste: low.waste + t * (high.waste - low.waste),
        lab: low.lab + t * (high.lab - low.lab),
    };
};
