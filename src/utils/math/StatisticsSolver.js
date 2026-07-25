class StatisticsSolver {
  static calculate(operation, numbers) {
    if (!numbers || numbers.length === 0) throw new Error("No numbers provided");
    
    let result = 0;
    let calcString = '';
    
    const sum = numbers.reduce((a, b) => a + b, 0);
    const sorted = [...numbers].sort((a, b) => a - b);
    
    switch(operation.toLowerCase()) {
      case 'mean':
      case 'average':
        result = sum / numbers.length;
        calcString = `Sum = ${sum}, Count = ${numbers.length}\nMean = Sum / Count`;
        break;
      case 'median':
        const mid = Math.floor(sorted.length / 2);
        result = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        calcString = `Sorted: ${sorted.join(', ')}\nMedian is the middle value`;
        break;
      case 'range':
        result = sorted[sorted.length - 1] - sorted[0];
        calcString = `Max: ${sorted[sorted.length - 1]}, Min: ${sorted[0]}\nRange = Max - Min`;
        break;
      default:
        throw new Error(`Unsupported statistical operation: ${operation}`);
    }

    return `Formula
Statistics: ${operation.toUpperCase()}

Values
Dataset = [${numbers.join(', ')}]

Calculation
${calcString}

Result
${operation}: ${result}`;
  }
}

module.exports = { StatisticsSolver };
