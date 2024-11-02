const startScreenShareButton = document.getElementById('startScreenShare');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let peerConnection;

const signalingServer = io(); // Suponiendo que usas Socket.IO para el servidor de señalización

startScreenShareButton.addEventListener('click', async () => {
  try {
    localStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection();

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        signalingServer.emit('ice-candidate', event.candidate);
      }
    };

    peerConnection.ontrack = event => {
      remoteVideo.srcObject = event.streams[0];
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingServer.emit('offer', offer);
  } catch (err) {
    console.error('Error compartiendo pantalla:', err);
  }
});

signalingServer.on('offer', async offer => {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        signalingServer.emit('ice-candidate', event.candidate);
      }
    };
    peerConnection.ontrack = event => {
      remoteVideo.srcObject = event.streams[0];
    };
  }
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  signalingServer.emit('answer', answer);
});

signalingServer.on('answer', async answer => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

signalingServer.on('ice-candidate', async candidate => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.error('Error agregando ICE Candidate:', err);
  }
});
