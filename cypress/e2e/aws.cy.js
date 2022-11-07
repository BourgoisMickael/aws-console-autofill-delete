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

    // APIGATEWAY
    cy.visit(`https://${region}.console.aws.amazon.com/apigateway/main/apis?region=${region}`);
    cy.get('[data-testid=router] table > tbody > tr:first-child > td a').click();
    cy.get('.resources-tree button.actions-dropdown-button').click();
    cy.get('ul.dropdown-menu > li > a.delete-api-button').click();
    cy.get('button#confirmDeleteApiButton').should('not.be.disabled');
    cy.get('button.close').click();
    // TODO custom domain name and vpc links

    // ATHENA
    // workgroup
    cy.visit(`https://${region}.console.aws.amazon.com/athena/home?region=${region}#/workgroups/details/autofill-delete-test-workgroup`);
    cy.get('button[data-testid=delete-button]').click();
    cy.get('button[data-testid=modal-confirm-button]').should('not.be.disabled');
    cy.get('[data-testid=confirm-with-friction-modal] [class*=awsui_actions] button[class*=awsui_dismiss-control]').click();

    // datasource
    cy.visit(`https://${region}.console.aws.amazon.com/athena/home?region=${region}#/data-sources/details/autofill-delete-test-catalog`);
    cy.get('[class*=awsui_header] [class*=awsui_button-dropdown] button[type=button]').click(); // actions dropdown
    cy.get('ul[class*=awsui_options-list] > li[data-testid=modal-delete-item]').click();
    cy.get('button[data-testid=modal-confirm-button]').should('not.be.disabled');
    cy.get('[data-testid=confirm-with-friction-modal] [class*=awsui_actions] button[class*=awsui_dismiss-control]').click();

    // DYNAMODB
    // table
    cy.visit(`https://${region}.console.aws.amazon.com/dynamodbv2/home?region=${region}#tables`);
    cy.get('[data-testid=polaris-app-layout] main table > tbody > tr:first-child input[type=checkbox]').click(); // first table checkbox
    cy.get('[data-testid=polaris-app-layout] main [class*=awsui_header-controls] [class*=awsui_actions] > div > div:nth-child(3) > button').click(); // delete button
    cy.get('[data-testid=delete-table-modal] [class*=awsui_dialog] [class*=awsui_footer] button[data-testid=submit-form]').should('not.be.disabled');
    cy.get('[data-testid=delete-table-modal] [class*=awsui_dialog] [class*=awsui_footer] button[data-testid=cancel-form]').click();

    // backup
    cy.visit(`https://${region}.console.aws.amazon.com/dynamodbv2/home?region=${region}#list-backups`);
    cy.get('[data-testid=polaris-app-layout] main table > tbody > tr:first-child input[type=checkbox]').click(); // first backup checkbox
    cy.get('button[data-testid=list-backups-table__delete]').click(); // delete button
    cy.get('[data-testid=delete-backup-modal] button[data-testid=confirm-delete-button]').should('not.be.disabled');
    cy.get('[data-testid=delete-backup-modal] button[data-testid=cancel-delete-button]').click();

    // index
    cy.visit(`https://${region}.console.aws.amazon.com/dynamodbv2/home?region=${region}#table?initialTagKey=&name=autofill-delete-test-globaltable&tab=indexes`);
    cy.get('[data-testid=polaris-app-layout] main .detailsContainer table >tbody > tr:first-child input[type=radio]').click() // first index
    cy.get('[data-testid=polaris-app-layout] main .detailsContainer awsui-table [class*=awsui-table-header] [class*=awsui_actions] > div > div:first-child button[type=submit]').click() // delete button
    cy.get('.awsui-modal-footer button[data-testid=submit-form]').should('not.be.disabled');
    cy.get('.awsui-modal-footer button[data-testid=cancel-form]').click();

    // replica (global table)
    cy.visit(`https://${region}.console.aws.amazon.com/dynamodbv2/home?region=${region}#table?initialTagKey=&name=autofill-delete-test-globaltable&tab=globalTables`);
    cy.get('[data-testid=polaris-app-layout] main .detailsContainer table > tbody > tr:first-child input[type=radio]').click() // first replica
    cy.get('[data-testid=polaris-app-layout] main .detailsContainer [class*=awsui_header] [class*=awsui_actions] > div > div:nth-child(2) button[type=submit]').click() // delete button
    cy.get('[class*=awsui_dialog] [class*=awsui_footer] [class*=awsui_child]:last-child button[type=submit]').should('not.be.disabled');
    cy.get('[class*=awsui_dialog] [class*=awsui_header] [class*=awsui_actions] button[class*=awsui_dismiss-control]').click();

    // ensure creation modal input is not autofilled (create local index modal)
    cy.visit(`https://${region}.console.aws.amazon.com/dynamodbv2/home?region=${region}#create-table`);
    cy.get('div[role=radiogroup] [data-value=CUSTOMIZED] input[value=CUSTOMIZED][type=radio]').click();
    cy.get('button[data-testid=create-lsi]').click();
    cy.get('[data-testid=sort-key-input-field] > input[type=text]').should('be.empty');
    cy.get('[class*=awsui_dialog] [class*=awsui_footer] button[data-testid=cancel-form]').click();

    // COGNITO
    // Old interface
    cy.visit(`https://${region}.console.aws.amazon.com/cognito/users?region=${region}`);
    // user pool
    cy.get('main .cog-container-full article.cog-card-pool:first-child').click(); // select first user pool
    cy.wait(1000); // wait otherwise it gets the create user pool button from the previous page
    cy.get('button[data-reactid=".0.2.0.0.1.0"]').click(); // delete pool button
    cy.get('button[data-reactid=".0.2.0.1.0.1.0.0.0.0.2"]').should('have.attr', 'aria-disabled', 'false');
    cy.get('div[data-reactid=".0.2.0.1.0.1.0.0.0.0.0"]').click(); // close modal

    // group
    cy.get('.cog-pool-nav a[data-reactid=".0.2.0.1.0.0.0.1.0.0"]').click(); // User and groups
    cy.get('button[data-reactid=".0.2.0.1.0.1.0.0.1"]').click(); // Groups
    cy.get('table.cog-group-table > tbody > tr:first-child > td > a').click(); // select first group
    cy.get('button[data-reactid=".0.2.0.1.0.1.0.0.2.0"]').click(); // delete group
    cy.get('button[data-reactid=".0.2.0.1.0.1.0.0.3.0.2"]').should('have.attr', 'aria-disabled', 'false');
    cy.get('div[data-reactid=".0.2.0.1.0.1.0.0.3.0.0"]').click(); // close modal

    // ensure creation modal is not autofilled (create group)
    cy.get('.cog-pool-nav a[data-reactid=".0.2.0.1.0.0.0.1.0.0"]').click(); // User and groups
    cy.get('button[data-reactid=".0.2.0.1.0.1.0.0.1"]').click(); // Groups
    cy.get('button[data-reactid=".0.2.0.1.0.1.0.0.2.1.1.0.0"]').click() // create group
    cy.get('input[type=text][data-reactid=".0.2.0.1.0.1.0.0.2.0.0.1.1.1"]').should('be.empty');
    cy.get('div[data-reactid=".0.2.0.1.0.1.0.0.2.0.0.0"]').click() // close modal

    // New interface
    cy.visit(`https://${region}.console.aws.amazon.com/cognito/v2/idp/user-pools?region=${region}`);
    cy.get('main table > tbody > tr:first-child > td > a').click() // first user pool
    // user pool
    cy.get('main [class*=awsui_actions] > button[type=submit]').click(); // delete user pool
    cy.get('[data-testid=delete-user-modal] [data-testid=delete-cognito-domain-checkbox] input[type=checkbox]').click(); // check delete domain
    cy.get('[data-testid=delete-user-modal] button[data-testid=confirm]').should('not.be.disabled');
    cy.get('[data-testid=delete-user-modal] button[data-testid=cancel]').click();

    // user
    cy.get('[data-testid=users-table] table > tbody > tr:first-child > td input[type=radio]').click(); // select first user
    cy.get('[data-testid=users-table] [class*=awsui_actions] [class*=awsui_child]:nth-child(2) button[type=submit]').click() // delete user
    cy.get('[data-testid=delete-user-modal]:not([class*=awsui_hidden]) button[data-testid=confirm]').should('not.be.disabled');
    cy.get('[data-testid=delete-user-modal]:not([class*=awsui_hidden]) button[data-testid=cancel]').click(); 

    // group
    cy.get('[class*=awsui_tabs-header] a[role=tab][data-testid=groups]').click(); // tab groups
    cy.get('[data-testid=user-groups-table] table > tbody > tr:first-child > td input[type=radio]').click(); // select first group
    cy.get('[data-testid=user-groups-table] button[data-testid=delete-button]').click();
    cy.get('[data-testid=confirm-delete-group-modal]:not([class*=awsui_hidden]) button[data-testid=confirm]').should('not.be.disabled');
    cy.get('[data-testid=confirm-delete-group-modal]:not([class*=awsui_hidden]) button[data-testid=cancel]').click();

    // idp
    cy.get('[class*=awsui_tabs-header] a[role=tab][data-testid=sign-in]').click(); // tab sign-in experience
    cy.get('[role=tabpanel][id*=sign-in-panel] table > tbody > tr:first-child input[type=radio]').click() // select first idp
    cy.get('[role=tabpanel][id*=sign-in-panel] [data-testid=identity-providers-table-header] [class*=awsui_actions] [class*=awsui_child]:nth-child(2) button[type=submit]').click() // delete button
    cy.get('[data-testid=confirm-delete-modal]:not([class*=awsui_hidden]) button[data-testid=confirm]').should('not.be.disabled');
    cy.get('[data-testid=confirm-delete-modal]:not([class*=awsui_hidden]) button[data-testid=cancel]').click();

    // domain
    cy.get('[class*=awsui_tabs-header] a[role=tab][data-testid=app-integration]').click(); // tab app integration
    cy.get('[data-testid=domain-container] [class*=awsui_button-dropdown] button[type=button]').click(); // action dropdown
    cy.get('ul[class*=awsui_options-list] li[data-testid=delete-cognito-domain]').click();
    cy.get('[data-testid=cognito-domain-delete-modal]:not([class*=awsui_hidden]) button[data-testid=confirm]').should('not.be.disabled');
    cy.get('[data-testid=cognito-domain-delete-modal]:not([class*=awsui_hidden]) button[data-testid=cancel]').click();

    // app client
    cy.get('[data-testid=app-client-table] table > tbody > tr:first-child input[type=radio]').click(); // select first app client
    cy.get('[data-testid=app-client-table] [class*=awsui_actions] [class*=awsui_child]:nth-child(2) button[type=submit]').click() // delete
    cy.get('[data-testid=confirm-delete-modal]:not([class*=awsui_hidden]) button[data-testid=confirm]').should('not.be.disabled');
    cy.get('[data-testid=confirm-delete-modal]:not([class*=awsui_hidden]) button[data-testid=cancel]').click();

    // lambda trigger
    cy.get('[class*=awsui_tabs-header] a[role=tab][data-testid=properties]').click(); // tab user poll properties
    cy.get('[data-testid=lambda-triggers-table] table > tbody > tr:first-child input[type=radio]').click() // select first lambda trigger
    cy.get('[data-testid=lambda-triggers-table] [class*=awsui_actions] [class*=awsui_child]:nth-child(2) button[type=submit]').click() // delete
    cy.get('[data-testid=confirm-delete-lambda-trigger-modal]:not([class*=awsui_hidden]) button[data-testid=confirm]').should('not.be.disabled');
    cy.get('[data-testid=confirm-delete-lambda-trigger-modal]:not([class*=awsui_hidden]) button[data-testid=cancel]').click();

    // Can't test VPC
  });
});
