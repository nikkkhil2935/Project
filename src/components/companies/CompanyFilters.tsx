import { FilterState } from "@/lib/store/useSavedSearchStore";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CompanyFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    availableSectors: string[];
    availableStages: string[];
    availableGeographies: string[];
}

export function CompanyFilters({ filters, onChange, availableSectors, availableStages, availableGeographies }: CompanyFiltersProps) {

    const toggleArrayItem = (array: string[], item: string) => {
        if (array.includes(item)) {
            return array.filter(i => i !== item);
        }
        return [...array, item];
    };

    return (
        <div className="space-y-6">

            <div className="space-y-3">
                <Label>Sector</Label>
                <div className="flex flex-col gap-2">
                    {availableSectors.map(sector => (
                        <div key={sector} className="flex items-center space-x-2">
                            <Checkbox
                                id={`sector-${sector}`}
                                checked={filters.sectors.includes(sector)}
                                onCheckedChange={() => onChange({ ...filters, sectors: toggleArrayItem(filters.sectors, sector) })}
                            />
                            <label htmlFor={`sector-${sector}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {sector}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Stage</Label>
                <div className="flex flex-col gap-2">
                    {availableStages.map(stage => (
                        <div key={stage} className="flex items-center space-x-2">
                            <Checkbox
                                id={`stage-${stage}`}
                                checked={filters.stages.includes(stage)}
                                onCheckedChange={() => onChange({ ...filters, stages: toggleArrayItem(filters.stages, stage) })}
                            />
                            <label htmlFor={`stage-${stage}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {stage}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Geography</Label>
                <div className="flex flex-col gap-2">
                    {availableGeographies.map(geo => (
                        <div key={geo} className="flex items-center space-x-2">
                            <Checkbox
                                id={`geo-${geo}`}
                                checked={filters.geographies.includes(geo)}
                                onCheckedChange={() => onChange({ ...filters, geographies: toggleArrayItem(filters.geographies, geo) })}
                            />
                            <label htmlFor={`geo-${geo}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {geo}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="hiring"
                        checked={filters.hiringOnly}
                        onCheckedChange={(checked) => onChange({ ...filters, hiringOnly: checked === true })}
                    />
                    <Label htmlFor="hiring">Actively Hiring Only</Label>
                </div>
            </div>

        </div>
    );
}
