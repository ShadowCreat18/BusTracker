import { Component } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
/**
 * Componente raíz de la aplicación.
 * Define el contenedor principal donde se irán cargando las distintas páginas.
 */
export class AppComponent {
  constructor(private platform: Platform, private navCtrl: NavController) {
    this.platform.ready().then(() => {
      // Forzar que nativamente siempre inicie en welcome y no cargue desde caché del WebView
      // Esto asegura que cada vez que se abre la app, se muestre la pantalla de bienvenida.
      this.navCtrl.navigateRoot('/welcome');
    });
  }
}
