'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface Trial {
    _id: string;
    nctNumber: string;
    title: string;
    status: string;
    phase: string;
    conditions: string[];
    lastUpdated: string;
    locations: Array<{ address?: string }>;
    enrollment?: number;
    summary?: string;
}

interface TrialDetailsEditorProps {
    trial: Trial | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaveSuccess: () => void;
}

export function TrialDetailsEditor({ trial, open, onOpenChange, onSaveSuccess }: TrialDetailsEditorProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!trial) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const updates = {
            status: formData.get('status'),
            phase: formData.get('phase'),
            enrollment: formData.get('enrollment') ? parseInt(formData.get('enrollment') as string) : undefined,
            summary: formData.get('summary'),
        };

        try {
            const response = await fetch(`/api/trials/${trial.nctNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                toast.success('Trial updated', {
                    description: 'Changes have been saved successfully.'
                });
                onSaveSuccess();
                onOpenChange(false);
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Update failed', {
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!trial) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Trial Details: {trial.nctNumber}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={trial.title} disabled className="bg-muted" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={trial.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Recruiting">Recruiting</SelectItem>
                                    <SelectItem value="Not yet recruiting">Not yet recruiting</SelectItem>
                                    <SelectItem value="Active, not recruiting">Active, not recruiting</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Terminated">Terminated</SelectItem>
                                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phase">Phase</Label>
                            <Select name="phase" defaultValue={trial.phase}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select phase" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Early Phase 1">Early Phase 1</SelectItem>
                                    <SelectItem value="Phase 1">Phase 1</SelectItem>
                                    <SelectItem value="Phase 2">Phase 2</SelectItem>
                                    <SelectItem value="Phase 3">Phase 3</SelectItem>
                                    <SelectItem value="Phase 4">Phase 4</SelectItem>
                                    <SelectItem value="N/A">N/A</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="enrollment">Target Enrollment</Label>
                        <Input
                            id="enrollment"
                            name="enrollment"
                            type="number"
                            defaultValue={trial.enrollment}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="summary">Brief Summary</Label>
                        <Textarea
                            id="summary"
                            name="summary"
                            defaultValue={trial.summary}
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
