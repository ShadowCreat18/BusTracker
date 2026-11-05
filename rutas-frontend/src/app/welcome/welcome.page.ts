import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule]
})
/**
 * Página de bienvenida de la aplicación.
 * Generalmente se muestra al iniciar la app antes de ir al mapa principal.
 */
export class WelcomePage implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
