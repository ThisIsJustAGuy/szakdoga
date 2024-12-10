import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  loadStyles() {

    const userStylePath = 'appointy.scss';

    fetch(userStylePath)
      .then(response => {
        if (response.ok && !response.headers.get('content-type')?.includes('text/html')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = userStylePath;
          document.head.appendChild(link);
        } else {
          this.applyDefaultStyle();
        }
      })
      .catch(() => {
        this.applyDefaultStyle();
      });
    this.applyRequiredStyles();
  }

  applyDefaultStyle() {
    const style = document.createElement('style');
    style.textContent = `
    :root {
      --background-color: hsl(0 100% 100%);
      --primary-color: hsl(215, 75%, 40%);
      --secondary-color: hsl(215, 90%, 75%);

      --secondary-text-color: white;
    }
  `;
    document.head.appendChild(style);
  }

  applyRequiredStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .event_container {
      width: 100%;
      z-index: 9;
    }
    .event_container:nth-child(2) {
      width: 75%;
      margin-left: -75%;
    }
    .event_container:nth-child(3) {
      width: 50%;
      margin-left: -50%;
    }
    .event_container:nth-child(4) {
      width: 33%;
      margin-left: -33%;
    }

    .now_container {
      width: 100%;
      z-index: 10;
      height: 2px;
      position: absolute;
    }

    .disallowed_date {
      position: absolute;
      top:0;
      left:0;
      background: repeating-linear-gradient(
          -45deg,
          hsl(360 0% 90% / 0.75),
          hsl(360 0% 90% / 0.75) 10px,
          hsl(360 0% 85% / 0.75) 10px,
          hsl(360 0% 85% / 0.75) 20px
      );
    }
  `;
    document.head.appendChild(style);
  }

}
