import User from '@/models/user/User';

// Get top researchers based on patient's conditions
export async function getTopResearchers(patientId: string) {
  try {
    // Fetch patient data to get their conditions
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }
    
    // In a real implementation, we would:
    // 1. Match patient conditions with researcher expertise
    // 2. Calculate relevance scores
    // 3. Sort by match percentage
    // 4. Return top N researchers
    
    // For now, return mock data
    return [
      {
        _id: '1',
        firstName: 'Dr. Emily',
        lastName: 'Johnson',
        institution: 'Johns Hopkins Hospital',
        specialty: 'Oncology',
        location: {
          coordinates: [-76.6122, 39.2904],
          address: 'Baltimore, MD'
        },
        matchPercentage: 92
      },
      {
        _id: '2',
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        institution: 'Mayo Clinic',
        specialty: 'Cardiology',
        location: {
          coordinates: [-92.4696, 44.0213],
          address: 'Rochester, MN'
        },
        matchPercentage: 87
      }
    ];
  } catch (error) {
    console.error('Error fetching top researchers:', error);
    throw error;
  }
}

// Get nearby trials within 100 miles
export async function getNearbyTrials(patientId: string) {
  try {
    // Fetch patient data to get their location
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }
    
    // In a real implementation, we would:
    // 1. Get patient's location
    // 2. Find trials within 100 miles
    // 3. Calculate distances
    // 4. Sort by relevance and distance
    // 5. Return top N trials
    
    // For now, return mock data
    return [
      {
        _id: '1',
        title: 'Novel Immunotherapy for Advanced Melanoma',
        condition: 'Melanoma',
        phase: 'II',
        status: 'Recruiting',
        location: {
          coordinates: [-76.6122, 39.2904],
          address: 'Baltimore, MD'
        },
        matchPercentage: 94,
        distance: 12.5
      },
      {
        _id: '2',
        title: 'Cardiovascular Risk Reduction in Diabetics',
        condition: 'Diabetes',
        phase: 'III',
        status: 'Active',
        location: {
          coordinates: [-92.4696, 44.0213],
          address: 'Rochester, MN'
        },
        matchPercentage: 88,
        distance: 45.2
      }
    ];
  } catch (error) {
    console.error('Error fetching nearby trials:', error);
    throw error;
  }
}

// Get recommended publications for patients
export async function getRecommendedPublications(patientId: string) {
  try {
    // Fetch patient data to get their conditions
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }
    
    // In a real implementation, we would:
    // 1. Match patient conditions with publication topics
    // 2. Filter for patient-friendly content
    // 3. Sort by relevance and recency
    // 4. Return top N publications
    
    // For now, return mock data
    return [
      {
        _id: '1',
        title: 'Understanding Your Diagnosis: A Patient Guide to Modern Treatment Options',
        authors: ['Dr. Emily Johnson', 'Dr. Michael Chen'],
        journal: 'Patient Education and Counseling',
        publicationDate: '2023-05-15T00:00:00.000Z',
        matchPercentage: 96
      },
      {
        _id: '2',
        title: 'Living Well with Chronic Conditions: Lifestyle Strategies That Work',
        authors: ['Sarah Williams', 'Dr. Robert Brown'],
        journal: 'Journal of Patient Experience',
        publicationDate: '2023-03-22T00:00:00.000Z',
        matchPercentage: 89
      }
    ];
  } catch (error) {
    console.error('Error fetching recommended publications:', error);
    throw error;
  }
}

// Get recent forum activity
export async function getRecentForumActivity() {
  try {
    // In a real implementation, we would:
    // 1. Fetch recent forum posts
    // 2. Sort by activity/recent posts
    // 3. Return top N posts
    
    // For now, return mock data
    return [
      {
        _id: '1',
        title: 'Managing side effects of new medication',
        category: 'Treatment',
        author: 'Sarah J.',
        replies: 12,
        lastActivity: '2 hours ago'
      },
      {
        _id: '2',
        title: 'Diet recommendations for my condition',
        category: 'Nutrition',
        author: 'Michael T.',
        replies: 8,
        lastActivity: '5 hours ago'
      }
    ];
  } catch (error) {
    console.error('Error fetching recent forum activity:', error);
    throw error;
  }
}