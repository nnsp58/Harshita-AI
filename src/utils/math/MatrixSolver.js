class MatrixSolver {
  static formatMatrix(matrix) {
    return `[\n  ${matrix.map(row => `[${row.join(', ')}]`).join(',\n  ')}\n]`;
  }

  static add(matrixA, matrixB) {
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
      throw new Error("Matrices must have the same dimensions for addition");
    }

    const result = matrixA.map((row, i) => 
      row.map((val, j) => val + matrixB[i][j])
    );

    return `Formula
Matrix Addition: C = A + B

Values
Matrix A =
${this.formatMatrix(matrixA)}

Matrix B =
${this.formatMatrix(matrixB)}

Calculation
Add corresponding elements: C[i][j] = A[i][j] + B[i][j]

Result
Matrix C =
${this.formatMatrix(result)}`;
  }
}

module.exports = { MatrixSolver };
