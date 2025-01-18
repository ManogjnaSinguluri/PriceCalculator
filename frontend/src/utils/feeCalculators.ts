import axios from 'axios';
import { PricingFormData } from '../types';


// This function now calls the API to calculate total fees
export async function calculateTotalFees(data: PricingFormData) {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/profitability-calculator', data);
    console.log('Fees calculated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calculating fees:', error);
    // Return a default error response
    return {
      error: 'Failed to calculate fees',
      referralFee: 0,
      shippingFee: 0,
      pickAndPackFee: 0,
      totalFees: 0,
      netEarnings: 0
    };
  }
}