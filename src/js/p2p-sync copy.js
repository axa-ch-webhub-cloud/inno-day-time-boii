// <!DOCTYPE html>
// <html>
//   <head>
//     <meta http-equiv="Content-Type" content="text/html; charset=Utf-8" />
//     <script src="qrcode.js"></script>
//     <script src="qr-scanner.js"></script>
//     <script src="qr-scanner-worker.js"></script>

//     <title>P2P Communication</title>
//   </head>
//   <body>
//     <video id="qr-video" width="300" height="170"></video>

//     <div id="qr"></div>

//     <div id="action-buttons">
//       <button id="create-offer">Create QR Code</button>
//       <button id="accept-offer">Scan QR Code</button>
//     </div>

//     <hr />

//     <div style="margin: 50px">
//       <strong>Remote Message: </strong><span id="received-message"></span>
//     </div>

//     <input id="text" type="text" />
//     <input type="button" value="send" id="send-text" />

//     <hr />

//     <table border="1">
//       <tbody>
//         <tr>
//           <th colspan="2">connection</th>
//         </tr>
//         <tr>
//           <th>connectionState</th>
//           <td id="connectionState">not connected</td>
//         </tr>
//         <tr>
//           <th>iceConnectionState</th>
//           <td id="iceConnectionState">not connected</td>
//         </tr>
//       </tbody>
//     </table>

//     <script type="module">
// import QrScanner from './qr-scanner.js';

// let channel = null;

// const connection = new RTCPeerConnection({
//   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
// });

// connection.ondatachannel = (event) => {
//   channel = event.channel;
//   channel.onmessage = (event) => {
//     this.shadowRoot.querySelector('#received-message').innerHTML = '';
//   };
// };

// connection.onconnectionstatechange = (event) =>
//   (this.shadowRoot.getElementById('connectionState').innerText =
//     connection.connectionState);
// connection.oniceconnectionstatechange = (event) =>
//   (this.shadowRoot.getElementById('iceConnectionState').innerText =
//     connection.iceConnectionState);

// async function step_1_initiator_create_offer() {
//   channel = connection.createDataChannel('data');
//   channel.onmessage = (event) => {
//     this.shadowRoot.querySelector('#received-message').innerHTML = '';
//   };
//   connection.onicecandidate = (event) => {
//     if (!event.candidate) {
//       var createdOffer = JSON.stringify(connection.localDescription);
//       update_qrcode(createdOffer);
//     }
//   };
//   const offer = await connection.createOffer();
//   await connection.setLocalDescription(offer);

//   // Wait for response QR Code
//   let qrScannerResponse = new QrScanner(
//     this.shadowRoot.querySelector('#qr-video'),
//     async (result) => {
//       console.log('Peer approval response:', result);
//       qrScannerResponse.stop();
//       qrScannerResponse = undefined;

//       update_qrcode();

//       const answer = JSON.parse(result);
//       await connection.setRemoteDescription(answer);
//     }
//   );
//   qrScannerResponse.start();
// }

// async function step_2_accept_remote_offer() {
//   let qrScannerAcceptOffer = new QrScanner(
//     this.shadowRoot.querySelector('#qr-video'),
//     async (result) => {
//       console.log('Accepted Remote Offer:', result);
//       qrScannerAcceptOffer.stop();
//       qrScannerAcceptOffer = undefined;

//       update_qrcode();

//       const offer = JSON.parse(result);
//       await connection.setRemoteDescription(offer);
//       step_3_create_answer();
//     }
//   );
//   qrScannerAcceptOffer.start();
// }

// async function step_3_create_answer() {
//   connection.onicecandidate = (event) => {
//     if (!event.candidate) {
//       var createdAnswer = JSON.stringify(connection.localDescription);

//       update_qrcode(createdAnswer);
//     }
//   };

//   const answer = await connection.createAnswer();
//   await connection.setLocalDescription(answer);
// }

// async function send_text() {
//   const text = this.shadowRoot.getElementById('text').value;

//   channel.send(text);
// }

// function hideActionButtons() {
//   this.shadowRoot.querySelector('#action-buttons').style.display = 'none';
// }

// this.shadowRoot.querySelector('#create-offer').addEventListener('click', () => {
//   step_1_initiator_create_offer();
//   hideActionButtons();
// });
// this.shadowRoot.querySelector('#accept-offer').addEventListener('click', () => {
//   step_2_accept_remote_offer();
//   hideActionButtons();
// });
// this.shadowRoot.querySelector('#send-text').addEventListener('click', () => {
//   send_text();
// });
//     </script>
//   </body>
// </html>

import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';

// import QrScanner, { update_qrcode } from '../../qrcode.js';
// import '../../qr-scanner.js';
// import '../../qr-scanner-worker.js';

class P2pSync extends LitElement {
  static get properties() {
    return {};
  }

  static get styles() {
    return css``;
  }

  connectedCallback() {
    // let channel = null;
    // const connection = new RTCPeerConnection({
    //   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    // });
    // connection.ondatachannel = (event) => {
    //   channel = event.channel;
    //   channel.onmessage = (event) => {
    //     this.shadowRoot.querySelector('#received-message').innerHTML = '';
    //   };
    // };
    // connection.onconnectionstatechange = (event) =>
    //   (this.shadowRoot.getElementById('connectionState').innerText =
    //     connection.connectionState);
    // connection.oniceconnectionstatechange = (event) =>
    //   (this.shadowRoot.getElementById('iceConnectionState').innerText =
    //     connection.iceConnectionState);
    // async function step_1_initiator_create_offer() {
    //   channel = connection.createDataChannel('data');
    //   channel.onmessage = (event) => {
    //     this.shadowRoot.querySelector('#received-message').innerHTML = '';
    //   };
    //   connection.onicecandidate = (event) => {
    //     if (!event.candidate) {
    //       var createdOffer = JSON.stringify(connection.localDescription);
    //       update_qrcode(createdOffer);
    //     }
    //   };
    //   const offer = await connection.createOffer();
    //   await connection.setLocalDescription(offer);
    //   // Wait for response QR Code
    //   let qrScannerResponse = new QrScanner(
    //     this.shadowRoot.querySelector('#qr-video'),
    //     async (result) => {
    //       console.log('Peer approval response:', result);
    //       qrScannerResponse.stop();
    //       qrScannerResponse = undefined;
    //       update_qrcode();
    //       const answer = JSON.parse(result);
    //       await connection.setRemoteDescription(answer);
    //     }
    //   );
    //   qrScannerResponse.start();
    // }
    // async function step_2_accept_remote_offer() {
    //   let qrScannerAcceptOffer = new QrScanner(
    //     this.shadowRoot.querySelector('#qr-video'),
    //     async (result) => {
    //       console.log('Accepted Remote Offer:', result);
    //       qrScannerAcceptOffer.stop();
    //       qrScannerAcceptOffer = undefined;
    //       update_qrcode();
    //       const offer = JSON.parse(result);
    //       await connection.setRemoteDescription(offer);
    //       step_3_create_answer();
    //     }
    //   );
    //   qrScannerAcceptOffer.start();
    // }
    // async function step_3_create_answer() {
    //   connection.onicecandidate = (event) => {
    //     if (!event.candidate) {
    //       var createdAnswer = JSON.stringify(connection.localDescription);
    //       update_qrcode(createdAnswer);
    //     }
    //   };
    //   const answer = await connection.createAnswer();
    //   await connection.setLocalDescription(answer);
    // }
    // async function send_text() {
    //   const text = this.shadowRoot.getElementById('text').value;
    //   channel.send(text);
    // }
    // function hideActionButtons() {
    //   this.shadowRoot.querySelector('#action-buttons').style.display = 'none';
    // }
    // this.shadowRoot
    //   .querySelector('#create-offer')
    //   .addEventListener('click', () => {
    //     step_1_initiator_create_offer();
    //     hideActionButtons();
    //   });
    // this.shadowRoot
    //   .querySelector('#accept-offer')
    //   .addEventListener('click', () => {
    //     step_2_accept_remote_offer();
    //     hideActionButtons();
    //   });
    // this.shadowRoot
    //   .querySelector('#send-text')
    //   .addEventListener('click', () => {
    //     send_text();
    //   });
  }

  render() {
    return html`        <video id="qr-video" width="300" height="170"></video>

    <div id="qr"></div>

    <div id="action-buttons">
      <button id="create-offer">Create QR Code</button>
      <button id="accept-offer">Scan QR Code</button>
    </div>

    <hr />

    <div style="margin: 50px">
      <strong>Remote Message: </strong><span id="received-message"></span>
    </div>

    <input id="text" type="text" />
    <input type="button" value="send" id="send-text" />

    <hr />

    <table border="1">
      <tbody>
        <tr>
          <th colspan="2">connection</th>
        </tr>
        <tr>
          <th>connectionState</th>
          <td id="connectionState">not connected</td>
        </tr>
        <tr>
          <th>iceConnectionState</th>
          <td id="iceConnectionState">not connected</td>
        </tr>
      </tbody>
    </table>
  </div>`;
  }
}

customElements.define('p2p-sync', P2pSync);
