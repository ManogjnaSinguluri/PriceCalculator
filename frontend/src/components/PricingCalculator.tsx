import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { PricingFormData } from '../types';
import { calculateTotalFees } from '../utils/feeCalculators';
import { categories } from '../utils/constants/categories';
import { shippingModes } from '../utils/constants/shippingModes';
import { serviceLevels } from '../utils/constants/serviceLevels';
import { productSizes } from '../utils/constants/productSizes';
import { locations } from '../utils/constants/locations';
import { shippingTypes } from '../utils/constants/shippingTypes';

export default function PricingCalculator() {
  const [formData, setFormData] = useState<PricingFormData>({
    productCategory: categories[0],
    sellingPrice: 0,
    weight: 0.5,
    shippingMode: 'Easy Ship',
    serviceLevel: 'Standard',
    productSize: 'Standard',
    location: 'Local',
    shippingType: 'Standard'
  });

  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Before calculating, ensure sellingPrice and weight are valid
      if (formData.sellingPrice < 0 || formData.weight < 0) {
        throw new Error('Please enter a valid selling price or weight (must be non-negative).');
      }
      const calculatedFees = await calculateTotalFees(formData);
      setResults(calculatedFees);
    } catch (err) {
      setError(err.message || 'Failed to calculate fees. Please try again.');
      console.error('Error calculating fees:', err);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let updatedValue;
      if (name === 'sellingPrice' || name === 'weight') {
        updatedValue = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        // Validation check
        if (updatedValue < 0) {
          setError(`Please enter a valid ${name === 'sellingPrice' ? 'Selling Price' : 'Weight'} (must be non-negative).`);
          updatedValue = 0; // Reset to 0 or keep previous value, here we reset to 0
        } else {
          setError(null); // Clear any previous errors if the input is now valid
        }
      } else {
        updatedValue = value;
      }
      const newFormData = {
        ...prev,
        [name]: updatedValue
      };
      console.log('Updated formData:', newFormData);
      return newFormData;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Amazon Pricing Calculator</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Form Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category
                </label>
                <select
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Mode
                  </label>
                  <select
                    name="shippingMode"
                    value={formData.shippingMode}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {shippingModes.map(shippingMode => (
                    <option key={shippingMode} value={shippingMode}>{shippingMode}</option>
                  ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Level
                  </label>
                  <select
                    name="serviceLevel"
                    value={formData.serviceLevel}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {serviceLevels.map(serviceLevel => (
                    <option key={serviceLevel} value={serviceLevel}>{serviceLevel}</option>
                  ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Size
                  </label>
                  <select
                    name="productSize"
                    value={formData.productSize}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {productSizes.map(productSize => (
                    <option key={productSize} value={productSize}>{productSize}</option>
                  ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Type
                  </label>
                  <select
                    name="shippingType"
                    value={formData.shippingType}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {shippingTypes.map(shippingType => (
                      <option key={shippingType} value={shippingType}>{shippingType}</option> 
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Calculate Fees'}
              </button>
            </div>

            {error && (
              <div 
                className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm mb-4" 
                role="alert"
              >
                {error}
              </div>
            )}


            {results && !error && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(results.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-medium">₹{(typeof value === 'string' ? parseFloat(value) : Number(value) || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-200 my-4"></div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total Fees:</span>
                    <span className="text-blue-600">₹{(typeof results.totalFees === 'string' ? parseFloat(results.totalFees) : Number(results.totalFees) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Net Earnings:</span>
                    <span className={`text-${(typeof results.netEarnings === 'string' ? parseFloat(results.netEarnings) : Number(results.netEarnings) || 0) >= 0 ? 'green' : 'red'}-600`}>
                      ₹{(typeof results.netEarnings === 'string' ? parseFloat(results.netEarnings) : Number(results.netEarnings) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}