let url;
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    url = new URL(tabs[0].url).host;
});
let toggle = document.getElementById("toggle-block");

function getTips() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["tips", "filters"], items => {
            let tips = items.tips;
            if (tips && tips.length) {
                resolve(items.tips);
            } else {
                chrome.storage.local.get(["originalTips"], items => {
                    let originalTips = items.originalTips;
                    if (originalTips && originalTips.length) {
                        chrome.storage.local.set({tips: originalTips}, () => {
                            resolve(originalTips);
                        });
                    } else {
                        chrome.storage.onChanged.addListener(changes => {
                            if (changes.tips) {
                                resolve(changes.tips.newValue);
                            }
                        });
                        fetchTips();
                    }
                });
            }
            let filters = items.filters;
            if (RegExp(url).test(filters)) {
                toggle.checked = true;
            }
        });
    });
}

getTips().then(data => {
    let random = Math.floor(Math.random() * data.length);
    document.getElementById("tips").textContent = data[random];
    data.splice(random, 1);
    chrome.storage.local.set({tips: data});
});

toggle.addEventListener("click", (event) => {
    if (toggle.checked) {
        chrome.storage.local.get(["filters"], items => {
            let filters = items.filters;
            filters.push(`*://${url}/*`);
            chrome.storage.local.set({filters: filters});
        });
    } else {
        toggle.checked = true;
        chrome.tabs.create({url: "options.html", active: true});
    }
});
document.getElementById("settings").addEventListener("click", () => {
    chrome.tabs.create({url: "options.html", active: true});
});
