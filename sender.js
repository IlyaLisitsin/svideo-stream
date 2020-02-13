document.querySelector('#datrecbutton').addEventListener('click', e => {
    const isRec = e.target.innerText === 'Rec';
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { isRec }, function(response) {
            console.log(response);
            // document.querySelector('#datrecbutton').innerText = 'Poohui';
            e.target.innerText = isRec ? 'Stop rec' : 'Rec';
        });
    });
});
