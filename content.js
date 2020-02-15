let isRecModeOn = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const { isRec } = request;
    isRecModeOn = isRec;
    // console.log(sender.tab ?
//     "from a content script:" + sender.tab.url :
//     "from the extension");
// if (request.greeting == "hello")
    sendResponse({ farewell: "goodbye" });
});

let myPeerConnection;

const style = document.createElement('style');
style.innerHTML = `
  .red {
  border: 1px solid red;
  }
  `;
document.head.appendChild(style);

document.querySelector('html').addEventListener('mouseover', e => {
    const onMouseOverEl = e.target;

    if (isRecModeOn) {
        onMouseOverEl.classList.add('red');
        onMouseOverEl.addEventListener('click', listen)
    }
});

document.querySelector('html').addEventListener('mouseout', e => {
    const onMouseOverEl = e.target;

    if (isRecModeOn) {
        onMouseOverEl.classList.remove('red');
        onMouseOverEl.removeEventListener('click', listen);
    }
});

function listen(e) {
    e.preventDefault();
    if (e.target.tagName === 'VIDEO') {
        const connection = new WebSocket('ws://localhost:1212');

        connection.onmessage = async function (event) {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'video-answer':
                    var desc = new RTCSessionDescription(message.sdp);
                    await myPeerConnection.setRemoteDescription(desc).catch(reportError);

                    console.log('video-answer', myPeerConnection)
            }
        };

        connection.onopen = function () {
            myPeerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: ["turns:turnserver.example.org", "turn:turnserver.example.org"],
                        username: "webrtc",
                        credential: "turnpassword"
                    }
                ]
            });

            myPeerConnection.onicecandidate = function (event) {
                if (event.candidate) {
                    connection.send(JSON.stringify({
                        type: "new-ice-candidate",
                        target: 'receiver',
                        candidate: event.candidate,
                    }))
                }


            };

            myPeerConnection.onnegotiationneeded = function () {
                myPeerConnection.createOffer().then(function(offer) {
                    return myPeerConnection.setLocalDescription(offer);
                })
                    .then(function() {
                        connection.send(JSON.stringify({
                            name: 'sender',
                            target: 'receiver',
                            type: 'video-offer',
                            sdp: myPeerConnection.localDescription
                        }));
                    })
            };

            const stream = e.target.captureStream();

            stream.getTracks().forEach(track => myPeerConnection.addTrack(track, stream));
        }
    }
}

function reportError(err) {
    console.log(`Oopsie dasie: ${err}`);
}

//
// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
// }).then(returnedLocalStream => {
//
//     var video = document.querySelector('video');
//
//     console.log(243, video)
//     // localStream = returnedLocalStream;
//     video.srcObject = returnedLocalStream;
//     video.play();
// });
//
