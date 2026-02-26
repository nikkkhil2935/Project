import { Company } from "./types";
import { ThesisState } from "./store/useThesisStore";

export function calculateScore(company: Company, thesis: ThesisState): number {
    let score = 0;

    // 1. Sector Match
    if (thesis.preferredSectors.includes(company.sector)) {
        score += thesis.weights.sectorMatch;
    } else if (thesis.excludedSectors.includes(company.sector)) {
        return 0; // Immediate veto
    }

    // 2. Stage Match
    if (thesis.preferredStages.includes(company.stage)) {
        score += thesis.weights.stageMatch;
    }

    // 3. Geography Match
    if (thesis.preferredGeographies.includes(company.geography) || thesis.preferredGeographies.includes("Remote")) {
        score += thesis.weights.geographyMatch;
    }

    // 4. Hiring Detected
    const hasHiring = company.derivedSignals.some(s => s.type === "hiring");
    if (hasHiring) {
        score += thesis.weights.hiringDetected;
    }

    // 5. Keyword Overlap
    const matchingKeywords = company.tags.filter(tag =>
        thesis.keywords.some((k: string) => k.toLowerCase() === tag.toLowerCase() || tag.toLowerCase().includes(k.toLowerCase()))
    );
    if (matchingKeywords.length > 0) {
        // Add proportional score up to max
        const ratio = Math.min(matchingKeywords.length / 3, 1);
        score += Math.round(ratio * thesis.weights.keywordOverlap);
    }

    // 6. Signals Present (docs, changelog, press)
    const hasStrongSignals = company.derivedSignals.some(s =>
        ['docs', 'changelog', 'press', 'blog'].includes(s.type)
    );
    if (hasStrongSignals) {
        score += thesis.weights.signalsPresent;
    }

    // Check if strong thesis language match is present in description or enriched summary
    let textToAnalyze = company.description.toLowerCase();
    if (company.enrichedSummary) textToAnalyze += " " + company.enrichedSummary.toLowerCase();

    let languageMatchBonus = 0;
    for (const keyword of thesis.keywords) {
        if (textToAnalyze.includes(keyword.toLowerCase())) {
            languageMatchBonus += 5;
        }
    }
    // Cap the language bonus at 20
    score += Math.min(languageMatchBonus, 20);

    return Math.min(Math.round(score), 100);
}
