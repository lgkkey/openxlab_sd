const styleColors = {
    "--results-neutral-text": ["#e0e0e0", "black"],
    "--results-bg": ["#0b0f19", "#ffffff"],
    "--results-border-color": ["#4b5563", "#e5e7eb"],
    "--results-border-width": ["1px", "1.5px"],
    "--results-bg-odd": ["#111827", "#f9fafb"],
    "--results-hover": ["#1f2937", "#f5f6f8"],
    "--results-selected": ["#374151", "#e5e7eb"],
    "--meta-text-color": ["#6b6f7b", "#a2a9b4"],
    "--embedding-v1-color": ["lightsteelblue", "#2b5797"],
    "--embedding-v2-color": ["skyblue", "#2d89ef"],
    "--live-translation-rt": ["whitesmoke", "#222"],
    "--live-translation-color-1": ["lightskyblue", "#2d89ef"],
    "--live-translation-color-2": ["palegoldenrod", "#eb5700"],
    "--live-translation-color-3": ["darkseagreen", "darkgreen"],
}
const browserVars = {
    "--results-overflow-y": {
        "firefox": "scroll",
        "other": "auto"
    }
}
const autocompleteCSS = `
    #quicksettings [id^=setting_tac] {
        background-color: transparent;
        min-width: fit-content;
    }
    .autocompleteParent {
        display: flex;
        position: absolute;
        z-index: 999;
        max-width: calc(100% - 1.5rem);
        margin: 5px 0 0 0;
    }
    .autocompleteResults {
        background-color: var(--results-bg) !important;
        border: var(--results-border-width) solid var(--results-border-color) !important;
        color: var(--results-neutral-text) !important;
        border-radius: 12px !important;
        height: fit-content;
        flex-basis: fit-content;
        flex-shrink: 0;
        overflow-y: var(--results-overflow-y);
        overflow-x: hidden;
        word-break: break-word;
    }
    .sideInfo {
        display: none;
        position: relative;
        margin-left: 10px;
        height: 18rem;
        max-width: 16rem;
    }
    .sideInfo > img {
        object-fit: cover;
        height: 100%;
        width: 100%;
    }
    .autocompleteResultsList > li:nth-child(odd) {
        background-color: var(--results-bg-odd);
    }
    .autocompleteResultsList > li {
        list-style-type: none;
        padding: 10px;
        cursor: pointer;
    }
    .autocompleteResultsList > li:hover {
        background-color: var(--results-hover);
    }
    .autocompleteResultsList > li.selected {
        background-color: var(--results-selected);
    }
    .resultsFlexContainer {
        display: flex;
    }
    .acListItem {
        white-space: break-spaces;
        min-width: 100px;
    }
    .acMetaText {
        position: relative;
        flex-grow: 1;
        text-align: end;
        padding: 0 0 0 15px;
        white-space: nowrap;
        color: var(--meta-text-color);
    }
    .acMetaText.biased::before {
        content: "✨";
        margin-right: 2px;
    }
    .acWikiLink {
        padding: 0.5rem;
        margin: -0.5rem 0 -0.5rem -0.5rem;
    }
    .acWikiLink:hover {
        text-decoration: underline;
    }
    .acListItem.acEmbeddingV1 {
        color: var(--embedding-v1-color);
    }
    .acListItem.acEmbeddingV2 {
        color: var(--embedding-v2-color);
    }
    .acRuby {
        padding: var(--input-padding);
        color: #888;
        font-size: 0.8rem;
        user-select: none;
    }
    .acRuby > ruby {
        display: inline-flex;
        flex-direction: column-reverse;
        margin-top: 0.5rem;
        vertical-align: bottom;
        cursor: pointer;
    }
    .acRuby > ruby::hover {
        text-decoration: underline;
        text-shadow: 0 0 10px var(--live-translation-color-1);
    }
    .acRuby > :nth-child(3n+1) {
        color: var(--live-translation-color-1);
    }
    .acRuby > :nth-child(3n+2) {
        color: var(--live-translation-color-2);
    }
    .acRuby > :nth-child(3n+3) {
        color: var(--live-translation-color-3);
    }
    .acRuby > ruby > rt {
        line-height: 1rem;
        padding: 0px 5px 0px 0px;
        text-align: left;
        font-size: 1rem;
        color: var(--live-translation-rt);
    }
    .acListItem .acPathPart:nth-child(3n+1) {
        color: var(--live-translation-color-1);
    }
    .acListItem .acPathPart:nth-child(3n+2) {
        color: var(--live-translation-color-2);
    }
    .acListItem .acPathPart:nth-child(3n+3) {
        color: var(--live-translation-color-3);
    }
`;
function __() {
    console.log("load__")
    let last_path=""
    let TAC_CFG = {
        wcWrap: "__"
    };
    var previousTags = [];
    function escapeHTML(unsafeText) {
        let div = document.createElement('div');
        div.textContent = unsafeText;
        return div.innerHTML;
    }

    const ResultType = Object.freeze({
        "tag": 1,
        "extra": 2,
        "embedding": 3,
        "wildcardTag": 4,
        "wildcardFile": 5,
        "yamlWildcard": 6,
        "umiWildcard": 7,
        "hypernetwork": 8,
        "lora": 9,
        "lyco": 10,
        "chant": 11,
        "styleName": 12
    });
    class AutocompleteResult {
        // Main properties
        text = "";
        type = ResultType.tag;

        // Additional info, only used in some cases
        category = null;
        count = Number.MAX_SAFE_INTEGER;
        usageBias = null;
        aliases = null;
        meta = null;
        hash = null;
        sortKey = null;

        // Constructor
        constructor(text, type) {
            this.text = text;
            this.type = type;
        }
    }
    function getSortFunction() {
        let criterion = TAC_CFG.modelSortOrder || "Name";

        const textSort = (a, b, reverse = false) => {
            // Assign keys so next sort is faster
            if (!a.sortKey) {
                a.sortKey = a.type === ResultType.chant
                    ? a.aliases
                    : a.text;
            }
            if (!b.sortKey) {
                b.sortKey = b.type === ResultType.chant
                    ? b.aliases
                    : b.text;
            }

            return reverse ? b.sortKey.localeCompare(a.sortKey) : a.sortKey.localeCompare(b.sortKey);
        }
        const numericSort = (a, b, reverse = false) => {
            const noKey = reverse ? "-1" : Number.MAX_SAFE_INTEGER;
            let aParsed = parseFloat(a.sortKey || noKey);
            let bParsed = parseFloat(b.sortKey || noKey);

            if (aParsed === bParsed) {
                return textSort(a, b, false);
            }

            return reverse ? bParsed - aParsed : aParsed - bParsed;
        }

        return (a, b) => {
            switch (criterion) {
                case "Date Modified (newest first)":
                    return numericSort(a, b, true);
                case "Date Modified (oldest first)":
                    return numericSort(a, b, false);
                default:
                    return textSort(a, b);
            }
        }
    }
    function difference(a, b) {
        if (a.length == 0) {
            return b;
        }
        if (b.length == 0) {
            return a;
        }

        return [...b.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
            a.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map())
        )].reduce((acc, [v, count]) => acc.concat(Array(Math.abs(count)).fill(v)), []);
    }
    function showResults(textArea) {
        let textAreaId = getTextAreaIdentifier(textArea);
        let parentDiv = gradioApp().querySelector('.autocompleteParent' + textAreaId);
        parentDiv.style.display = "flex";

        if (TAC_CFG.slidingPopup) {
            let caretPosition = getCaretCoordinates(textArea, textArea.selectionEnd).left;
            let offset = Math.min(textArea.offsetLeft - textArea.scrollLeft + caretPosition, textArea.offsetWidth - parentDiv.offsetWidth);

            parentDiv.style.left = `${offset}px`;
        } else {
            if (parentDiv.style.left)
                parentDiv.style.removeProperty("left");
        }
        // Reset here too to make absolutely sure the browser registers it
        parentDiv.scrollTop = 0;

        // Ensure preview is hidden
        let previewDiv = gradioApp().querySelector(`.autocompleteParent${textAreaId} .sideInfo`);
        previewDiv.style.display = "none";
    }
    function escapeRegExp(string, wildcardMatching = false) {
        if (wildcardMatching) {
            // Escape all characters except asterisks and ?, which should be treated separately as placeholders.
            return string.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
        }
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    let hideBlocked = false;
    var dbTimeOut;
    const WEIGHT_REGEX = /[([]([^()[\]:|]+)(?::(?:\d+(?:\.\d+)?|\.\d+))?[)\]]/g;
    const POINTY_REGEX = /<[^\s,<](?:[^\t\n\r,<>]*>|[^\t\n\r,> ]*)/g;
    const COMPLETED_WILDCARD_REGEX = /__[^\s,_][^\t\n\r,_]*[^\s,_]__[^\s,_]*/g;
    const STYLE_VAR_REGEX = /\$\(?[^$|\[\],\s]*\)?/g;
    const NORMAL_TAG_REGEX = /[^\s,|<>\[\]:]+_\([^\s,|<>\[\]:]*\)?|[^\s,|<>():\[\]/]+|</g;

    const TAG_REGEX = () => { 
        return new RegExp(`${POINTY_REGEX.source}|${COMPLETED_WILDCARD_REGEX.source.replaceAll("__", escapeRegExp(TAC_CFG.wcWrap))}|${STYLE_VAR_REGEX.source}|${NORMAL_TAG_REGEX.source}`, "g"); }

    const debounce = (func, wait = 300) => {
        return function (...args) {
            if (dbTimeOut) {
                clearTimeout(dbTimeOut);
            }

            dbTimeOut = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        }
    }
    function getTextAreaIdentifier(textArea) {
        return "test";
    }
    function createResultsDiv(textArea) {
        let parentDiv = document.createElement("div");
        let resultsDiv = document.createElement("div");
        let resultsList = document.createElement("ul");
        let sideDiv = document.createElement("div");
        let sideDivImg = document.createElement("img");
        // let txt2img_p = gradioApp().querySelector('#txt2img_prompt > label > textarea');
        let textAreaId = getTextAreaIdentifier()
        let typeClass = textAreaId.replaceAll(".", " ");
        parentDiv.setAttribute("class", `autocompleteParent${typeClass}`);
        resultsDiv.style.maxHeight = `${10 * 50}px`;
        resultsDiv.setAttribute("class", `autocompleteResults${typeClass} notranslate`);
        resultsDiv.setAttribute("translate", "no");
        resultsList.setAttribute("class", "autocompleteResultsList");
        resultsDiv.appendChild(resultsList);

        sideDiv.setAttribute("class", `autocompleteResults${typeClass} sideInfo`);
        sideDiv.appendChild(sideDivImg);

        parentDiv.appendChild(resultsDiv);
        parentDiv.appendChild(sideDiv);
        return parentDiv;
    };
    function hideResults(textArea) {
        let textAreaId = getTextAreaIdentifier(textArea);
        let resultsDiv = gradioApp().querySelector('.autocompleteParent' + textAreaId);

        if (!resultsDiv) return;

        resultsDiv.style.display = "none";
        selectedTag = null;
    }
    function autocomplete(textArea, prompt, fixedTag = null) {
        // Return if the function is deactivated in the UI
        // debugger
        // Guard for empty prompt
        if (prompt.length === 0) {
            hideResults(textArea);
            previousTags = [];
            tagword = "";
            return;
        }

        if (fixedTag === null) {
            // Match tags with RegEx to get the last edited one
            // We also match for the weighting format (e.g. "tag:1.0") here, and combine the two to get the full tag word set
            let weightedTags = [...prompt.matchAll(WEIGHT_REGEX)]
                .map(match => match[1]);
            let tags = prompt.match(TAG_REGEX())

            if (weightedTags !== null && tags !== null) {
                tags = tags.filter(tag => !weightedTags.some(weighted => tag.includes(weighted) && !tag.startsWith("<[") && !tag.startsWith("$(")))
                    .concat(weightedTags);
            }

            // Guard for no tags
            if (!tags || tags.length === 0) {
                previousTags = [];
                tagword = "";
                hideResults(textArea);
                return;
            }

            let tagCountChange = tags.length - previousTags.length;
            let diff = difference(tags, previousTags);
            previousTags = tags;

            // Guard for no difference / only whitespace remaining / last edited tag was fully removed
            if (diff === null || diff.length === 0 || (diff.length === 1 && tagCountChange < 0)) {
                if (!hideBlocked) hideResults(textArea);
                return;
            }

            tagword = diff[0]

            // Guard for empty tagword
            if (tagword === null || tagword.length === 0) {
                hideResults(textArea);
                return;
            }
        } else {
            tagword = fixedTag;
        }

        results = [];
        resultCountBeforeNormalTags = 0;
        tagword = tagword.toLowerCase().replace(/[\n\r]/g, "");

        resultCountBeforeNormalTags = results.length;

        // Create escaped search regex with support for * as a start placeholder
        let searchRegex;
        if (tagword.startsWith("*")) {
            tagword = tagword.slice(1);
            searchRegex = new RegExp(`${escapeRegExp(tagword)}`, 'i');
        } else {
            searchRegex = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(tagword)}`, 'i');
        }

        // Both normal tags and aliases/translations are included depending on the config
        let baseFilter = (x) => {
            console.log(searchRegex.source);
           return x.toLowerCase().search(searchRegex) > -1;
        }
        
        let aliasFilter = (x) => x[3] && x[3].toLowerCase().search(searchRegex) > -1;
        let translationFilter = (x) => (translations.has(x[0]) && translations.get(x[0]).toLowerCase().search(searchRegex) > -1)
            || x[3] && x[3].split(",").some(y => translations.has(y) && translations.get(y).toLowerCase().search(searchRegex) > -1);

        let fil;

        fil = (x) => baseFilter(x);

        allTags.filter(fil).forEach(t => {
            let result = new AutocompleteResult(t.trim(), ResultType.tag)
            result.category = "path";
            result.count = 1;
            result.aliases = "";
            results.push(result);
        });

        // Guard for empty results
        if (!results || results.length === 0) {
            //console.log('No results found for "' + tagword + '"');
            hideResults(textArea);
            return;
        }

        // Slice if the user has set a max result count and we are not in a extra networks / wildcard list

        addResultsToList(textArea, results, tagword, true);
        showResults(textArea);
    }
    function addResultsToList(textArea, results, tagword, resetList) {
        let textAreaId = getTextAreaIdentifier();
        let resultDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
        let resultsList = resultDiv.querySelector('ul');

        // Reset list, selection and scrollTop since the list changed
        if (resetList) {
            resultsList.innerHTML = "";
            selectedTag = null;
            oldSelectedTag = null;
            resultDiv.scrollTop = 0;
            resultCount = 0;
        }

        // Find right colors from config

        let nextLength = results.length;

        for (let i = resultCount; i < nextLength; i++) {
            let result = results[i];

            // Skip if the result is null or undefined
            if (!result)
                continue;

            let li = document.createElement("li");

            let flexDiv = document.createElement("div");
            flexDiv.classList.add("resultsFlexContainer");
            li.appendChild(flexDiv);

            let itemText = document.createElement("div");
            itemText.classList.add("acListItem");

            let displayText = "";

            displayText = escapeHTML(result.text);




            // Print search term bolded in result
            itemText.innerHTML = displayText.replace(tagword, `<b>${tagword}</b>`);

            flexDiv.appendChild(itemText);
            // Add click listener
            li.addEventListener("click", (e) => {
                insertTextAtCursor(textArea, result, tagword);
                console.log(textArea, result, tagword);
            });

            // Add element to list
            resultsList.appendChild(li);
        }
        resultCount = nextLength;
    }
    function addAutocompleteToArea() {
        let textAreaId = "pwd";

        let area = document.getElementById(textAreaId).querySelector("textarea");
        if (!area.classList.contains('autocomplete')) {
            // Add our new element
            var resultsDiv = createResultsDiv(area);
            area.parentNode.insertBefore(resultsDiv, area.nextSibling);
            // Hide by default so it doesn't show up on page load
            hideResults(area);

            // Add autocomplete event listener
            area.addEventListener('input', (e) => {
                if (!e.inputType && !tacSelfTrigger) return;
                tacSelfTrigger = false;
                if(area.value.endsWith("/")){
                    //获取路径参数
                    if (last_path!=area.value){
                        last_path=area.value;
                        val=[]
                       sendPostRequest("get/list",{pwd:last_path},(data)=>{console.log("===",data);allTags=data});

                    }
                }
                debounce(autocomplete(area, area.value), 400);
            });
            // Add focusout event listener
            area.addEventListener('focusout', debounce(() => {
                if (!hideBlocked)
                    hideResults(area);
            }, 400));
            // Add up and down arrow event listener
            // area.addEventListener('keydown', (e) => navigateInList(area, e));
            // CompositionEnd fires after the user has finished IME composing
            // We need to block hide here to prevent the enter key from insta-closing the results
            area.addEventListener('compositionend', () => {
                hideBlocked = true;
                setTimeout(() => { hideBlocked = false; }, 100);
            });

            // Add class so we know we've already added the listeners
            area.classList.add('autocomplete');
        }
    }
    function insertTextAtCursor(textArea, result, tagword) {
        let cursorPos = textArea.selectionStart;
        var sanitizedText = result.text



        var prompt = textArea.value;

        // Edit prompt text
        let editStart = Math.max(cursorPos - tagword.length, 0);
        let editEnd = Math.min(cursorPos + tagword.length, prompt.length);
        let surrounding = prompt.substring(editStart, editEnd);
        let match = surrounding.match(new RegExp(escapeRegExp(`${tagword}`), "i"));
        let afterInsertCursorPos = editStart + match.index + sanitizedText.length;

        var optionalSeparator = "";


        // Escape $ signs since they are special chars for the replace function
        // We need four since we're also escaping them in replaceAll in the first place
        sanitizedText = sanitizedText.replaceAll("$", "$$$$");

        // Replace partial tag word with new text, add comma if needed
        let insert = surrounding.replace(match, sanitizedText + optionalSeparator);

        // Add back start
        var newPrompt = prompt.substring(0, editStart) + insert + prompt.substring(editEnd);

        // Add lora/lyco keywords if enabled and found
        let keywordsLength = 0;

        // Insert into prompt textbox and reposition cursor
        textArea.value = newPrompt;
        textArea.selectionStart = afterInsertCursorPos + optionalSeparator.length + keywordsLength;
        textArea.selectionEnd = textArea.selectionStart

        // Update previous tags with the edited prompt to prevent re-searching the same term
        let weightedTags = [...newPrompt.matchAll(WEIGHT_REGEX)]
            .map(match => match[1]);
        let tags = newPrompt.match(TAG_REGEX())
        if (weightedTags !== null) {
            tags = tags.filter(tag => !weightedTags.some(weighted => tag.includes(weighted)))
                .concat(weightedTags);
        }
        previousTags = tags;
    }
    function creatStyle() {
        let acStyle = document.createElement('style');
        let mode = (document.querySelector(".dark") || gradioApp().querySelector(".dark")) ? 0 : 1;
        // Check if we are on webkit
        let browser = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? "firefox" : "other";

        let css = autocompleteCSS;
        // Replace vars with actual values (can't use actual css vars because of the way we inject the css)
        Object.keys(styleColors).forEach((key) => {
            css = css.replaceAll(`var(${key})`, styleColors[key][mode]);
        })
        Object.keys(browserVars).forEach((key) => {
            css = css.replaceAll(`var(${key})`, browserVars[key][browser]);
        })

        if (acStyle.styleSheet) {
            acStyle.styleSheet.cssText = css;
        } else {
            acStyle.appendChild(document.createTextNode(css));
        }
        gradioApp().appendChild(acStyle);
    }

    addAutocompleteToArea();
    creatStyle();
}

var tacLoading = false;


function checkFunctionDefined(){
    if (typeof(onUiUpdate) === 'function') {
        console.log('onUiUpdate 函数已定义，开始监听...');
        onUiUpdate(async () => {
            if (tacLoading) return;
            tacLoading = true;
            __();
        });
        clearInterval(intervalId); 
    } else {
        console.log('updateInput 函数尚未定义，继续检查...');
    }
}
const intervalId = setInterval(checkFunctionDefined, 1000);

