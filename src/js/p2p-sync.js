import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';

// import { QrScanner, update_qrcode } from '../../qrcode.js';
// import '../../qrcode.js';
// import '../../qr-scanner.js';
// import '../../qr-scanner-worker.js';

class P2pSync extends LitElement {
  static get properties() {
    return {};
  }

  static get styles() {
    return css``;
  }

  render() {
    return html` <div>
      <video id="qr-video" width="300" height="170"></video>

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

  // connectedCallback() {
  //   super.connectedCallback();
  //   const _self = this;
  //   setTimeout(() => {
  //     let channel = null;
  //     const connection = new RTCPeerConnection({
  //       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  //     });
  //     connection.ondatachannel = (event) => {
  //       channel = event.channel;
  //       channel.onmessage = (event) => {
  //         _self.shadowRoot.querySelector('#received-message').innerHTML = '';
  //       };
  //     };
  //     connection.onconnectionstatechange = (event) =>
  //       (_self.shadowRoot.getElementById('connectionState').innerText =
  //         connection.connectionState);
  //     connection.oniceconnectionstatechange = (event) =>
  //       (_self.shadowRoot.getElementById('iceConnectionState').innerText =
  //         connection.iceConnectionState);
  //     async function step_1_initiator_create_offer() {
  //       channel = connection.createDataChannel('data');
  //       channel.onmessage = (event) => {
  //         _self.shadowRoot.querySelector('#received-message').innerHTML = '';
  //       };
  //       connection.onicecandidate = (event) => {
  //         if (!event.candidate) {
  //           var createdOffer = JSON.stringify(connection.localDescription);
  //           update_qrcode(createdOffer);
  //         }
  //       };
  //       const offer = await connection.createOffer();
  //       await connection.setLocalDescription(offer);
  //       // Wait for response QR Code
  //       let qrScannerResponse = new QrScanner(
  //         _self.shadowRoot.querySelector('#qr-video'),
  //         async (result) => {
  //           console.log('Peer approval response:', result);
  //           qrScannerResponse.stop();
  //           qrScannerResponse = undefined;
  //           update_qrcode();
  //           const answer = JSON.parse(result);
  //           await connection.setRemoteDescription(answer);
  //         }
  //       );
  //       qrScannerResponse.start();
  //     }
  //     async function step_2_accept_remote_offer() {
  //       let qrScannerAcceptOffer = new QrScanner(
  //         _self.shadowRoot.querySelector('#qr-video'),
  //         async (result) => {
  //           console.log('Accepted Remote Offer:', result);
  //           qrScannerAcceptOffer.stop();
  //           qrScannerAcceptOffer = undefined;
  //           update_qrcode();
  //           const offer = JSON.parse(result);
  //           await connection.setRemoteDescription(offer);
  //           step_3_create_answer();
  //         }
  //       );
  //       qrScannerAcceptOffer.start();
  //     }
  //     async function step_3_create_answer() {
  //       connection.onicecandidate = (event) => {
  //         if (!event.candidate) {
  //           var createdAnswer = JSON.stringify(connection.localDescription);
  //           update_qrcode(createdAnswer);
  //         }
  //       };
  //       const answer = await connection.createAnswer();
  //       await connection.setLocalDescription(answer);
  //     }
  //     async function send_text() {
  //       const text = _self.shadowRoot.getElementById('text').value;
  //       channel.send(text);
  //     }
  //     function hideActionButtons() {
  //       _self.shadowRoot.querySelector('#action-buttons').style.display =
  //         'none';
  //     }
  //     _self.shadowRoot
  //       .querySelector('#create-offer')
  //       .addEventListener('click', () => {
  //         step_1_initiator_create_offer();
  //         hideActionButtons();
  //       });
  //     _self.shadowRoot
  //       .querySelector('#accept-offer')
  //       .addEventListener('click', () => {
  //         step_2_accept_remote_offer();
  //         hideActionButtons();
  //       });
  //     _self.shadowRoot
  //       .querySelector('#send-text')
  //       .addEventListener('click', () => {
  //         send_text();
  //       });
  //   });
  // }
}

customElements.define('p2p-sync', P2pSync);