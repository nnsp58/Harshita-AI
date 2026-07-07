class TaxWorkspaceRouter {
  
  /**
   * Generates the payload to open the Tax Workspace at a specific tab
   */
  static routeTo(tab = 'dashboard', profileData = {}) {
    return {
      mode: 'tax_workspace',
      action: 'navigate',
      route: `/service/tax-department?tab=${tab}`,
      data: profileData
    };
  }

}

module.exports = { TaxWorkspaceRouter };
