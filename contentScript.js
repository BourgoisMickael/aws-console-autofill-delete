MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

function autofill(elem, data) {
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
        "input[placeholder=delete]",
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
    ATHENA: ["div[data-testid=confirm-with-friction-modal]  div[data-testid=modal-friction-word] input[placeholder]"],
    SINGLESIGNON: [
        "#delete-group-modal input[placeholder]"
    ]
};

async function queryFill(service, doc) {
    const defaultQueries = service && queries[service] || ['input[placeholder*=delete]'] // contains delete

        for (const q of defaultQueries) {
            const elem = doc.querySelector(q);
            if (elem) {
                console.debug("Found", elem, elem.disabled);
                !elem.disabled && autofill(elem, elem.placeholder || 'delete');
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
const observer = new MutationObserver(function (_mutations, _observer) {
    const service = window.location.pathname.split?.("/")?.[1]?.toUpperCase?.();

    // check for iframes like for VPC pages
    const iframes = document.querySelectorAll('iframe')
    for (const iframe of iframes) {
        const iframeDocument = iframe.contentWindow.document;
        const iframeObserver = new MutationObserver(function (_iframeMutation, _iframeObs) {
            if (service) debouncedQueryFill(service, iframeDocument)
        })
        iframeObserver.observe(iframeDocument, observerConfig)
    }

    if (!service) {
        throw new Error("Failing parsing window.location to detect service");
    }

    debouncedQueryFill(service, document);
});

observer.observe(document, observerConfig);

chrome.runtime.onMessage.addListener(function messageListener(request, _sender, sendResponse) {
    const service = window.location.pathname.split?.("/")?.[1]?.toUpperCase?.();

    console.debug('onMessage', request, service)
    debouncedQueryFill(service);
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
