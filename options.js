let toggleBreak = document.getElementById("toggle-break");
let hours = document.getElementById("hours");
let minutes = document.getElementById("minutes");
let toggleSocial = document.getElementById("toggle-social");
let filters = document.getElementById("filters");
chrome.storage.local.get(["breakTimer", "hours", "minutes", "socialWarning", "filters"], items => {
    if (items.breakTimer) {
        toggleBreak.checked = true;
    } else {
        hours.disabled = true;
        minutes.disabled = true;
    }
    if (items.socialWarning) {
        toggleSocial.checked = true;
    }
    hours.value = items.hours;
    minutes.value = items.minutes;
    if (parseInt(hours.value) === 0) {
        minutes.firstElementChild.disabled = true;
    } else if (parseInt(minutes.value) === 0) {
        hours.firstElementChild.disabled = true;
    }
    if (items.filters) {
        filters.value = items.filters.join("\n");
    }
});

function onTimeChanged(target, firstOption) {
    if (parseInt(target.value) === 0) {
        firstOption.disabled = true;
    } else {
        if (firstOption.disabled) {
            firstOption.removeAttribute("disabled");
        }
    }
}

hours.addEventListener("change", () => {
    onTimeChanged(hours, minutes.firstElementChild);
    chrome.storage.local.set({hours: hours.value});
});
minutes.addEventListener("change", () => {
    onTimeChanged(minutes, hours.firstElementChild);
    chrome.storage.local.set({minutes: minutes.value});
});
document.getElementById("save").addEventListener("click", () => {
    let blockFilters = filters.value.replace(/(\n)+/gm, "\n").trim().split("\n");
    if (!blockFilters[0]) {
        blockFilters = [];
    }
    chrome.storage.local.set({filters: blockFilters});
});
toggleBreak.addEventListener("click", () => {
    if (toggleBreak.checked) {
        chrome.storage.local.set({breakTimer: true});
        hours.disabled = false;
        minutes.disabled = false;
    } else {
        chrome.storage.local.set({breakTimer: false});
        hours.disabled = true;
        minutes.disabled = true;
    }
});
toggleSocial.addEventListener("click", () => {
    if (toggleSocial.checked) {
        chrome.storage.local.set({socialWarning: true});
    } else {
        chrome.storage.local.set({socialWarning: false});
    }
});
