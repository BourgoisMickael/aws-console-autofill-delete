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
    cy.wait(3000); // wait some time for extention to potentially fill input
    cy.get('[class*=awsui_dialog] [data-testid=sort-key-input-field] > input[type=text]').invoke('val').its('length').should('eq', 0);
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
    cy.wait(3000); // wait some time for extention to potentially fill input
    cy.get('input[type=text][data-reactid=".0.2.0.1.0.1.0.0.2.0.0.1.1.1"]').invoke('val').its('length').should('eq', 0);
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

    // TODO DOCDB

    // EVENTBRIDGE
    // rule from list
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/rules`);
    cy.get('#rules-section table > tbody > tr:first-child input[type=checkbox]').click(); // select first rule
    cy.get('#rules-table-delete-rule > button').click(); // delete
    cy.get('.awsui-modal-dialog #rules-table-confirm button').should('not.be.disabled');
    cy.get('.awsui-modal-dialog #rules-table-dismiss button').click();
    // rule from detail
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/eventbus/default/rules/autofill-delete-test-eventrule`);
    cy.get('button#rules-details-delete-rule').click(); // delete
    cy.get('button[data-test-selector=rule-action-modal-confirm-button]').should('not.be.disabled');
    cy.get('button[data-test-selector=rule-action-modal-dismiss-button]').click();

    // global endpoint from list
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/global-endpoints`)
    cy.get('#multiverse-table table > tbody > tr:first-child input[type=radio]').click(); // select first endpoint
    cy.get('#endpoints-table-delete button').click(); // delete
    cy.get('#endpoints-modal-confirm button').should('not.be.disabled');
    cy.get('#endpoints-modal-cancel button').click();
    // global endpoint from detail
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/global-endpoints`)
    cy.get('#multiverse-table table > tbody > tr:first-child > td:nth-child(2) a').click() // first endpoint link
    cy.wait(1000); // wait because page changes and we need to get new button with same id from previous page
    cy.get('#endpoints-table-delete button').click() // delete
    cy.get('#endpoints-modal-confirm button').should('not.be.disabled');
    cy.get('#endpoints-modal-cancel button').click();

    // archive from list
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/archives`);
    cy.get('#archives-table table > tbody > tr:first-child input[type=radio]').click() // select first archive
    cy.get('#archives-table #archives-table-delete button').click(); // delete
    cy.get('#archives-modal-confirm > button').should('not.be.disabled');
    cy.get('#archives-modal-cancel > button').click();
    // archive from detail
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/archive/autofill-delete-test-archive`);
    cy.get('#archives-table-delete button').click(); // delete
    cy.get('#archives-modal-confirm > button').should('not.be.disabled');
    cy.get('#archives-modal-cancel > button').click();

    // api destinations from list
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/apidestinations`);
    cy.get('[role=tabpanel][id*=apiDestinationTabId-panel] table > tbody > tr:first-child input[type=radio]').click(); // select first destination
    cy.get('[role=tabpanel][id*=apiDestinationTabId-panel] #apidestinations-action-group-delete').click(); // delete
    cy.get('#apiDestinations-modal-confirm button').should('not.be.disabled');
    cy.get('#apidestinations-modal-cancel button').click();

    // connections from list
    cy.get('[role=tab][data-testid=connectionTabId]').click(); // connections
    cy.get('[role=tabpanel][id*=connectionTabId-panel] table > tbody > tr:first-child input[type=radio]').click(); // select first destination
    cy.get('[role=tabpanel][id*=connectionTabId-panel] #connections-action-group-delete').click(); // delete
    cy.get('#connections-modal-confirm button').should('not.be.disabled');
    cy.get('#connections-modal-cancel button').click();

    // api destinations from detail
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/apidestinations/autofill-delete-test-apidestination`);
    cy.get('#apidestinations-action-group-delete').click(); // delete
    cy.get('#apiDestinations-modal-confirm button').should('not.be.disabled');
    cy.get('#apidestinations-modal-cancel button').click();

    // connections from detail
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/connections/autofill-delete-test-connection`);
    cy.get('#connections-action-group-delete button').click() // delete
    cy.get('#connections-modal-confirm button').should('not.be.disabled');
    cy.get('#connections-modal-cancel button').click();

    // schema registry
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/schemas?registry=autofill-delete-test-registry`);
    cy.get('[id$=registry-details-panel] awsui-button:first-child button').click(); // delete
    cy.get('#schemas-modal-delete_registry button').should('not.be.disabled');
    cy.get('[role=dialog]:not([class*=awsui-modal-hidden]) .awsui-modal-dismiss-control').click();

    // schema
    cy.visit(`https://${region}.console.aws.amazon.com/events/home?region=${region}#/registries/autofill-delete-test-registry/schemas/autofill-delete-test-schema%40schema`);
    cy.get('div:has(~ #schema-details-content):first-child .awsui-util-action-stripe-group button').click(); // delete
    cy.get('[role=dialog]:not([class*=awsui-modal-hidden]) #table-confirm').should('not.be.disabled');
    cy.get('[role=dialog]:not([class*=awsui-modal-hidden]) #table-dismiss').click();

    // ensure description modal is not filled
    cy.get('div:has(+ #schema-details-content) .awsui-util-action-stripe-group button').click(); // edit description
    cy.wait(3000); // wait some time for extention to potentially fill input
    cy.get('[role=dialog]:not([class*=awsui-modal-hidden]) input[type=text').invoke('val').its('length').should('eq', 0);
    cy.get('[role=dialog]:not([class*=awsui-modal-hidden]) #table-dismiss').click();

    // IAM > user credentials
    // Access keys
    cy.visit(`https://us-east-1.console.aws.amazon.com/iam/home#/users/autofill-delete-test-user?section=security_credentials`);
    cy.get('#iam-content').scrollTo('center'); // otherwise it can't find the element below
    cy.get('.user-credentials-access-keys iam-table .body .data:first-child .cell:last-child span').click(); // first access key
    cy.get('delete-access-key-modal-destructive-action .awsui-modal-footer .modal-confirm button').should('not.be.disabled');
    cy.get('delete-access-key-modal-destructive-action .awsui-modal-footer .modal-cancel button').click();
    // HTTPS Git credentials for AWS CodeCommit
    // Delete
    cy.get('service-credentials[service-name=codecommit] iam-table .body .data:first-child iam-radio').click(); // select first creds
    cy.get('service-credentials[service-name=codecommit] dropdown.actions-button > .dropdown > awsui-button button').click(); // Actions
    cy.get('service-credentials[service-name=codecommit] dropdown.actions-button > .dropdown > ul > menu-item.delete').click(); // delete
    cy.get('delete-service-credential-modal input[type=text]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('delete-service-credential-modal awsui-button.modal-cancel button').click();
    // Reset password
    cy.get('service-credentials[service-name=codecommit] dropdown.actions-button > .dropdown > ul > menu-item.reset').click(); // reset
    cy.get('service-credentials-reset-password-modal input[type=text]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('service-credentials-reset-password-modal awsui-button.modal-cancel button').click();
    // Credentials for Amazon Keyspaces (for Apache Cassandra)
    // Delete
    cy.get('service-credentials[service-name=cassandra] iam-table .body .data:first-child iam-radio').click(); // select first creds
    cy.get('service-credentials[service-name=cassandra] dropdown.actions-button > .dropdown > awsui-button button').click(); // Actions
    cy.get('service-credentials[service-name=cassandra] dropdown.actions-button > .dropdown > ul > menu-item.delete').click(); // delete
    cy.get('delete-service-credential-modal input[type=text]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('delete-service-credential-modal awsui-button.modal-cancel button').click();
    // Reset password
    cy.get('service-credentials[service-name=cassandra] dropdown.actions-button > .dropdown > ul > menu-item.reset').click(); // reset
    cy.get('service-credentials-reset-password-modal input[type=text]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('service-credentials-reset-password-modal awsui-button.modal-cancel button').click();

    // IAM
    // groups
    cy.visit('https://us-east-1.console.aws.amazon.com/iamv2/home#/groups')
    cy.get('.group-table table > tbody > tr:first-child input[type=checkbox]').click(); // select first group
    cy.get('.awsui-group-delete-button button').click(); // delete
    cy.get('#app #DELETE_GROUPS_MODAL input[placeholder]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('#DELETE_GROUPS_MODAL [data-cy=cancel-modal] button').click();
    // users
    cy.visit('https://us-east-1.console.aws.amazon.com/iamv2/home#/users')
    cy.get('#users-list table > tbody > tr:first-child input[type=checkbox]').click(); // select first user
    cy.get('.awsui-user-delete-button button').click(); // delete
    cy.get('#app #DELETE_USERS_MODAL input[placeholder]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('#DELETE_USERS_MODAL [data-cy=cancel-modal] button').click();
    // roles
    cy.visit('https://us-east-1.console.aws.amazon.com/iamv2/home#/roles')
    cy.get('#roles-list table > tbody > tr:first-child input[type=checkbox]').click(); // select first role
    cy.get('.awsui-role-delete-button button').click(); // delete
    cy.get('#app #DELETE_ROLE_MODAL input[placeholder]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('#DELETE_ROLE_MODAL [data-cy=cancel-modal] button').click();
    // policies
    cy.visit('https://us-east-1.console.aws.amazon.com/iamv2/home#/policies')
    cy.get('#policies-list-view-table table > tbody > tr:first-child input[type=radio]').click(); // select first policy
    cy.get('awsui-button-dropdown#POLICY_LIST_ACTIONS').click(); // action dropdown
    cy.get('awsui-button-dropdown#POLICY_LIST_ACTIONS li[data-testid=delete]').click(); // delete
    cy.get('#app #DELETE_POLICY_MODAL input[placeholder]').invoke('val').should('have.length.greaterThan', 0); // check input not empty because button is not disabled
    cy.get('#DELETE_POLICY_MODAL [data-cy=cancel-modal] button').click();
    // TODO IDP

    // Lambda
    cy.visit(`https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions`);
    cy.get('#lambda-listFunctions table > tbody > tr:first-child input[type=checkbox]').click(); // select first function
    cy.get('#lambda-listFunctions [class*=awsui_actions] [class*=awsui_button-dropdown] button').click() // action dropdown
    cy.get('#lambda-listFunctions [class*=awsui_actions] [class*=awsui_button-dropdown] li[data-testid=delete]').click(); // delete
    cy.get('#function-list-delete-modal [class*=awsui_footer] [class*=awsui_child]:last-child button').should('not.be.disabled');
    cy.get('#function-list-delete-modal [class*=awsui_footer] [class*=awsui_child]:first-child button').click();

    // Can't test VPC
  });
});
