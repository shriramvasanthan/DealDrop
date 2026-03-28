import cron from 'node-cron';
import Deal from '../models/Deal.js';

export const startCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      const eightHoursFromNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
      const expiringDeals = await Deal.find({
        expiryTime: { $lte: eightHoursFromNow, $gt: new Date() },
        quantity: { $gt: 0 }
      }).populate('retailerId', 'name email');

      console.log(`[CronJob 8AM] Found ${expiringDeals.length} deals expiring within 8 hours:`);
      expiringDeals.forEach(deal => {
        const hoursLeft = ((new Date(deal.expiryTime) - new Date()) / 1000 / 3600).toFixed(1);
        console.log(`  ⏰ "${deal.title}" — ${hoursLeft}hrs left (Retailer: ${deal.retailerId?.name})`);
      });
    } catch (err) {
      console.error('[CronJob] Error checking expiring deals:', err.message);
    }
  });

  console.log('[CronJob] Expiry reminder scheduled: daily at 8:00 AM');
};
