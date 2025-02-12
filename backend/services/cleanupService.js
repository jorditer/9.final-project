import { CronJob } from 'cron';
import Pin from '../models/pins.model.js';
import mongoose from 'mongoose';

// Delete expired pins
const deleteExpiredPins = async (minutesThreshold = 30) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB connection not ready. Skipping cleanup.');
    return;
  }

  try {
    const thresholdDate = new Date(Date.now() - (minutesThreshold * 60 * 1000));
    console.log('Attempting to delete pins older than:', thresholdDate);
    
    // Find pins first to see what would be deleted
    const pinsToDelete = await Pin.find({ date: { $lt: thresholdDate } });
    console.log('Found', pinsToDelete.length, 'pins to delete');
    
    if (pinsToDelete.length > 0) {
      const result = await Pin.deleteMany({
        date: { $lt: thresholdDate }
      });
      
      console.log(`Successfully deleted ${result.deletedCount} expired pins`);
    } else {
      console.log('No expired pins to delete');
    }
  } catch (error) {
    console.error('Error in deleteExpiredPins:', error);
    
    // If it's a connection error, wait and try to reconnect
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.log('MongoDB connection error. Waiting before retry...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Reconnected to MongoDB');
      } catch (reconnectError) {
        console.error('Failed to reconnect:', reconnectError);
      }
    }
  }
};

// Create the cleanup job to run every 15 minutes
const cleanupJob = new CronJob(
  '*/15 * * * *',
  async () => {
    console.log('Running scheduled pin cleanup job...');
    await deleteExpiredPins(30);
  },
  null,
  false,
  'UTC'
);

export const startCleanupJob = async () => {
  try {
    // Run immediately
    console.log('Running initial pin cleanup...');
    await deleteExpiredPins(30);
    
    // Then start the scheduled job
    cleanupJob.start();
    console.log('Cleanup job scheduled for every 15 minutes');
  } catch (error) {
    console.error('Error starting cleanup job:', error);
  }
};

export const stopCleanupJob = () => {
  try {
    cleanupJob.stop();
    console.log('Cleanup job stopped');
  } catch (error) {
    console.error('Error stopping cleanup job:', error);
  }
};