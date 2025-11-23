'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function CreateTrialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nctNumber: '',
        title: '',
        summary: '',
        detailedDescription: '',
        status: 'Not yet recruiting',
        phase: 'N/A',
        studyType: 'Interventional',
        enrollment: '',
        startDate: '',
        endDate: '',
        conditions: '',
        interventions: '',
        eligibilityCriteria: '',
        contactInfo: '',
        location: '',
        sponsors: '',
        researcherRole: 'PI'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Parse comma-separated values into arrays
            const trialData = {
                ...formData,
                enrollment: formData.enrollment ? parseInt(formData.enrollment) : undefined,
                conditions: formData.conditions.split(',').map(c => c.trim()).filter(Boolean),
                interventions: formData.interventions.split(',').map(i => i.trim()).filter(Boolean),
                eligibilityCriteria: formData.eligibilityCriteria.split('\n').map(e => e.trim()).filter(Boolean),
                sponsors: formData.sponsors.split(',').map(s => s.trim()).filter(Boolean),
                locations: formData.location ? [{
                    coordinates: [0, 0],
                    address: formData.location
                }] : [],
                importedFrom: 'manual' as const
            };

            const response = await fetch('/api/trials/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trialData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create trial');
            }

            router.push('/dashboard/researcher/trials');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create trial');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Clinical Trial</h1>
                <p className="text-muted-foreground">
                    Add a new clinical trial to your profile
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Essential trial details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nctNumber">NCT Number *</Label>
                                <Input
                                    id="nctNumber"
                                    placeholder="NCT12345678"
                                    value={formData.nctNumber}
                                    onChange={(e) => handleChange('nctNumber', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="researcherRole">Your Role *</Label>
                                <Select
                                    value={formData.researcherRole}
                                    onValueChange={(value) => handleChange('researcherRole', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PI">Principal Investigator</SelectItem>
                                        <SelectItem value="Co-Investigator">Co-Investigator</SelectItem>
                                        <SelectItem value="Site Coordinator">Site Coordinator</SelectItem>
                                        <SelectItem value="Study Coordinator">Study Coordinator</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Trial Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter trial title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="summary">Brief Summary *</Label>
                            <Textarea
                                id="summary"
                                placeholder="Brief description of the trial"
                                value={formData.summary}
                                onChange={(e) => handleChange('summary', e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="detailedDescription">Detailed Description</Label>
                            <Textarea
                                id="detailedDescription"
                                placeholder="Detailed description of the trial"
                                value={formData.detailedDescription}
                                onChange={(e) => handleChange('detailedDescription', e.target.value)}
                                rows={5}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Study Design */}
                <Card>
                    <CardHeader>
                        <CardTitle>Study Design</CardTitle>
                        <CardDescription>Trial design and status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Not yet recruiting">Not yet recruiting</SelectItem>
                                        <SelectItem value="Recruiting">Recruiting</SelectItem>
                                        <SelectItem value="Active, not recruiting">Active, not recruiting</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Suspended">Suspended</SelectItem>
                                        <SelectItem value="Terminated">Terminated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phase">Phase *</Label>
                                <Select
                                    value={formData.phase}
                                    onValueChange={(value) => handleChange('phase', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="N/A">N/A</SelectItem>
                                        <SelectItem value="Early Phase 1">Early Phase 1</SelectItem>
                                        <SelectItem value="Phase 1">Phase 1</SelectItem>
                                        <SelectItem value="Phase 2">Phase 2</SelectItem>
                                        <SelectItem value="Phase 3">Phase 3</SelectItem>
                                        <SelectItem value="Phase 4">Phase 4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="studyType">Study Type *</Label>
                                <Select
                                    value={formData.studyType}
                                    onValueChange={(value) => handleChange('studyType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Interventional">Interventional</SelectItem>
                                        <SelectItem value="Observational">Observational</SelectItem>
                                        <SelectItem value="Expanded Access">Expanded Access</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="enrollment">Target Enrollment</Label>
                                <Input
                                    id="enrollment"
                                    type="number"
                                    placeholder="100"
                                    value={formData.enrollment}
                                    onChange={(e) => handleChange('enrollment', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">Completion Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Medical Information</CardTitle>
                        <CardDescription>Conditions and interventions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="conditions">Conditions *</Label>
                            <Input
                                id="conditions"
                                placeholder="Cancer, Diabetes, etc. (comma-separated)"
                                value={formData.conditions}
                                onChange={(e) => handleChange('conditions', e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Separate multiple conditions with commas</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interventions">Interventions</Label>
                            <Input
                                id="interventions"
                                placeholder="Drug A, Procedure B, etc. (comma-separated)"
                                value={formData.interventions}
                                onChange={(e) => handleChange('interventions', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                            <Textarea
                                id="eligibilityCriteria"
                                placeholder="Enter each criterion on a new line"
                                value={formData.eligibilityCriteria}
                                onChange={(e) => handleChange('eligibilityCriteria', e.target.value)}
                                rows={5}
                            />
                            <p className="text-xs text-muted-foreground">One criterion per line</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Location and Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location & Contact</CardTitle>
                        <CardDescription>Trial location and contact information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                placeholder="City, State, Country"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactInfo">Contact Information *</Label>
                            <Textarea
                                id="contactInfo"
                                placeholder="Contact name, email, phone"
                                value={formData.contactInfo}
                                onChange={(e) => handleChange('contactInfo', e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sponsors">Sponsors</Label>
                            <Input
                                id="sponsors"
                                placeholder="Sponsor names (comma-separated)"
                                value={formData.sponsors}
                                onChange={(e) => handleChange('sponsors', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Trial
                    </Button>
                </div>
            </form>
        </div>
    );
}
