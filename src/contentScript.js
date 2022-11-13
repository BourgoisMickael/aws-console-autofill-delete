const { debounce, getLocation, getDocument, quotedWordRegex, autofill } = require('./utils');

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

const queries = {
    APIGATEWAY: [{
        function: function apigateway(doc) {
            const elem = doc.querySelector(".modal-content .modal-body input[ng-model=apiNameConfirm]")
            const text = doc.querySelector(".modal-content .modal-body .modal-warning-message [translate='API.DELETE_CONFIRMATION_TEXT']>strong")?.innerText
            elem && text && autofill(elem, text)
        }
    }, {
        condition: () => getLocation()?.includes('apigateway/main/publish/domain-names'),
        querySelector: 'body[class*=awsui-modal-open] .awsui-modal-body input[type=text][placeholder]'
    }],
    ATHENA: ["div[data-testid=confirm-with-friction-modal] div[data-testid=modal-friction-word] input[placeholder]"],
    DYNAMODBV2: [
        {
            // delete table
            condition: () => getLocation()?.endsWith('#tables'),
            querySelector: "body[class*=awsui_modal-open] [data-testid=delete-table-modal] div[data-testid=delete-table-input] input[placeholder]",
        },
        {
            // delete backup
            condition: () => getLocation()?.endsWith('#list-backups'),
            querySelector: "body[class*=awsui_modal-open] [data-testid=delete-backup-modal] [data-testid=input-delete-with-friction] input[placeholder]"
        },
        {
            // delete index
            condition: () => getLocation()?.includes('tab=indexes'),
            querySelector: "body[class*=awsui-modal-open] [data-testid=polaris-app-layout] .awsui-modal-body input[placeholder]"

        },
        {
            // delete replica (global table)
            condition: () => getLocation()?.includes('tab=globalTables'),
            querySelector: "body[class*=awsui_modal-open] [class*=awsui_dialog] input[placeholder]"
        }
    ],
    COGNITO: [
        // OLD INTERFACE
        {
            // delete pool and group
            condition: () => /cognito\/users.*#\/pool\/.+\/(?:details|groups\/)/.test(getLocation()),
            querySelector: '.columbia-modal input[type=text][id*=textfield]'
        },
        // NEW INTERFACE
        {
            // delete pool / user
            condition: () => getLocation()?.includes('cognito/v2/idp/user-pools'),
            querySelector: '[data-testid=delete-user-modal] input[type=text]:not([disabled])'
        },
        {
            // delete user / group / idp / cognito domain / custom domain / appclient / lambda trigger
            condition: () => getLocation()?.includes('cognito/v2/idp/user-pools'),
            querySelector: '[role=dialog]:not([class*=awsui_hidden]) [data-testid=additional-confirmation-section] input[type=text]'
        }
    ],
    DOCDB: [{
        function: function docdb(doc) {
            const base = "[class^=awsui_dialog]>[class^=awsui_container]>[class^=awsui_content]>[class^=awsui_root]>[class^=awsui_child]"
            const instanceText = doc.querySelector(base + ">[class^=awsui_root]>[class^=awsui_child]:last-child strong")
            const instanceElem = doc.querySelector(base + ">[class^=awsui_root]>[class^=awsui_child]:last-child input")
            const clusterText = doc.querySelector(base + ":last-child strong")
            const clusterElem = doc.querySelector(base + ":last-child input")
            if (instanceText && instanceElem) instanceElem && !instanceElem.disabled && autofill(instanceElem, instanceText.innerText)
            else clusterElem && !clusterElem.disabled && autofill(clusterElem, clusterText.innerText);
        }
    }],
    EVENTS: [
        // rule from list
        "#rules-section .awsui-modal-body input[placeholder]",
        // rule from detail
        "[data-test-selector=rule-action-modal] [data-test-selector=rule-action-modal-input] input[placeholder]",
        // global endpoint / archive / api destionations / connections
        {
            querySelector: 'input[name=endpoints-modal-delete-input], input[name=archives-modal-delete-input], input[name=apiDestinations-modal-delete-input], input[name=connections-modal-input], input[name=schemas-delete-registry]',
            text: doc => doc.querySelector('#modal-resource-name')?.innerText
        },
        // schema
        {
            condition: () => /events\/home.*?#\/registries\/.*?\/schemas\/.*/.test(getLocation()),
            // `label ~` allow to skip edit description modal as there is no label in this modal
            querySelector: 'body.awsui-modal-open awsui-modal [role=dialog]:not(.awsui-modal-hidden) awsui-form-field label ~ div input[type=text]',
            text: () => {
                const schema = /events\/home.*?#\/registries\/.*?\/schemas\/(.+?)(?:\/version\/\d+)?$/.exec(getLocation())?.[1]
                return schema && decodeURIComponent(schema);
            }
        }
    ],
    IAM: [
        // Users > Security credentials > Access keys
        '.delete-access-key-section input[placeholder]',
        // Users > Security credentials > HTTPS Git credentials for AWS CodeCommit | Credentials for Amazon Keyspaces (for Apache Cassandra)
        {
            // delete
            querySelector: 'delete-service-credential-modal input[type=text]',
            text: (doc) => quotedWordRegex.exec(doc.querySelector('delete-service-credential-modal label')?.innerText)?.[1]
        },
        {
            // reset password
            querySelector: 'service-credentials-reset-password-modal input[type=text]',
            text: (doc) => quotedWordRegex.exec(doc.querySelector('service-credentials-reset-password-modal label')?.innerText)?.[1]
        }
    ],
    IAMV2: [
        '#app #DELETE_GROUPS_MODAL input[placeholder]',
        "#app #DELETE_USERS_MODAL input[placeholder]",
        "#app #DELETE_ROLE_MODAL input[placeholder]",
        "#app #DELETE_POLICY_MODAL input[placeholder]",
        "#app #DELETE_IDP_MODAL input[placeholder]",
    ],
    LAMBDA: ['#function-list-delete-modal input[placeholder]'],
    S3: [
        "#app .delete-objects__form .delete-objects__input__input input[placeholder]", // delete objects
        "#app .empty-bucket .empty-bucket-actions .empty-bucket-actions__input input[placeholder]", // empty bucket
        "#app .delete-bucket-actions__form .delete-bucket-actions__input input[placeholder]", // delete bucket
        "#app .access-points-list awsui-modal.two-factor-confirmation-modal input[placeholder]", // delete access point
        "#app awsui-modal .global-confirmation-modal__two-factor input[placeholder]" // delete object lambda and multi region access point
    ],
    SINGLESIGNON: [
        "#delete-group-modal input[placeholder]"
    ],
    SNS: [
        // delete topic and phone number
        {
            condition: () => /topic|mobile\/text-messaging/.test(getLocation()),
            querySelector: "body[class*=awsui_modal-open] [class*=awsui_dialog] input[placeholder]"
        }
    ],
    SQS: ["#app #purge-queue-modal input[placeholder]", "#app #delete-queue-modal input[placeholder]"],
    VPC: ["body[class*=awsui-modal-open] [data-id=confirmation-modal-input] input[placeholder]"],
    WAFV2: [
        '.awsui-modal-body .awsui-form-field .awsui-form-field-control input[placeholder]'
    ]
};

async function queryFill(service, doc) {
    const defaultQueries = service && queries[service] || []

        for (const q of defaultQueries) {
            if (typeof q === 'object' && q.function) {
                q.function(doc)
            }
            else if (typeof q === 'object' && !q.function) {
                const elem = (q.condition ? q.condition() : true) && doc.querySelector(q.querySelector)
                if (elem) {
                    const value = q.text ? q.text(doc) : (!elem.disabled && elem.placeholder) || (service === 'COGNITO' ? 'delete' : undefined);
                    // console.debug("Found", elem, elem.disabled, value);
                    if (value) autofill(elem, value)
                }
            } else {
                const elem = doc.querySelector(q);
                if (elem) {
                    const value = !elem.disabled && elem.placeholder || (service === 'COGNITO' ? 'delete' : undefined);
                    // console.debug("Found", elem, elem.disabled, value);
                    if (value) autofill(elem, value)
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
    characterData: true
}

const iframes = {
    VPC: 'iframe#networking-react-frame'
}

const observer = new MutationObserver(function (_mutations, _observer) {
    const service = getService()
    const doc = getDocument()

    if (!service || !doc) return
    if (!iframes[service]) return debouncedQueryFill(service, doc)

    let iframe
    try {
        iframe = document.querySelector(iframes[service])
    } catch (e) {// catch security exception like cors
        console.warn('Caught error', e)
        return
    }

    if (iframe && iframe.contentDocument) {
        const iframeObserver = new MutationObserver(function () {
            debouncedQueryFill(service, iframe.contentDocument)
        })
        iframeObserver.observe(iframe.contentDocument, observerConfig)
    }
});

if (isCypressTest()) {
    const cypressObserver = new MutationObserver(function () {
        const doc = getDocument();

        if (doc && !doc.AWS_AUTOFILL_DELETE_IS_OBSERVED) {
            console.debug('Observe new document')
            observer.observe(doc, observerConfig);
            doc.AWS_AUTOFILL_DELETE_IS_OBSERVED = true;
        }
    });
    cypressObserver.observe(document, { attributes: true, childList: true, subtree: true })
} else {
    observer.observe(document, observerConfig);
}
