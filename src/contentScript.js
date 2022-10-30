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

const queries = {
    S3: [
        "#app .delete-objects__form .delete-objects__input__input input[placeholder]",
        "#app .empty-bucket .empty-bucket-actions .empty-bucket-actions__input input[placeholder]",
        "#app .delete-bucket-actions__form .delete-bucket-actions__input input[placeholder]",
    ],
    SQS: ["#app #purge-queue-modal input[placeholder]", "#app #delete-queue-modal input[placeholder]"],
    SNS: ["#app .awsui-modal-body input[placeholder]"],
    IAMV2: [
        "#app #DELETE_USERS_MODAL input[placeholder]",
        "#app #DELETE_ROLE_MODAL input[placeholder]",
        "#app #DELETE_POLICY_MODAL input[placeholder]",
        "#app #DELETE_IDP_MODAL input[placeholder]",
    ],
    IAM: [
        '.delete-access-key-section input[placeholder]'
    ],
    DYNAMODBV2: [
        "div[data-testid=delete-table-modal] div[data-testid=delete-table-input] input[placeholder]",
        ".awsui-modal-body input[placeholder]"
        // Nothing else for index or replica / global table
        // For the last one no mutation is triggered so quickly press refresh then delete button to fill...
    ],
    COGNITO: [
        "div[data-testid=additional-confirmation-section] input[placeholder]",
        ".columbia-modal input[type='text'][id*='textfield']"
        // this should work for all modals like
        // [data-testid=cognito-domain-delete-modal]
        // [data-testid=delete-user-modal]
        // [data-testid=confirm-delete-group-modal]
    ],
    VPC: ["[data-id=confirmation-modal-input] input[placeholder]"],
    ATHENA: ["div[data-testid=confirm-with-friction-modal] div[data-testid=modal-friction-word] input[placeholder]"],
    SINGLESIGNON: [
        "#delete-group-modal input[placeholder]"
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
    APIGATEWAY: [{
        function: function apigateway(doc) {
            const elem = doc.querySelector(".modal-content .modal-body input[ng-model=apiNameConfirm]")
            const text = doc.querySelector(".modal-content .modal-body .modal-warning-message [translate='API.DELETE_CONFIRMATION_TEXT']>strong")?.innerText
            elem && text && autofill(elem, text)
        }
    }],
    WAFV2: [
        '.awsui-modal-body .awsui-form-field .awsui-form-field-control input[placeholder]'
    ],
    LAMBDA: ['#function-list-delete-modal input[placeholder]']
};

async function queryFill(service, doc) {
    const defaultQueries = service && queries[service] || []

        for (const q of defaultQueries) {
            if (typeof q === 'object' && q.function) {
                q.function(doc)
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

const isCypressTest = ()  =>  window.location.href.endsWith('__/#/specs/runner?file=cypress/e2e/aws.cy.js')
const getService = () => isCypressTest()
    ? document.querySelector("input[data-cy=aut-url-input]")?.value?.split?.('/')?.[3]?.toUpperCase?.()
    : window.location.pathname.split?.("/")?.[1]?.toUpperCase?.();

const observer = new MutationObserver(function (_mutations, _observer) {
    const service = getService()

    // check for iframes like for VPC pages
    /*
    let iframes;
    try {
        iframes = document.querySelectorAll('iframe')
    } catch (e) { // catch security exception blocking cross-origin iframes
        console.warn('Caught error', e)
        return;
    }
    for (const iframe of iframes) {
        const iframeDocument = iframe.contentWindow.document;
        const iframeObserver = new MutationObserver(function (_iframeMutation, _iframeObs) {
            if (service) debouncedQueryFill(service, iframeDocument)
        })
        iframeObserver.observe(iframeDocument, observerConfig)
    }
    */

    if (!service) {
        throw new Error("Failing parsing window.location to detect service");
    }

    debouncedQueryFill(service, document);
});

observer.observe(document, observerConfig);

chrome.runtime.onMessage.addListener(function messageListener(request, _sender, sendResponse) {
    const service = getService()

    console.debug('onMessage', request, service)
    debouncedQueryFill(service, document);
    sendResponse(1)
})

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