MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

function autofill(elem, data) {
    if (!elem) return
    if (elem.value === data) return;
    // let lastFocus = document.activeElement; // nothing to do with previous focus
    elem.focus();
    elem.select();
    elem.value = data;
    elem.dispatchEvent(new Event("input", { bubbles: true }));
}

const isCypressTest = ()  =>  window.location.href.endsWith('__/#/specs/runner?file=cypress/e2e/aws.cy.js')
const getCypressUrl = () => document.querySelector("input[data-cy=aut-url-input]")?.value || document.querySelector("div[data-cy=aut-url]")?.innerText
const getService = () => isCypressTest()
    ? getCypressUrl()?.split?.('/')?.[3]?.toUpperCase?.()
    : window.location.pathname.split?.("/")?.[1]?.toUpperCase?.();

const getLocation = () => isCypressTest() ? getCypressUrl() : window.location.href;
const getDocument = () => isCypressTest() ? document.querySelector('iframe.aut-iframe')?.contentDocument : document;

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
    EVENTS: [{
        function: function events(doc) {
            const schemaElem = doc.querySelector("#schema-details-content");
            if (schemaElem) return // Too much text in <strong>. Can't perform language insensitive autofill

            const archiveElem = doc.querySelector("#archives-table .awsui-modal-body input[placeholder]")
            if (archiveElem) return autofill(archiveElem, doc.querySelector("#archives-table .awsui-modal-body strong")?.innerText)

            const archiveElem2 = doc.querySelector(".awsui-modal-body input[name=archives-modal-delete-input][placeholder]");
            if (archiveElem2) return autofill(archiveElem2, doc.querySelector(".awsui-modal-body strong")?.innerText)

            const apiDestConnElem = doc.querySelector(".awsui-modal-body input[name=connections-modal-input][placeholder]");
            if (apiDestConnElem) return autofill(apiDestConnElem, doc.querySelector(".awsui-modal-body strong")?.innerText)

            const apiDestElem = doc.querySelector("[id$=apiDestinationTabId-panel] .awsui-modal-body input[placeholder]")
            if (apiDestElem) return autofill(apiDestElem, doc.querySelector("[id$=apiDestinationTabId-panel] .awsui-modal-body strong")?.innerText);

            const apiDestElem2 = doc.querySelector(".awsui-modal-body input[name=apiDestinations-modal-delete-input][placeholder]");
            if (apiDestElem2) return autofill(apiDestElem2, doc.querySelector(".awsui-modal-body strong")?.innerText)

            const defaultElem = doc.querySelector("[data-test-selector=rule-action-modal] input[placeholder]")
                || doc.querySelector(".awsui-modal-body input[placeholder]")
            defaultElem && autofill(defaultElem, defaultElem.placeholder)
        }
    }],
    IAM: [
        '.delete-access-key-section input[placeholder]'
    ],
    IAMV2: [
        "#app #DELETE_USERS_MODAL input[placeholder]",
        "#app #DELETE_ROLE_MODAL input[placeholder]",
        "#app #DELETE_POLICY_MODAL input[placeholder]",
        "#app #DELETE_IDP_MODAL input[placeholder]",
    ],
    LAMBDA: ['#function-list-delete-modal input[placeholder]'],
    S3: [
        "#app .delete-objects__form .delete-objects__input__input input[placeholder]",
        "#app .empty-bucket .empty-bucket-actions .empty-bucket-actions__input input[placeholder]",
        "#app .delete-bucket-actions__form .delete-bucket-actions__input input[placeholder]",
    ],
    SINGLESIGNON: [
        "#delete-group-modal input[placeholder]"
    ],
    SNS: ["#app .awsui-modal-body input[placeholder]"],
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
                const elem = q.condition() && doc.querySelector(q.querySelector)
                if (elem) {
                    const value = !elem.disabled && elem.placeholder || (service === 'COGNITO' ? 'delete' : undefined);
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

    if (!service) return
    if (!iframes[service]) return debouncedQueryFill(service, getDocument())

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

/*
chrome.runtime.onMessage.addListener(function messageListener(request, _sender, sendResponse) {
    const service = getService()

    console.debug('onMessage', request, service)
    debouncedQueryFill(service, document);
    sendResponse(1)
})
*/

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