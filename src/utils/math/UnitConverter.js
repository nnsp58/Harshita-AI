class UnitConverter {
  /**
   * Universal offline unit converter.
   * Converts between lengths and areas commonly used in India.
   */
  static convert(value, fromUnit, toUnit) {
    // Base unit: meters for length, square meters for area
    const conversionRates = {
      // Length (to meters)
      'feet': 0.3048,
      'meter': 1,
      'inch': 0.0254,
      'cm': 0.01,
      'km': 1000,
      'mile': 1609.34,
      
      // Area (to sq meters)
      'acre': 4046.86,
      'hectare': 10000,
      'bigha': 2508.38,   // Varies by state, using UP standard approx
      'biswa': 125.419,   // 1 Bigha = 20 Biswa
      'sq_feet': 0.092903,
      'sq_meter': 1,
      'gaj': 0.836127,    // Square Yard
      'marla': 25.2929,
      'kanal': 505.857
    };

    const normalizeUnit = (unit) => {
      const u = unit.toLowerCase().trim();
      if (u === 'ft' || u === 'fit' || u === 'feet') return 'feet';
      if (u === 'm' || u === 'meter' || u === 'metre') return 'meter';
      if (u === 'in' || u === 'inch') return 'inch';
      if (u === 'sq ft' || u === 'sqft' || u === 'square feet') return 'sq_feet';
      if (u === 'sq m' || u === 'sqm' || u === 'square meter') return 'sq_meter';
      if (u === 'yard' || u === 'sq yard' || u === 'gaj') return 'gaj';
      return u;
    };

    const normFrom = normalizeUnit(fromUnit);
    const normTo = normalizeUnit(toUnit);

    if (!conversionRates[normFrom] || !conversionRates[normTo]) {
      throw new Error(`Unsupported units: ${fromUnit} or ${toUnit}`);
    }

    // Convert to base unit, then to target unit
    const baseValue = value * conversionRates[normFrom];
    const targetValue = baseValue / conversionRates[normTo];

    const formattedOutput = `Formula
Unit Conversion

Values
Value = ${value} ${fromUnit}
Target = ${toUnit}

Calculation
${value} × (${conversionRates[normFrom]} / ${conversionRates[normTo]})

Result
${targetValue.toFixed(4)} ${toUnit}`;

    return formattedOutput;
  }
}

module.exports = { UnitConverter };
