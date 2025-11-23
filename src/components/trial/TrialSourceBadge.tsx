import { Badge } from '@/components/ui/badge';
import { Globe, Building2 } from 'lucide-react';

interface TrialSourceBadgeProps {
    importedFrom?: 'clinicaltrials.gov' | 'manual';
    className?: string;
}

export function TrialSourceBadge({ importedFrom, className }: TrialSourceBadgeProps) {
    if (importedFrom === 'clinicaltrials.gov') {
        return (
            <Badge variant="secondary" className={`bg-blue-500 text-white ${className}`}>
                <Globe className="h-3 w-3 mr-1" />
                ClinicalTrials.gov 🇺🇸
            </Badge>
        );
    }

    return (
        <Badge variant="default" className={`bg-green-600 ${className}`}>
            <Building2 className="h-3 w-3 mr-1" />
            CuraLink
        </Badge>
    );
}
