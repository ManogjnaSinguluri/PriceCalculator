# Profitability Calculator

## Overview
This is currently a front-end application that calculates various fees and profitability metrics for transactions. We aim to extend it into a full-stack solution with an API backend.

## Explanation of business terms:

Product Category: Determines referral fee percentage and category-specific requirements
Selling Price: Your listing price, including GST
Weight: Actual product weight, affects shipping costs
Shipping Mode:

Easy Ship: Amazon picks up and delivers, you store
FBA: Amazon stores and ships

Service Level:

Standard: Regular delivery timeline
Express: Faster delivery, higher fees

Product Size:

Standard: Normal sized items
Oversize: Larger items with special handling

Location:

Local: Within city delivery
National: Pan-India delivery

These factors combine to determine your total Amazon fees and potential profits.


## Current Features
- Interactive pricing calculator
- Fee structure visualization
- Detailed cost breakdown
- Static fee calculations

## Proposed API Extension

### Goals
- Create a backend API to manage fee structures
- Integration with the given spreadsheet data(See below)
- Dynamic fee calculation(From the api)

### Planned API Endpoints
```http
POST /api/v1/profitability-calculator
```

## Extending the Project

### Adding New Fee Structures

1. Access the fee structure spreadsheet at: https://docs.google.com/spreadsheets/d/1o_yM63Grl_QB6lpuXE3spbrMeCs-hIMXCVyghj8FmV0/edit?usp=sharing

2. Instead of using `data/fees.ts`, create an API that fetches the fee structure by using the data present in the spreadsheet.

3. Update the `feeCalculators.ts` file to use the new API endpoint for fetching fee structures.

4. Ensure that the new API endpoint is properly integrated into the project and tested for functionality.

5. Update the documentation to reflect the new API endpoint and its usage.

How to run

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## API Documentation

### Calculate Profitability
http
POST /api/v1/profitability-calculator
Content-Type: application/json

Response:
```
json
{
"breakdown": {
"referralFee": 10,
"weightHandlingFee": 10.0,
"closingFee": 5.0,
"pickAndPackFee": 20
},
"totalFees": 45,
"netEarnings": 200
}
```

## Scoring Mechanism

The submission will be evaluated based on:

1. Code Quality:
   - Code maintainability
   - Performance benchmarks
   - Error handling

2. Fee Calculation Accuracy:
   - Referral fee precision across product categories
   - Weight handling fee accuracy for different shipping modes
   - Closing fee calculations for various price ranges
   - Pick & pack fee correctness for FBA/non-FBA modes

3. Net Earnings Validation:
   - Edge case handling
   - Decimal precision handling
   - Currency conversion accuracy (if applicable)


## Note
1. The Front end code and logic given here is just for explanatory purposes
2. You are free to remove and write your own logic when implementing the api
3. Make sure that the code is well tested

Here is an example JSON format for a Google Service Account credentials file:

```json
{
  "type": "service_account",
  "project_id": "my-project-2-448204",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/spreadsheetapi%40my-project-2-448204.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}```

- **type**: This tells Google what kind of key this is. Here, it's a "service_account" which means it's for an automated service, not a person.

- **project_id**: This is like the name of your project in Google Cloud. Here, it's "my-project-2-448204".

- **private_key_id** and **private_key**: These are super secret! They're like the unique codes that unlock your access to Google services. In real life, these would have long, secure strings here instead of being empty.

- **client_email**: This is the email address of your service account, which Google uses to recognize your application. In practice, this would be filled with something like `spreadsheetapi@my-project-2-448204.iam.gserviceaccount.com`.

- **client_id**: Another identifier for your service account, but this one is usually not needed for direct use in fetching data.

- **auth_uri**, **token_uri**, **auth_provider_x509_cert_url**, **client_x509_cert_url**: These are URLs where your application goes to get permission to access Google's services or to verify the identity of your service account. They're standard for Google services.

- **universe_domain**: This is a new field introduced by Google to specify which Google Cloud universe your project belongs to. Here, it's set to "googleapis.com".