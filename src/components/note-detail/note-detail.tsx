import { Component, h, Prop, State } from '@stencil/core';
import { modalController } from '@ionic/core';


@Component({
    tag: 'note-detail',
    styleUrl: 'note-detail.css'
})
export class NoteDetail {

    @State() copied: boolean = false;

    @Prop() data;

    componentDidLoad() {
        console.log(this.data);
    }

    async close() {
        await modalController.dismiss()
    }

    async copy() {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(this.data.body);
                this.copied = true;
            }
            catch (err) {
                console.error(err);
            }
        }

    }

    async share() {
        try {
            if ((navigator as any).share) {
                await (navigator as any).share({
                    title: 'Scribe',
                    text: this.data.body,
                    url: 'https://web.dev/',
                })
            }
            else {
                this.copy();
            }
        } catch (error) {
            console.error(error);
        }

        await this.close();
    }

    async download() {
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
            await writer.write(0, this.data.body);
            // Close the file and write the contents to disk
            await writer.close();
        }
        else {
            const file = new Blob([this.data.body], { type: 'text/plain' });

            let a = document.createElement("a");
            let url = URL.createObjectURL(file);
            
            a.href = url;
            a.download = `${Math.random().toString()}`;
            document.body.appendChild(a);
            a.click();
        }
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

            <ion-content class="ion-padding">
                <img id="detailImg" src={this.data.image ? URL.createObjectURL(this.data.image) : '/assets/icon/icon512.png'}></img>

                <h2 id="detailTitle">{this.data.title}</h2>

                <p id="detailBody">{this.data.body}</p>
            </ion-content>,

            <ion-footer>
                <ion-toolbar>
                    <div id="detailActions">
                        {!this.copied ? <ion-fab-button onClick={() => this.copy()}><ion-icon name="copy-outline"></ion-icon></ion-fab-button> : <ion-fab-button color="secondary"><ion-icon name="checkmark-outline"></ion-icon></ion-fab-button>}
                        <ion-fab-button onClick={() => this.share()}><ion-icon name="share-outline"></ion-icon></ion-fab-button>
                        <ion-fab-button onClick={() => this.download()}><ion-icon name="download-outline"></ion-icon></ion-fab-button>
                    </div>
                </ion-toolbar>
            </ion-footer>
        ]
    }
}
