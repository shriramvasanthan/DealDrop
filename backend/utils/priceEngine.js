/**
 * Smart Discount Engine
 * Recommends an optimal discount % and final price based on deal context.
 */
export const recommendPrice = ({ originalPrice, quantity, expiryHours, demand = 'medium', minimumPrice }) => {
  let discountPercent = 0;

  // Base discount by expiry urgency
  if (expiryHours <= 2) {
    discountPercent = 65;
  } else if (expiryHours <= 6) {
    discountPercent = 45;
  } else if (expiryHours <= 12) {
    discountPercent = 30;
  } else {
    discountPercent = 15;
  }

  // Adjust by demand + stock
  if (demand === 'low' && quantity > 50) {
    discountPercent = Math.min(discountPercent + 15, 75);
  } else if (demand === 'high' && quantity < 10) {
    discountPercent = Math.max(discountPercent - 15, 10);
  } else if (demand === 'medium') {
    // no extra adjustment
  }

  let suggestedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

  // Ensure we never go below minimum price
  if (minimumPrice && suggestedPrice < minimumPrice) {
    suggestedPrice = minimumPrice;
    discountPercent = Math.round((1 - minimumPrice / originalPrice) * 100);
  }

  return {
    discountPercent,
    suggestedPrice,
    reasoning: `${expiryHours}hr expiry, ${demand} demand, ${quantity} units → ${discountPercent}% off`
  };
};
