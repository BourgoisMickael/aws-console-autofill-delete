
export const isCypressTest = ()  =>  window.location.href.endsWith('__/#/specs/runner?file=cypress/e2e/aws.cy.js')

/** Get url during cypress testing */
export const getCypressUrl = () => 
    // With cypress open
    document.querySelector("input[data-cy=aut-url-input]")?.value 
    // With cypress run
    || document.querySelector("div[data-cy=aut-url]")?.innerText

/** Extracts service name from url */
export const getService = () => isCypressTest()
    ? getCypressUrl()?.split?.('/')?.[3]?.toUpperCase?.()
    : window.location.pathname.split?.("/")?.[1]?.toUpperCase?.();


export const getLocation = () => isCypressTest() ? getCypressUrl() : window.location.href;
export const getDocument = () => isCypressTest() ? document.querySelector('iframe.aut-iframe')?.contentDocument : document;

/**
 * Catch quotes in any language
 * @see https://en.wikipedia.org/wiki/Quotation_mark#Unicode_code_point_table
 */
export const quoteRegex = /["'«»‘’‚‛“”„‟‹›⹂⌜⌝❛❜❝❞🙶🙷🙸⠴⠦「」『』〝〞〟﹁﹂﹃﹄＂＇｢｣《》〈〉]/
/** Quoted word in any language */
export const quotedWordRegex = new RegExp(`${quoteRegex.source}\\s*(.*?)\\s*${quoteRegex.source}`);

/** Autofills an input element */
export function autofill(elem, data) {
    if (!elem) return
    if (elem.value === data) return;
    // let lastFocus = document.activeElement; // nothing to do with previous focus
    elem.focus();
    elem.select();
    elem.value = data;
    elem.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Originally inspired by  David Walsh (https://davidwalsh.name/javascript-debounce-function)
 * Returns a function, that, as long as it continues to be invoked, will not be triggered.
 * The function will be called after it stops being called for `wait` milliseconds.
 */
 export function debounce(func, wait) {
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