# Profitability Calculator

## Overview

This project has evolved from a front-end application into a full-stack solution with a backend API that calculates various fees and profitability metrics for transactions.

## Explanation of Business Terms:

* **Product Category**: Determines referral fee percentage and category-specific requirements.
* **Selling Price**: Your listing price, including GST.
* **Weight**: Actual product weight, which affects shipping costs.
* **Shipping Mode**:
    * **Easy Ship**: Amazon picks up and delivers, you store.
    * **FBA**: Amazon stores and ships.
* **Service Level**:
    * **Standard**: Regular delivery timeline.
    * **Express**: Faster delivery, higher fees.
* **Product Size**:
    * **Standard**: Normal sized items.
    * **Oversize**: Larger items with special handling.
* **Location**:
    * **Local**: Within city delivery.
    * **National**: Pan-India delivery.
These factors combine to determine your total Amazon fees and potential profits.

## Current Features
- Interactive pricing calculator
- Fee structure visualization
- Detailed cost breakdown
- Dynamic fee calculations via API

## Proposed API Extension

### Goals
- Create a backend API to manage fee structures.
- Integration with the given spreadsheet data (See below).
- Enable dynamic fee calculation from the API.

### Planned API Endpoints
```http
POST /api/v1/profitability-calculator
```

Endpoint Description

-   URL: /api/v1/profitability-calculator

-   Method: POST

-   Description: Calculates total fees and net earnings based on product details provided in the request body. Fetches fee structures from a spreadsheet dynamically.

Request Body

json

```
{
  "productCategory": "string",
  "sellingPrice": number,
  "weight": number,
  "shippingMode": "string",
  "serviceLevel": "string",
  "productSize": "string",
  "location": "string"
}
```

Response

json

```
{
  "breakdown": {
    "referralFee": number,
    "weightHandlingFee": number,
    "closingFee": number,
    "pickAndPackFee": number,
    "storageFee": number,
    "removalFee": number
  },
  "totalFees": number,
  "netEarnings": number
}
```

Error Handling

-   Returns HTTP status code with JSON error message on failure.

Implementation Notes

-   Backend in /backend directory.

-   Use google-spreadsheet for data fetching.

-   Implement error handling and logging.

How to Run

1.  Backend:

    -   Navigate to the /backend directory: ```cd backend```

    -   Install dependencies: ```npm install```

    -   Start the server: ```npm start```

2.  Frontend:

    -   Navigate to the /frontend directory: ```cd frontend```

    -   Install dependencies: ```npm install```

    -   Run development server: ```npm run dev```

Fetching JSON from Spreadsheet API

To fetch data from the Google Spreadsheet API:

1.  Setup Google Sheets API:

    -   Enable the Google Sheets API in the Google Cloud Console.

    -   Create credentials (OAuth client ID for a web application) and download the JSON file.

2.  Environment Variables:

    -   Place the credentials JSON file in your project or use environment variables for security.

    -   Set environment variables for GOOGLE_APPLICATION_CREDENTIALS pointing to your credentials file.

3.  Using google-spreadsheet Library:

    -   Install the library: npm install google-spreadsheet