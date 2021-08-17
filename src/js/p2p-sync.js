import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';

import '../../qrcode.js';
import QrScanner from '../../qr-scanner.js';
import '../../qr-scanner-worker.js';

class P2pSync extends LitElement {
  static get properties() {
    return {};
  }

  static get styles() {
    return css``;
  }

  send_text = () => {
    const text = this.shadowRoot.getElementById('text').value;
    this.channel.send(text);
  };

  step_1_initiator_create_offer = async () => {
    this.channel = this.connection.createDataChannel('data');
    this.channel.onmessage = (event) => alert(event.data);
    this.connection.onicecandidate = (event) => {
      if (!event.candidate) {
        var createdOffer = JSON.stringify(this.connection.localDescription);
        update_qrcode(createdOffer);
      }
    };
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);

    // Wait for response QR Code
    let qrScannerResponse = new QrScanner(
      this.shadowRoot.querySelector('#qr-video'),
      async (result) => {
        console.log('Peer approval response:', result);
        qrScannerResponse.stop();
        qrScannerResponse = undefined;

        update_qrcode();

        const answer = JSON.parse(result);
        await this.connection.setRemoteDescription(answer);
      }
    );
    qrScannerResponse.start();
  };

  step_2_accept_remote_offer = async () => {
    let qrScannerAcceptOffer = new QrScanner(
      this.shadowRoot.querySelector('#qr-video'),
      async (result) => {
        console.log('Accepted Remote Offer:', result);
        qrScannerAcceptOffer.stop();
        qrScannerAcceptOffer = undefined;

        update_qrcode();

        const offer = JSON.parse(result);
        await this.connection.setRemoteDescription(offer);
        this.step_3_create_answer();
      }
    );
    qrScannerAcceptOffer.start();
  };

  step_3_create_answer = async () => {
    this.connection.onicecandidate = (event) => {
      if (!event.candidate) {
        var createdAnswer = JSON.stringify(this.connection.localDescription);

        update_qrcode(createdAnswer);
      }
    };

    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
  };

  render() {
    return html` <div>
      <video id="qr-video" width="300" height="170"></video>

      <div id="qr"></div>

      <div id="action-buttons">
        <button
          id="create-offer"
          @click="${this.step_1_initiator_create_offer}"
        >
          Create QR Code
        </button>
        <button id="accept-offer" @click="${this.step_2_accept_remote_offer}">
          Scan QR Code
        </button>
      </div>

      <hr />

      <div style="margin: 50px">
        <strong>Remote Message: </strong><span id="received-message"></span>
      </div>

      <input id="text" type="text" />
      <input
        type="button"
        value="send"
        id="send-text"
        @click="${this.send_text}"
      />

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

  connectedCallback() {
    super.connectedCallback();

    this.connection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.connection.ondatachannel = (event) => {
      console.log('ondatachannel');
      this.channel = event.channel;
      this.channel.onmessage = (event) => alert(event.data);
    };

    this.connection.onconnectionstatechange = (event) =>
      (this.shadowRoot.getElementById('connectionState').innerText =
        this.connection.connectionState);
    this.connection.oniceconnectionstatechange = (event) =>
      (this.shadowRoot.getElementById('iceConnectionState').innerText =
        this.connection.iceConnectionState);
  }
}

customElements.define('p2p-sync', P2pSync);
