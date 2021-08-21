function fetchTips(retry) {
    fetch("https://cyberprotec.tk/cyber_tips.json").then(data => {
        data.json().then(data => {
            chrome.storage.local.set({originalTips: data.tips, tips: data.tips, tipsFetchedTime: Date.now()});
        });
    }).catch((error) => {
        if (retry > 1) {
            addEventListener("online", () => {
                fetchTips(retry - 1);
            });
        }
    });
}
