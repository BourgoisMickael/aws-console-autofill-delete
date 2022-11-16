const isCypressTest = () => window.location.href.endsWith('__/#/specs/runner?file=cypress/e2e/aws.cy.js');

/** Get url during cypress testing */
const getCypressUrl = () =>
  // With cypress open
  document.querySelector('input[data-cy=aut-url-input]')?.value ||
  // With cypress run
  document.querySelector('div[data-cy=aut-url]')?.innerText;

/** Extracts service name from url */
const getService = () =>
  isCypressTest()
    ? getCypressUrl()?.split?.('/')?.[3]?.toUpperCase?.()
    : window.location.pathname.split?.('/')?.[1]?.toUpperCase?.();

const getLocation = () => (isCypressTest() ? getCypressUrl() : window.location.href);
const getDocument = () => (isCypressTest() ? document.querySelector('iframe.aut-iframe')?.contentDocument : document);

/**
 * Catch quotes in any language
 * @see https://en.wikipedia.org/wiki/Quotation_mark#Unicode_code_point_table
 */
// eslint-disable-next-line no-misleading-character-class
const quoteRegex = /["'«»‘’‚‛“”„‟‹›⹂⌜⌝❛❜❝❞🙶🙷🙸⠴⠦「」『』〝〞〟﹁﹂﹃﹄＂＇｢｣《》〈〉]/;
/** Quoted word in any language */
const quotedWordRegex = new RegExp(`${quoteRegex.source}\\s*(.*?)\\s*${quoteRegex.source}`);

const queries = {
  ACM: [
    '#deleteTextInput input[placeholder]',
    {
      condition: () => getLocation()?.endsWith('#/certificates/list'),
      querySelector:
        'list-certificates [role=dialog]:not([class*=awsui-modal-hidden]) .awsui-modal-body input[placeholder]',
    },
  ],
  APIGATEWAY: [
    {
      function: function apigateway(doc) {
        const elem = doc.querySelector('.modal-content .modal-body input[ng-model=apiNameConfirm]');
        const text = doc.querySelector(
          ".modal-content .modal-body .modal-warning-message [translate='API.DELETE_CONFIRMATION_TEXT']>strong"
        )?.innerText;
        elem && text && autofill(elem, text);
      },
    },
    {
      condition: () => getLocation()?.includes('apigateway/main/publish/domain-names'),
      querySelector: 'body[class*=awsui-modal-open] .awsui-modal-body input[type=text][placeholder]',
    },
  ],
  ATHENA: ['div[data-testid=confirm-with-friction-modal] div[data-testid=modal-friction-word] input[placeholder]'],
  DYNAMODBV2: [
    {
      // delete table
      condition: () => getLocation()?.endsWith('#tables'),
      querySelector:
        'body[class*=awsui_modal-open] [data-testid=delete-table-modal] div[data-testid=delete-table-input] input[placeholder]',
    },
    {
      // delete backup
      condition: () => getLocation()?.endsWith('#list-backups'),
      querySelector:
        'body[class*=awsui_modal-open] [data-testid=delete-backup-modal] [data-testid=input-delete-with-friction] input[placeholder]',
    },
    {
      // delete index
      condition: () => getLocation()?.includes('tab=indexes'),
      querySelector:
        'body[class*=awsui-modal-open] [data-testid=polaris-app-layout] .awsui-modal-body input[placeholder]',
    },
    {
      // delete replica (global table)
      condition: () => getLocation()?.includes('tab=globalTables'),
      querySelector: 'body[class*=awsui_modal-open] [class*=awsui_dialog] input[placeholder]',
    },
  ],
  CLOUDWATCH: [
    {
      // Metrics Streams
      condition: () => getLocation()?.includes('metric-streams'),
      querySelector: 'body[class*=awsui-modal-open] #delete-stream-confirmation + awsui-input input[placeholder]',
    },
  ],
  COGNITO: [
    // OLD INTERFACE
    {
      // delete pool and group
      condition: () => /cognito\/users.*#\/pool\/.+\/(?:details|groups\/)/.test(getLocation()),
      querySelector: '.columbia-modal input[type=text][id*=textfield]',
    },
    // NEW INTERFACE
    {
      // delete pool / user
      condition: () => getLocation()?.includes('cognito/v2/idp/user-pools'),
      querySelector: '[data-testid=delete-user-modal] input[type=text]:not([disabled])',
    },
    {
      // delete user / group / idp / cognito domain / custom domain / appclient / lambda trigger
      condition: () => getLocation()?.includes('cognito/v2/idp/user-pools'),
      querySelector:
        '[role=dialog]:not([class*=awsui_hidden]) [data-testid=additional-confirmation-section] input[type=text]',
    },
  ],
  DOCDB: [
    {
      function: function docdb(doc) {
        const base =
          '[class^=awsui_dialog]>[class^=awsui_container]>[class^=awsui_content]>[class^=awsui_root]>[class^=awsui_child]';
        const instanceText = doc.querySelector(base + '>[class^=awsui_root]>[class^=awsui_child]:last-child strong');
        const instanceElem = doc.querySelector(base + '>[class^=awsui_root]>[class^=awsui_child]:last-child input');
        const clusterText = doc.querySelector(base + ':last-child strong');
        const clusterElem = doc.querySelector(base + ':last-child input');
        if (instanceText && instanceElem)
          instanceElem && !instanceElem.disabled && autofill(instanceElem, instanceText.innerText);
        else clusterElem && !clusterElem.disabled && autofill(clusterElem, clusterText.innerText);
      },
    },
  ],
  EC2: [
    // Instances > Launch Template
    '[data-id=delete-launch-template-modal] [data-id=friction-input] input[placeholder]',
    // Network & Security > Placement Groups | Key Pairs | Flow logs (network interfaces)
    '[data-id=confirmation-modal] [data-id=confirmation-modal-input] input[placeholder]',
    // Load balancer > Listener & certificates for SNI
    {
      condition: () => getLocation()?.includes('#ELBListenerV2'),
      querySelector: '#elb_polaris ~ div [role=dialog]:not([class*=awsui_hidden]) input[placeholder',
    },
    // Auto Scaling Groups
    {
      condition: () => getLocation()?.includes('#AutoScalingGroups'),
      querySelector: '#asg ~ div [role=dialog]:not([class*=awsui_hidden]) input[placeholder',
    },
  ],
  ELASTICBEANSTALK: [
    {
      condition: () => getLocation()?.includes('application'),
      querySelector:
        'body.awsui-modal-open awsui-modal[ng-controller=DeleteApplicationModalController] input[name=applicationName]',
      text: (doc) =>
        doc.querySelector(
          'body.awsui-modal-open awsui-modal[ng-controller=DeleteApplicationModalController] .modal-body p > strong'
        )?.innerText,
    },
    {
      condition: () => getLocation()?.includes('environment'),
      querySelector:
        'body.awsui-modal-open awsui-modal[ng-controller=TerminateEnvironmentModalController] input[name=environmentName]',
      text: (doc) =>
        doc.querySelector(
          'body.awsui-modal-open awsui-modal[ng-controller=TerminateEnvironmentModalController] .awsui-modal-body p > strong'
        )?.innerText,
    },
  ],
  EVENTS: [
    // rule from list
    '#rules-section .awsui-modal-body input[placeholder]',
    // rule from detail
    '[data-test-selector=rule-action-modal] [data-test-selector=rule-action-modal-input] input[placeholder]',
    // global endpoint / archive / api destionations / connections
    {
      querySelector:
        'input[name=endpoints-modal-delete-input], input[name=archives-modal-delete-input], input[name=apiDestinations-modal-delete-input], input[name=connections-modal-input], input[name=schemas-delete-registry]',
      text: (doc) => doc.querySelector('#modal-resource-name')?.innerText,
    },
    // schema
    {
      condition: () => /events\/home.*?#\/registries\/.*?\/schemas\/.*/.test(getLocation()),
      // `label ~` allow to skip edit description modal as there is no label in this modal
      querySelector:
        'body.awsui-modal-open awsui-modal [role=dialog]:not(.awsui-modal-hidden) awsui-form-field label ~ div input[type=text]',
      text: () => {
        const schema = /events\/home.*?#\/registries\/.*?\/schemas\/(.+?)(?:\/version\/\d+)?$/.exec(getLocation())?.[1];
        return schema && decodeURIComponent(schema);
      },
    },
  ],
  FIREHOSE: ['body[class*=awsui_modal-open] [data-analytics=deleteConfirm] input[placeholder]'],
  IAM: [
    // Users > Security credentials > Access keys
    '.delete-access-key-section input[placeholder]',
    // Users > Security credentials > HTTPS Git credentials for AWS CodeCommit | Credentials for Amazon Keyspaces (for Apache Cassandra)
    {
      // delete
      querySelector: 'delete-service-credential-modal input[type=text]',
      text: (doc) => quotedWordRegex.exec(doc.querySelector('delete-service-credential-modal label')?.innerText)?.[1],
    },
    {
      // reset password
      querySelector: 'service-credentials-reset-password-modal input[type=text]',
      text: (doc) =>
        quotedWordRegex.exec(doc.querySelector('service-credentials-reset-password-modal label')?.innerText)?.[1],
    },
  ],
  IAMV2: [
    '#app #DELETE_GROUPS_MODAL input[placeholder]',
    '#app #DELETE_USERS_MODAL input[placeholder]',
    '#app #DELETE_ROLE_MODAL input[placeholder]',
    '#app #DELETE_POLICY_MODAL input[placeholder]',
    '#app #DELETE_IDP_MODAL input[placeholder]',
  ],
  KINESIS: ['body[class*=awsui_modal-open] [data-analytics=deleteStreamModal] input[placeholder]'],
  KINESISANALYTICS: [
    // SQL applications (legacy)
    {
      // Application
      condition: () => /#\/sql\/.*?\/details|#\/list\/sql-applications-legacy/.test(getLocation()),
      querySelector: 'body[class*=awsui_modal-open] #DeleteApplicationModalInput input[placeholder]',
    },
    {
      // Destinations
      condition: () => getLocation()?.includes('sql') && getLocation()?.includes('/details/destinations'),
      querySelector: 'body[class*=awsui_modal-open] #sqlDisconnectResourceModalInput input[placeholder]',
    },
    // Studio notebooks and streaming applications
    {
      // notebook configuration: supported connectors
      condition: () => /#\/notebook\/.*?\/details\/configuration/.test(getLocation()),
      querySelector: 'body[class*=awsui_modal-open] #RemoveCustomArtifactModalInput input[placeholder]',
    },
    {
      // notebook and application
      condition: () =>
        /#\/(?:notebook|application)\/.*?\/details|#\/list\/(?:notebooks|applications)|#\/applications\/dashboard/.test(
          getLocation()
        ),
      querySelector: 'body[class*=awsui_modal-open] #DeleteApplicationModalInput input[placeholder]',
    },

    {
      // force stop notebook and application
      condition: () =>
        /#\/(?:notebook|application)\/.*?\/details|#\/list\/(?:notebooks|applications)|#\/applications\/dashboard/.test(
          getLocation()
        ),
      querySelector: 'body[class*=awsui_modal-open] #ForceStopApplicationModalInput input[placeholder]',
    },
  ],
  KMS: [
    // delete alias
    {
      querySelector: 'body.awsui-modal-open awsui-modal[data-integ=delete-alias-modal] input[type=text]',
      text: (doc) =>
        quotedWordRegex.exec(
          doc.querySelector('body.awsui-modal-open awsui-modal[data-integ=delete-alias-modal] awsui-form-field label')
            ?.innerText
        )?.[1],
    },
  ],
  LAMBDA: ['#function-list-delete-modal input[placeholder]'],
  ROUTE53: [
    {
      condition: () => getLocation()?.includes('route53/v2/hostedzones#CidrCollections'),
      querySelector: '[data-testid=delete-modal-input] input[placeholder]',
      text: (doc) =>
        // CIDR locations
        (
          doc.querySelector(
            '[data-testid=cidr-blocks-table] table > tbody > tr[class*=awsui_row-selected] > td:nth-child(2)'
          ) ||
          // CIDR collections
          doc.querySelector(
            '[data-testid=cidr-collections-table] table > tbody > tr[class*=awsui_row-selected] > td:nth-child(2)'
          )
        )?.innerText,
    },
    {
      // Hosted zone
      condition: () => /route53\/v2\/hostedzones(?:#?$|#ListRecordSets)/.test(getLocation()),
      querySelector: '[data-testid=delete-modal-input] input[placeholder]',
    },
  ],
  S3: [
    '#app .delete-objects__form .delete-objects__input__input input[placeholder]', // delete objects
    '#app .empty-bucket .empty-bucket-actions .empty-bucket-actions__input input[placeholder]', // empty bucket
    '#app .delete-bucket-actions__form .delete-bucket-actions__input input[placeholder]', // delete bucket
    '#app .access-points-list awsui-modal.two-factor-confirmation-modal input[placeholder]', // delete access point
    '#app awsui-modal .global-confirmation-modal__two-factor input[placeholder]', // delete object lambda and multi region access point
  ],
  SINGLESIGNON: ['#delete-group-modal input[placeholder]'],
  SNS: [
    // delete topic and phone number
    {
      condition: () => /topic|mobile\/text-messaging/.test(getLocation()),
      querySelector: 'body[class*=awsui_modal-open] [class*=awsui_dialog] input[placeholder]',
    },
  ],
  SQS: ['#app #purge-queue-modal input[placeholder]', '#app #delete-queue-modal input[placeholder]'],
  VPC: ['body[class*=awsui-modal-open] [data-id=confirmation-modal-input] input[placeholder]'],
  WAFV2: ['.awsui-modal-body .awsui-form-field .awsui-form-field-control input[placeholder]'],
};

async function queryFill(service, doc) {
  const defaultQueries = (service && queries[service]) || [];

  for (const q of defaultQueries) {
    if (typeof q === 'object' && q.function) {
      q.function(doc);
    } else if (typeof q === 'object' && !q.function) {
      const elem = (q.condition ? q.condition() : true) && doc.querySelector(q.querySelector);
      if (elem) {
        const value = q.text
          ? q.text(doc)
          : (!elem.disabled && elem.placeholder) || (service === 'COGNITO' ? 'delete' : undefined);
        // console.debug('Found', elem, elem.disabled, value);
        if (value) autofill(elem, value);
      }
    } else {
      const elem = doc.querySelector(q);
      if (elem) {
        const value = (!elem.disabled && elem.placeholder) || (service === 'COGNITO' ? 'delete' : undefined);
        // console.debug("Found", elem, elem.disabled, value);
        if (value) autofill(elem, value);
      }
    }
  }
}

const debouncedQueryFill = debounce(queryFill, 250);
/** Define what element should be observed by the observer and what types of mutations trigger the callback */
const observerConfig = {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: false,
};

const iframes = {
  CLOUDWATCH: ['iframe#microConsole-MetricStreams'],
  EC2: [
    // Launch template
    'iframe#instance-lx-react-frame',
    // Network & Security > Placement group | Key Pairs
    'iframe#compute-react-frame',
    // Network & Security > Network Interface
    'iframe#nic-react-frame',
    // Load Balancing
    'iframe#elb_polaris-frame',
    // Auto Scaling
    'iframe#asg-frame',
  ],
  VPC: ['iframe#networking-react-frame'],
};

const observer = new window.MutationObserver(function (_mutations, _observer) {
  const service = getService();
  const doc = getDocument();

  if (!service || !doc) return;
  if (!iframes[service]) return debouncedQueryFill(service, doc);

  for (const iframeSelector of iframes[service]) {
    let iframe;
    try {
      iframe = document.querySelector(iframeSelector);
    } catch (e) {
      // catch security exception like cors
      console.warn('Caught error', e);
      return;
    }

    if (iframe && iframe.contentDocument) {
      const iframeObserver = new window.MutationObserver(function () {
        debouncedQueryFill(service, iframe.contentDocument);
      });
      iframeObserver.observe(iframe.contentDocument, observerConfig);
    }
  }
});

if (isCypressTest()) {
  const cypressObserver = new window.MutationObserver(function () {
    const doc = getDocument();

    if (doc && !doc.AWS_AUTOFILL_DELETE_IS_OBSERVED) {
      console.debug('Observe new document');
      observer.observe(doc, observerConfig);
      doc.AWS_AUTOFILL_DELETE_IS_OBSERVED = true;
    }
  });
  cypressObserver.observe(document, { attributes: true, childList: true, subtree: true });
} else {
  observer.observe(document, observerConfig);
}

/** Autofills an input element */
function autofill(elem, data) {
  if (!elem) return;
  if (elem.value === data) return;
  // let lastFocus = document.activeElement; // nothing to do with previous focus
  elem.focus();
  elem.select();
  elem.value = data;
  elem.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Originally inspired by  David Walsh (https://davidwalsh.name/javascript-debounce-function)
 * Returns a function, that, as long as it continues to be invoked, will not be triggered.
 * The function will be called after it stops being called for `wait` milliseconds.
 */
function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
