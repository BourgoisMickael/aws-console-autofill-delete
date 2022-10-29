describe("AWS autofill delete", () => {
  it("run", () => {
    cy.viewport(1144, 693);
    const baseDomain = Cypress.env('baseDomain');
    const username = Cypress.env('username');
    const password = Cypress.env('password');
    const region = Cypress.env('region')

    // LOGIN
    cy.visit(`https://${baseDomain}.signin.aws.amazon.com/console`);
    cy.get("#username").type(username);
    cy.get("#password").type(password);
    cy.get("#signin_button").click();
    cy.location("href").should("eq", `https://${region}.console.aws.amazon.com/console/home?region=${region}#`);
    // Hide cookie popup
    cy.get("#awsccc-cb-buttons > button:nth-child(2) > span").click();
  });
});
