import { Component, Element, h, State } from '@stencil/core';
import { modalController, loadingController, alertController } from '@ionic/core';

import { get, set } from 'idb-keyval';

import { initText, getTextData } from '../../services/text';

declare var ImageCapture: any;

@Component({
    tag: 'app-camera',
    styleUrl: 'app-camera.css'
})
export class AppCamera {

    @Element() el: HTMLElement;

    @State() stream: MediaStream;
    @State() textLines: any[];
    @State() caughtText: string;

    @State() copied: boolean = false;

    imageCapture: any;
    blob: Blob;

    async componentWillLoad() {
        this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment"
            },
            audio: false
        });
    }

    componentDidLoad() {
        this.el.querySelector('video').srcObject = this.stream;

        this.imageCapture = new ImageCapture(this.stream.getTracks()[0]);
    }

    componentDidUnload() {
        const tracks = this.stream.getTracks();
        tracks.forEach((track) => {
            track.stop();
        })
    }

    async takePicture() {
        this.blob = await this.imageCapture.takePhoto();

        const loading = await loadingController.create({
            message: 'Loading...'
        });
        await loading.present();

        const data = await initText(this.blob);

        setTimeout(async () => {
            const textData = await getTextData(data);
            console.log('textData', textData);

            const textLines = textData.recognitionResults[0].lines;

            this.textLines = textLines;

            (this.el.querySelector('video') as HTMLVideoElement).pause();

            let text = "";

            textLines.forEach((line) => {
              text = text + line.text;
            });

            this.caughtText = text;
            console.log(this.caughtText);

            await loading.dismiss();
        }, 2000)
    }

    async copy() {
        let textToCopy = this.formatText();

        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                this.copied = true;
            }
            catch (err) {
                console.error(err);
            }
        }
    }

    private formatText() {
        let textToCopy = this.el.querySelector('ion-textarea').value;
        return textToCopy;
    }

    async share() {
        try {
            if ((navigator as any).share) {
                let textToCopy = this.formatText();

                await (navigator as any).share({
                    title: 'Scribe',
                    text: textToCopy,
                    url: 'https://web.dev/',
                })
            }
        } catch (error) {
            console.error(error);
        }
    }

    async save() {
        const notes: any[] = await get('notes');

        let textToCopy = this.formatText();

        const alert = await alertController.create({
            header: "Save Note",
            subHeader: "Pick a title for this note",
            inputs: [
                {
                    type: 'text',
                    placeholder: "note title"
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Save',
                    handler: async (data) => {
                        if (notes) {
                            const newNotes = [...notes, { title: data[0], body: textToCopy, image: this.blob }];
                            await set('notes', newNotes);
                        }
                        else {
                            await set('notes', [{ title: data[0], body: textToCopy, image: this.blob }])
                        }
                    }
                }
            ]
        });
        await alert.present();

        await alert.onDidDismiss();
        await this.close();
    }

    async download() {
        let textToCopy = this.formatText();

        if ((window as any).chooseFileSystemEntries) {
            const opts = {
                type: 'saveFile',
                accepts: [{
                    description: 'Text file',
                    extensions: ['txt'],
                    mimeTypes: ['text/plain'],
                }],
            };
            const handle = await (window as any).chooseFileSystemEntries(opts);

            const writer = await handle.createWriter();
            // Write the full length of the contents
            await writer.write(0, textToCopy);
            // Close the file and write the contents to disk
            await writer.close();
        }
        else {
            const file = new Blob([textToCopy], { type: 'text/plain' });

            let a = document.createElement("a");
            let url = URL.createObjectURL(file);
            
            a.href = url;
            a.download = `${Math.random().toString()}`;
            document.body.appendChild(a);
            a.click();

        }
    }

    async close() {
        await modalController.dismiss();
    }

    render() {
        return [
            <ion-header>
                <ion-toolbar>
                    <ion-buttons slot="end">
                        <ion-button onClick={() => this.close()}>
                            <ion-icon name="close"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>,

            <ion-content>
                <video autoplay></video>

                {
                    this.textLines && this.textLines.length > 0 ? <div id="resultsDiv">
                        <h2>Text Captured</h2>
                        
                        <ion-textarea value={this.caughtText}></ion-textarea>

                        <div id="textActions">
                            {!this.copied ? <ion-fab-button onClick={() => this.copy()}><ion-icon name="copy-outline"></ion-icon></ion-fab-button> : <ion-fab-button color="secondary"><ion-icon name="checkmark-outline"></ion-icon></ion-fab-button>}
                            <ion-fab-button onClick={() => this.share()}><ion-icon name="share-outline"></ion-icon></ion-fab-button>
                            <ion-fab-button onClick={() => this.download()}><ion-icon name="download-outline"></ion-icon></ion-fab-button>
                        </div>

                        <ion-button onClick={() => this.save()} class="actionsButton" expand="block">Save</ion-button>
                        <ion-button onClick={() => this.close()} color="danger" class="actionsButton" expand="block">Cancel</ion-button>
                    </div> : null
                }

                <ion-fab vertical="bottom" horizontal="center">
                    <ion-fab-button onClick={() => this.takePicture()} color="secondary">
                        <ion-icon name="camera"></ion-icon>
                    </ion-fab-button>
                </ion-fab>
            </ion-content>
        ]
    }
}
