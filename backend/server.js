const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Authentication setup
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, './_SpreadsheetsCredentialsFile_.json'),
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const sheets = google.sheets({ version: 'v4', auth });

const sheetId = '1o_yM63Grl_QB6lpuXE3spbrMeCs-hIMXCVyghj8FmV0';

// Helper function to fetch data from Google Sheets
async function fetchSheetData(tabName, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tabName}!${range}`,
    });
    return response.data.values;
  } catch (error) {
    console.error(`Error fetching ${tabName} data:`, error);
    throw error;
  }
}

/// Function to calculate Referral Fee based on Google Sheets data
async function calculateReferralFee(productCategory, sellingPrice) {
  const referralFees = await fetchSheetData('Referral fees', 'A:C');
  
  // Iterate through the fetched data, skipping the header row
  for (const row of referralFees.slice(1)) {
    const category = row[0];
    const priceRangeStr = row[1];
    const feePercentageStr = row[2];

    // Check if the category matches
    if (category === productCategory) {
      // Parse the fee percentage
      const feePercentage = parseFloat(feePercentageStr.replace('%', ''));

      // Handle 'All' price range case first
      if (priceRangeStr === 'All') {
        return sellingPrice * (feePercentage / 100);
      } else {
        // Parse the price range
        let minPrice, maxPrice;
        
        if (priceRangeStr.includes('<=')) {
          // For ranges like <= 500
          minPrice = 0;
          maxPrice = parseFloat(priceRangeStr.replace('<=', '').trim());
        } else if (priceRangeStr.includes('>')) {
          // For ranges like > 500 or > 500 and <= 1000
          const rangeParts = priceRangeStr.split(' and ');
          minPrice = parseFloat(rangeParts[0].replace('>', '').trim());
          
          if (rangeParts.length > 1) {
            // If there's a max price
            maxPrice = parseFloat(rangeParts[1].replace('<=', '').trim());
          } else {
            // If there's no max price (e.g., > 1000)
            maxPrice = Infinity;
          }
        }

        // Check if the selling price falls within the range
        if (sellingPrice >= minPrice && (sellingPrice <= maxPrice || maxPrice === Infinity)) {
          return sellingPrice * (feePercentage / 100);
        }
      }
    }
  }
  
  // If no match is found, return a default rate
  return sellingPrice * 0.15; // 15% as a fallback, adjust as needed
}
async function calculateClosingFee(sellingPrice, shippingMode) {
  const closingFees = await fetchSheetData('Closing fees', 'A:F');
  
  // Convert sellingPrice to a number to ensure comparison works correctly
  sellingPrice = parseFloat(sellingPrice);
  
  // Iterate through the fetched data, skipping the header row
  for (const row of closingFees.slice(1)) {
    // Parse the price range
    let [priceRange, fbaNormal, fbaException, easyShip, selfShip, sellerFlex] = row;
    
    // Split the price range into min and max
    let minPrice, maxPrice;
    if (priceRange.includes('-')) {
      [minPrice, maxPrice] = priceRange.split('-').map(val => parseFloat(val.replace('₹', '')));
    } else {
      // Handle cases where there might be a single value like '0-250' or '250+'
      minPrice = parseFloat(priceRange.replace('₹', '').split('+')[0]);
      maxPrice = Infinity; // Assuming '250+' means all prices above 250
    }
    
    // Convert fees to numbers, handling '-' as 0
    fbaNormal = fbaNormal.replace('₹', '') === '-' ? 0 : parseFloat(fbaNormal.replace('₹', ''));
    fbaException = fbaException.replace('₹', '') === '-' ? 0 : parseFloat(fbaException.replace('₹', ''));
    easyShip = easyShip.replace('₹', '') === '-' ? 0 : parseFloat(easyShip.replace('₹', ''));
    selfShip = selfShip.replace('₹', '') === '-' ? 0 : parseFloat(selfShip.replace('₹', ''));
    sellerFlex = sellerFlex.replace('₹', '') === '-' ? 0 : parseFloat(sellerFlex.replace('₹', ''));
    
    // Check if the selling price falls within the price range
    if (sellingPrice >= minPrice && (sellingPrice <= maxPrice || maxPrice === Infinity)) {
      switch (shippingMode) {
        case 'FBA Normal':
          return fbaNormal;
        case 'FBA Exception':
          return fbaException;
        case 'Easy Ship':
          return easyShip;
        case 'Self Ship':
          return selfShip;
        case 'Seller Flex':
          return sellerFlex;
        default:
          // Default to Self Ship if mode is unknown
          return selfShip;
      }
    }
  }
  
  // If no match is found, return 0 or consider setting a default fee
  console.warn('No matching price range found for selling price:', sellingPrice);
  return 0;
}

async function calculateWeightHandlingFee(weight, serviceLevel, shippingMode, location, productSize) {
  const weightHandlingFees = await fetchSheetData('Weight handling fees', 'A:F');
  
  // Modify shippingMode based on the provided logic
  const modifiedShippingMode = shippingMode === 'FBA Normal' || shippingMode === 'FBA Exception' ? 'FBA' : shippingMode;

  // Determine the correct fee structure based on modified shipping mode, product size, and service level
  let applicableFees = weightHandlingFees.filter(row => {
    const modeSizeMatch = row[0].includes(modifiedShippingMode) && row[0].includes(productSize);
    const levelMatch = row[0].includes('- '+serviceLevel) || row[0].includes('- All Levels');
    return modeSizeMatch && levelMatch;
  });

  let totalFee = 0;
  let weightProcessed = 0;

  // Process each weight tier
  for (const feeRow of applicableFees) {
    const [, weightRange, localFee, regionalFee, nationalFee, ixdFee] = feeRow;
    let fee = 0;

    // Determine the correct fee based on location
    switch (location) {
      case 'Local':
        fee = parseFloat(localFee.replace('₹', ''));
        break;
      case 'Regional':
        fee = parseFloat(regionalFee.replace('₹', ''));
        break;
      case 'National':
        // Handle empty national fee
        if (nationalFee === '') {
          fee = 0;
        } else {
          fee = parseFloat(nationalFee.replace('₹', ''));
        }
        break;
      case 'IXD':
        // Check if IXD fee is available, otherwise use 0
        fee = ixdFee && ixdFee !== '-' && ixdFee !== 'NA' ? parseFloat(ixdFee.replace('₹', '')) : 0;
        break;
      default:
        fee = 0;
    }
    //console.log(`Fee is ${fee}`);

    // Calculate fee based on weight range
    if (weightRange.includes('First')) {
      // First weight tier
      const weightLimit = weightRange.includes('500g') ? 0.5 : 
                          weightRange.includes('12kg') ? 12 : 0; // Assuming 'First 12kg' for heavy & bulky
      const applicableWeight = Math.min(weight - weightProcessed, weightLimit);
      totalFee += fee * (applicableWeight / weightLimit);
      weightProcessed += applicableWeight;
    } else if (weightRange.includes('Additional')) {
      // Additional weight tiers
      let weightLimit;
      if (weightRange.includes('500g')) weightLimit = 0.5;
      else if (weightRange.includes('kg')) weightLimit = 1;
      
      const additionalWeight = weight - weightProcessed;
      if (weightRange.includes('up to 1kg')) {
        // For weights up to 1kg after the first 500g
        totalFee += fee * Math.min(Math.ceil(additionalWeight / weightLimit), 1);
      } else if (weightRange.includes('after 1kg')) {
        // For weights after 1kg
        totalFee += fee * Math.max(0, Math.ceil((additionalWeight - 0.5) / weightLimit));
      } else if (weightRange.includes('after 5kg')) {
        // For weights after 5kg
        totalFee += fee * Math.max(0, Math.ceil((additionalWeight - 4.5) / weightLimit));
      } else if (weightRange.includes('after 12kg')) {
        // For weights after 12kg, applicable for Heavy & Bulky items
        totalFee += fee * Math.max(0, Math.ceil((additionalWeight - 11.5) / weightLimit));
      }
      weightProcessed = weight; // Ensure we don't process more than the total weight
    }
    //console.log(`Total fee is ${totalFee}`);
    //console.log(`Weight processed is ${weightProcessed}`);
    if (weightProcessed >= weight) break;
  }

  // Round the total fee to two decimal places for precision
  return parseFloat(totalFee.toFixed(2));
}


async function calculateOtherFees(productSize, shippingMode,shippingType) {
  const otherFees = await fetchSheetData('Other Fees', 'A:C');
  
  let pickAndPackFee = 0;
  let storageFee = 0;
  let removalFee = 0;
  
  for (const row of otherFees.slice(1)) { // Skip header row
    const feeType = row[0];
    const category = row[1];
    const rateStr = row[2];
    let rate = parseFloat(rateStr.replace('₹', '').replace(' per cubic foot per month', ''));

    // Calculate Pick & Pack Fee
    if (feeType === 'Pick & Pack Fee') {
      if ((category === 'Standard Size' && productSize === 'Standard') || 
          (category === 'Oversize/Heavy & Bulky' && productSize !== 'Standard')) {
        pickAndPackFee = rate;
      }
    }
    
    // Calculate Storage Fee with error handling
    if (feeType === 'Storage Fee' && category === 'All Categories') {
        storageFee = rate ;
      
    }
    // Calculate Removal Fees
    if (feeType === 'Removal Fees') {
      if (category.includes('Standard Size') && productSize === 'Standard') {
        if (category.includes('Standard Shipping') && (shippingType === 'Standard')) {
          removalFee = rate;
        } else if (category.includes('Expedited Shipping') && shippingType === 'Expedited') {
          removalFee = rate;
        }
      } else if (category.includes('Heavy & Bulky') && productSize !== 'Standard') {
        if (category.includes('Standard Shipping') && (shippingType === 'Standard')) {
          removalFee = rate;
        } else if (category.includes('Expedited Shipping') && shippingType === 'Expedited') {
          removalFee = rate;
        }
      }
    }
    //console.log(`Pick & Pack Fee: ${pickAndPackFee}, Storage Fee: ${storageFee}, Removal Fee: ${removalFee}`);
  }
  // Return an object containing all calculated fees
  return {
    pickAndPackFee: pickAndPackFee,
    storageFee: storageFee,
    removalFee: removalFee
  };
}


// API endpoint for profitability calculation
app.post('/api/v1/profitability-calculator', async (req, res) => {
  const { productCategory, sellingPrice, weight, shippingMode, serviceLevel, productSize, location,shippingType} = req.body;
  try {
    // Calculate each fee component
    const referralFee = await calculateReferralFee(productCategory, sellingPrice);
    const closingFee = await calculateClosingFee(sellingPrice, shippingMode);
    const weightHandlingFee = await calculateWeightHandlingFee(weight, serviceLevel, shippingMode, location, productSize);
    
    // Calculate other fees (Pick & Pack, Storage, Removal)
    const otherFees = await calculateOtherFees(productSize, shippingMode,shippingType);
    
    // Sum up all fees
    const totalFees = referralFee + closingFee + weightHandlingFee + otherFees.pickAndPackFee + otherFees.storageFee + otherFees.removalFee;
    // Calculate net earnings
    const netEarnings = sellingPrice - totalFees;

    res.json({
      breakdown: {
        referralFee: referralFee.toFixed(2),
        weightHandlingFee: weightHandlingFee.toFixed(2),
        closingFee: closingFee.toFixed(2),
        pickAndPackFee: otherFees.pickAndPackFee.toFixed(2),
        storageFee: otherFees.storageFee.toFixed(2),
        removalFee: otherFees.removalFee.toFixed(2)
      },
      totalFees: totalFees.toFixed(2),
      netEarnings: netEarnings.toFixed(2)
    });

  } catch (error) {
    console.error('Error in calculation:', error);
    res.status(500).json({ error: 'An error occurred while calculating fees' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));