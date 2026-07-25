class ConstructionSolver {
  /**
   * Calculates required number of standard bricks for a given wall volume.
   * Standard Indian brick with mortar: 9 x 4.5 x 3 inches ~ 0.0703 cubic feet
   */
  static calculateBricks(wallVolumeCuFt) {
    const brickVolumeCuFtWithMortar = 0.0703;
    const bricksNeeded = Math.ceil(wallVolumeCuFt / brickVolumeCuFtWithMortar);

    return `Formula
Construction: Bricks Calculation
Number of Bricks = Total Wall Volume / Volume of 1 Brick with Mortar

Values
Total Wall Volume = ${wallVolumeCuFt} cubic feet
1 Brick Volume (with mortar) ≈ 0.0703 cubic feet

Calculation
${wallVolumeCuFt} / 0.0703 = ${bricksNeeded}

Result
Estimated Bricks Required: ${bricksNeeded} bricks`;
  }
}

module.exports = { ConstructionSolver };
