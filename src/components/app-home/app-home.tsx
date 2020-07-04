import { Component, h, State } from '@stencil/core';
import { modalController } from '@ionic/core';

import { get } from 'idb-keyval';

import '@pwabuilder/pwainstall';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() notes: any[];

  async componentWillLoad() {
    this.notes = await get('notes');
    console.log(this.notes);
  }

  async openCamera() {
    const modal = await modalController.create({
      component: 'app-camera'
    });
    await modal.present();

    await modal.onDidDismiss();

    this.notes = await get('notes');
  }

  async noteDetail(note: any) {
    const modal = await modalController.create({
      component: 'note-detail',
      componentProps: {
        data: note
      }
    });
    await modal.present();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Notes</ion-title>

          <ion-buttons slot="end">
            <ion-button color="primary" id="desktopCam" onClick={() => this.openCamera()} fill="clear">
              <ion-icon slot="start" name="eye-outline"></ion-icon>

              Copy Text
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        {
          this.notes ? <ion-list id="notesList" lines="none">
            {this.notes.map((note) => {
              return (
                <ion-item onClick={() => this.noteDetail(note)}>
                  <ion-thumbnail slot="start">
                    <img src={note.image ? URL.createObjectURL(note.image) : '/assets/icon/icon128.png'}></img>
                  </ion-thumbnail>
                  <ion-label>
                    <h2>{note.title || "No title"}</h2>
                    <p>{note.body}</p>
                  </ion-label>
                </ion-item>
              )
            })}
          </ion-list> : <div id="ctaBlock">
              <h2>Welcome!</h2>

              <p>To get started just point at some text you would like to save, Scribe will read and copy it for you!</p>
            </div>
        }
        <ion-fab id="cameraButton" vertical="bottom" horizontal="end">
          <ion-fab-button onClick={() => this.openCamera()} color="primary">
            <ion-icon name="eye-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>

        <pwa-install></pwa-install>
      </ion-content>
    ];
  }
}
