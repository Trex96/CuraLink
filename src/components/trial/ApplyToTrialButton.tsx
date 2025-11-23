'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Trial {
    _id: string;
    nctNumber: string;
    title: string;
    importedFrom?: 'clinicaltrials.gov' | 'manual';
}

interface ApplyToTrialButtonProps {
    trial: Trial;
}

export function ApplyToTrialButton({ trial }: ApplyToTrialButtonProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        message: '',
        age: '',
        gender: '',
        medicalHistory: ''
    });

    // If trial is from ClinicalTrials.gov, show external link
    if (trial.importedFrom === 'clinicaltrials.gov') {
        return (
            <Button variant="outline" asChild>
                <a
                    href={`https://clinicaltrials.gov/study/${trial.nctNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on ClinicalTrials.gov
                </a>
            </Button>
        );
    }

    // If not logged in or not a patient, show disabled button
    if (!user || user.role !== 'patient') {
        return (
            <Button disabled>
                {!user ? 'Login to Apply' : 'Patients Only'}
            </Button>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/trials/applications/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trialId: trial._id,
                    message: formData.message,
                    patientInfo: {
                        age: formData.age ? parseInt(formData.age) : undefined,
                        gender: formData.gender || undefined,
                        medicalHistory: formData.medicalHistory || undefined
                    }
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit application');
            }

            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
                setFormData({ message: '', age: '', gender: '', medicalHistory: '' });
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} size="lg">
                Apply to Trial
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Apply to Clinical Trial</DialogTitle>
                        <DialogDescription>
                            {trial.title}
                        </DialogDescription>
                    </DialogHeader>

                    {success ? (
                        <div className="py-8 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
                            <p className="text-muted-foreground">
                                The researcher will review your application and contact you soon.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="message">Why would you like to participate? *</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell the researcher about your interest and relevant background..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age (optional)</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        placeholder="35"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender (optional)</Label>
                                    <Input
                                        id="gender"
                                        placeholder="Male/Female/Other"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="medicalHistory">Relevant Medical History (optional)</Label>
                                <Textarea
                                    id="medicalHistory"
                                    placeholder="Any relevant medical conditions or history..."
                                    value={formData.medicalHistory}
                                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading || !formData.message}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Application
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
