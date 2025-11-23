import TrialModel from '@/models/trial/Trial';
import UserModel from '@/models/user/User';
import { UserRole } from '@/types';

/**
 * Seeds the database with sample trial data if no trials exist
 * This is a helper function that can be called from API routes
 */
export async function seedTrialsIfEmpty() {
    try {
        // Check if trials already exist
        const existingTrials = await TrialModel.countDocuments();

        if (existingTrials > 0) {
            console.log(`Database already has ${existingTrials} trials. Skipping seed.`);
            return { seeded: false, count: existingTrials };
        }

        console.log('No trials found in database. Seeding sample data...');

        // Find or create a sample researcher to link trials to
        let researcher = await UserModel.findOne({ role: UserRole.RESEARCHER });

        if (!researcher) {
            // Create a default researcher if none exists
            researcher = await UserModel.create({
                email: 'researcher@example.com',
                password: 'Password123!',
                firstName: 'Alex',
                lastName: 'Morgan',
                role: UserRole.RESEARCHER,
                institution: 'Curalink Research Institute',
                bio: 'Researcher focusing on oncology and immunotherapy.',
                expertise: ['Oncology', 'Immunotherapy', 'Genomics'],
                openForCollaboration: true,
                location: {
                    type: 'Point',
                    coordinates: [-122.4194, 37.7749],
                    address: 'San Francisco, CA',
                },
            });
        }

        const trialsData = [
            {
                nctNumber: 'NCT00000001',
                title: 'Phase 2 Trial of Immunotherapy for Solid Tumors',
                summary: 'Evaluating efficacy of novel immunotherapy in patients with solid tumors. This study aims to assess the safety and efficacy of a novel checkpoint inhibitor in combination with standard chemotherapy.',
                status: 'Recruiting',
                phase: '2',
                locations: [
                    {
                        coordinates: [-122.4194, 37.7749],
                        address: 'UCSF Medical Center, San Francisco, CA 94143',
                    },
                    {
                        coordinates: [-118.2437, 34.0522],
                        address: 'UCLA Medical Center, Los Angeles, CA 90095',
                    },
                ],
                eligibilityCriteria: [
                    'Age 18-75 years',
                    'Diagnosed with solid tumor (Stage II-IV)',
                    'ECOG performance status 0-2',
                    'Adequate organ function',
                ],
                contactInfo: 'trial-contact@curalink.example',
                conditions: ['Solid Tumor', 'Cancer', 'Oncology'],
                interventions: ['Immunotherapy', 'Checkpoint Inhibitor', 'Chemotherapy'],
                lastUpdated: new Date(),
                linkedResearchers: [researcher._id],
            },
            {
                nctNumber: 'NCT00000002',
                title: 'Phase 3 Trial for Type 2 Diabetes Management',
                summary: 'Assessing long-term outcomes of new diabetes treatment regimen combining medication with lifestyle interventions. This randomized controlled trial will evaluate glycemic control and cardiovascular outcomes.',
                status: 'Active, not recruiting',
                phase: '3',
                locations: [
                    {
                        coordinates: [-71.0589, 42.3601],
                        address: 'Massachusetts General Hospital, Boston, MA 02114',
                    },
                    {
                        coordinates: [-87.6298, 41.8781],
                        address: 'Northwestern Memorial Hospital, Chicago, IL 60611',
                    },
                ],
                eligibilityCriteria: [
                    'Age 25-70 years',
                    'Type 2 Diabetes diagnosis for at least 1 year',
                    'HbA1c between 7.5-10%',
                    'BMI 25-40 kg/m²',
                ],
                contactInfo: 'diabetes-trial@curalink.example',
                conditions: ['Type 2 Diabetes', 'Diabetes Mellitus', 'Endocrinology'],
                interventions: ['Medication A', 'Lifestyle Program', 'Dietary Counseling'],
                lastUpdated: new Date(),
                linkedResearchers: [researcher._id],
            },
            {
                nctNumber: 'NCT00000003',
                title: 'Early Detection of Alzheimer\'s Disease Using Novel Biomarkers',
                summary: 'A prospective study evaluating the utility of novel blood-based biomarkers for early detection of Alzheimer\'s disease in at-risk populations.',
                status: 'Recruiting',
                phase: '1',
                locations: [
                    {
                        coordinates: [-73.9654, 40.7829],
                        address: 'Mount Sinai Hospital, New York, NY 10029',
                    },
                ],
                eligibilityCriteria: [
                    'Age 55-85 years',
                    'Family history of Alzheimer\'s disease',
                    'No current diagnosis of dementia',
                    'Willing to undergo cognitive testing',
                ],
                contactInfo: 'alzheimers-study@curalink.example',
                conditions: ['Alzheimer\'s Disease', 'Dementia', 'Neurology'],
                interventions: ['Biomarker Testing', 'Cognitive Assessment'],
                lastUpdated: new Date(),
                linkedResearchers: [researcher._id],
            },
            {
                nctNumber: 'NCT00000004',
                title: 'Cardiovascular Outcomes in Hypertension: A Comparative Study',
                summary: 'Comparing the effectiveness of different antihypertensive medication regimens on cardiovascular outcomes in patients with moderate to severe hypertension.',
                status: 'Enrolling by invitation',
                phase: '4',
                locations: [
                    {
                        coordinates: [-77.0369, 38.9072],
                        address: 'MedStar Washington Hospital Center, Washington, DC 20010',
                    },
                    {
                        coordinates: [-75.1652, 39.9526],
                        address: 'Hospital of the University of Pennsylvania, Philadelphia, PA 19104',
                    },
                ],
                eligibilityCriteria: [
                    'Age 40-75 years',
                    'Diagnosed with hypertension (BP ≥140/90 mmHg)',
                    'No history of stroke or heart attack',
                    'Not currently on more than 2 antihypertensive medications',
                ],
                contactInfo: 'cardio-trial@curalink.example',
                conditions: ['Hypertension', 'Cardiovascular Disease', 'Cardiology'],
                interventions: ['ACE Inhibitor', 'Beta Blocker', 'Calcium Channel Blocker'],
                lastUpdated: new Date(),
                linkedResearchers: [researcher._id],
            },
        ];

        await TrialModel.insertMany(trialsData);
        console.log(`Successfully seeded ${trialsData.length} trials`);

        return { seeded: true, count: trialsData.length };
    } catch (error) {
        console.error('Error seeding trials:', error);
        throw error;
    }
}
