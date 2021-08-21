chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "install") {
        chrome.storage.local.set({hours: 0, minutes: 30, breakTimer: true, socialWarning: true, filters: []});
    }
});

function blockRequest(details) {
    return {cancel: true};
}

function addBlockListener() {
    chrome.storage.local.get(["filters"], items => {
        let filters = items.filters;
        if (chrome.webRequest.onBeforeRequest.hasListeners()) {
            chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
        }
        if (filters && filters.length) {
            chrome.webRequest.onBeforeRequest.addListener(blockRequest, {urls: filters}, ["blocking"]);
        }
    });
}

addBlockListener();
let socialWarning = false;
chrome.storage.local.get(["tipsFetchedTime", "socialWarning"], items => {
    if (items.socialWarning !== false) {
        socialWarning = true;
    }
    let fetchedTime = items.tipsFetchedTime;
    if (!fetchedTime) {
        fetchedTime = 0;
    }
    let currentTime = Date.now();
    if ((currentTime - (24 * 60 * 60 * 1000)) >= fetchedTime) {
        fetchTips(2);
    }
});

function showNotification(breakTime) {
    return setInterval(() => {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            chrome.notifications.create({
                title: "CyberProtec",
                message: "Time to take a break",
                type: "basic",
                iconUrl: "images/break.svg"
            });
        });
    }, breakTime);
}

let interval;

function breakTime() {
    chrome.storage.local.get(["hours", "minutes", "breakTimer"], items => {
        clearInterval(interval);
        if (items.breakTimer !== false) {
            let time = (items.hours * 60 * 60 + items.minutes * 60) * 1000;
            if (isNaN(time) || time < 60000) {
                time = 30 * 60 * 1000;
            }
            interval = showNotification(time);
        }
    });
}

breakTime();
chrome.storage.onChanged.addListener(changes => {
    if (changes.hours || changes.minutes) {
        breakTime();
    }
    if (changes.breakTimer) {
        if (changes.breakTimer.newValue === true) {
            breakTime();
        } else {
            clearInterval(interval);
        }
    }
    if (changes.socialWarning) {
        socialWarning = changes.socialWarning.newValue;
    }
    if (changes.filters) {
        addBlockListener();
    }
});
let socialWarningShown = [];
let unsecuredShown = [];
chrome.webNavigation.onCompleted.addListener(details => {
    if (details.frameId === 0) {
        let pattern = /(^http:\/\/)|(facebook.com|twitter.com|instagram.com)/;
        let match = details.url.match(pattern);
        if (match) {
            match = match[0];
            if (match === "http://") {
                let url = new URL(details.url).host;
                if (!unsecuredShown.includes(url)) {
                    unsecuredShown.push(url);
                    chrome.notifications.create({
                        title: "CyberProtec",
                        message: `Alert! "${url}" is an unsecured website.\nDon't enter any sensitive information on this website.`,
                        type: "basic",
                        iconUrl: "/images/logo.svg"
                    });
                }
            } else if (socialWarning && !socialWarningShown.includes(match)) {
                socialWarningShown.push(match);
                chrome.notifications.create({
                    title: "CyberProtec",
                    message: "Remember to be respectful. Don't use hurtful things and think before posting.",
                    type: "basic",
                    iconUrl: "/images/logo.svg"
                });
            }
        }
    }
});
