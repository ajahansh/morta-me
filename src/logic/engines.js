export const Engines = {
    BE: {
        name: "Belgium",
        code: "BE",
        locale: "de-BE",
        flag: "https://flagcdn.com/w80/be.png",
        currency: "€",
        calculateMonthlyRate: (annualRate) => annualRate > 0 ? Math.pow(1 + annualRate / 100, 1 / 12) - 1 : 0,
        maxLTV: 0.90,
        labels: {
            misc: "Aktekosten",
            tax: "BTW (VAT)",
            regTitle: "Registration Tax"
        },
        regulations: [
            { label: "Loan-to-Value", value: "Capped at 90% for standard buyers (10% deposit required)." },
            { label: "Registration Tax", value: "3% for first-time buyers in Flanders; 12.5% in Brussels/Wallonia (with abatements)." },
        ],
        defaultTaxes: [
            { id: 'be_fl_first', label: 'Flanders (First Home) - 2%', rate: 0.02 },
            { id: 'be_fl_std', label: 'Flanders (Standard) - 12%', rate: 0.12 },
            { id: 'be_bru', label: 'Brussels (Abattement) - 12.5%', rate: 0.125 },
            { id: 'be_custom', label: 'Custom %', rate: null }
        ]
    },
    NL: {
        name: "Netherlands",
        code: "NL",
        locale: "nl-NL",
        flag: "https://flagcdn.com/w80/nl.png",
        currency: "€",
        calculateMonthlyRate: (annualRate) => annualRate > 0 ? (annualRate / 100) / 12 : 0,
        maxLTV: 1.00,
        labels: {
            misc: "Kadaster / Notar",
            tax: "Overdrachtsbelasting",
            regTitle: "Transfer Tax"
        },
        regulations: [
            { label: "Loan-to-Value", value: "Up to 100% of the property value allowed." },
            { label: "Tax Credit", value: "Hypotheekrenteaftrek allows interest deduction from taxable income." },
            { label: "NHG Guarantee", value: "Possible for homes under the price limit, reducing interest rates." }
        ],
        defaultTaxes: [
            { id: 'nl_std', label: 'Standard - 2%', rate: 0.02 },
            { id: 'nl_starter', label: 'Starter (Exempt) - 0%', rate: 0.00 },
            { id: 'nl_invest', label: 'Investor - 10.4%', rate: 0.104 },
            { id: 'nl_custom', label: 'Custom %', rate: null }
        ]
    },
    FR: {
        name: "France",
        code: "FR",
        locale: "fr-FR",
        flag: "https://flagcdn.com/w80/fr.png",
        currency: "€",
        calculateMonthlyRate: (annualRate) => annualRate > 0 ? (annualRate / 100) / 12 : 0,
        maxLTV: 1.00,
        labels: {
            misc: "Frais de dossier",
            tax: "TVA",
            regTitle: "Droits d'enregistrement"
        },
        regulations: [
            { label: "Debt Ratio", value: "Strict limit of 35% of household net income." },
            { label: "LTV", value: "Up to 100% possible for 'Prêt à Taux Zéro' (PTZ) eligible homes." },
            { label: "Insurance", value: "Borrower insurance (Assurance Emprunteur) is mandatory and strictly regulated." }
        ],
        defaultTaxes: [
            { id: 'fr_old', label: 'Ancien - 8%', rate: 0.08 },
            { id: 'fr_new', label: 'Neuf - 2%', rate: 0.02 },
            { id: 'fr_custom', label: 'Custom %', rate: null }
        ]
    }
}
