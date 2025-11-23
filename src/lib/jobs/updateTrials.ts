// Background job to periodically update trial information from ClinicalTrials.gov
import { fetchTrialDetails } from '@/lib/services/clinicaltrials';
import TrialModel from '@/models/trial/Trial';
import dbConnect from '@/lib/db/connect';

// Update trials that haven't been updated in the last 24 hours
export async function updateStaleTrials() {
  try {
    await dbConnect();
    
    // Find trials that haven't been updated in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const staleTrials = await TrialModel.find({
      lastUpdated: { $lt: oneDayAgo }
    }).limit(10); // Limit to 10 trials per run to avoid rate limiting
    
    console.log(`Found ${staleTrials.length} stale trials to update`);
    
    // Update each trial
    for (const trial of staleTrials) {
      try {
        console.log(`Updating trial ${trial.nctNumber}`);
        
        // Fetch updated information from ClinicalTrials.gov
        const updatedTrialData = await fetchTrialDetails(trial.nctNumber);
        
        // Update the trial in our database
        await TrialModel.findOneAndUpdate(
          { nctNumber: trial.nctNumber },
          {
            ...updatedTrialData,
            lastUpdated: new Date(updatedTrialData.lastUpdated)
          }
        );
        
        console.log(`Successfully updated trial ${trial.nctNumber}`);
      } catch (error) {
        console.error(`Error updating trial ${trial.nctNumber}:`, error);
        // Continue with other trials even if one fails
      }
    }
    
    console.log('Finished updating stale trials');
  } catch (error) {
    console.error('Error in updateStaleTrials job:', error);
  }
}

// Update a specific trial by NCT number
export async function updateTrialByNctNumber(nctNumber: string) {
  try {
    await dbConnect();
    
    console.log(`Updating trial ${nctNumber}`);
    
    // Fetch updated information from ClinicalTrials.gov
    const updatedTrialData = await fetchTrialDetails(nctNumber);
    
    // Update the trial in our database
    await TrialModel.findOneAndUpdate(
      { nctNumber },
      {
        ...updatedTrialData,
        lastUpdated: new Date(updatedTrialData.lastUpdated)
      },
      { upsert: true } // Create if it doesn't exist
    );
    
    console.log(`Successfully updated trial ${nctNumber}`);
  } catch (error) {
    console.error(`Error updating trial ${nctNumber}:`, error);
    throw error;
  }
}

// Run the job if this file is executed directly
if (require.main === module) {
  updateStaleTrials().then(() => {
    console.log('Trial update job completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Trial update job failed:', error);
    process.exit(1);
  });
}

const updateTrialsJob = { updateStaleTrials, updateTrialByNctNumber };
export default updateTrialsJob;