import { Component, Host, Prop, h } from '@stencil/core';
import Globe from 'globe.gl';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
//import { scaleSqrt } from 'd3-scale';
//import { csvParse } from 'd3-dsv';

@Component({
  tag: 'epi2me-globegl',
  styleUrl: 'epi2me-globegl.css'
})

export class EPI2MEGlobeGL {
  @Prop() dataURI = 'data.json';

  controller: any;
  data: any;
  el: HTMLDivElement;
  infoPanel: HTMLDivElement;
  infoPanelTimer: number;

  render() {
    return (
      <Host><div><div ref={el => { this.el = el as HTMLDivElement } }></div><div class="infoPanel" ref={el => { this.infoPanel = el as HTMLDivElement } }></div></div></Host>
    );
  }

  componentWillLoad() {
    const promises = [];

    if (this.dataURI) {
      promises.push(fetch(this.dataURI)
        .then(response => response.json())
        .then(data => {
          this.data = data;
        }));
    }

    return Promise.all(promises);
  }

  componentDidLoad() {
    const maxCount = 16;
    // const weightColor = interpolateYlOrRd;
    const weightColor = scaleSequential(interpolateYlOrRd)
      .domain([0, maxCount]); // max needs updating with data
    // Create Gio.controller
    this.controller = Globe()

    this.controller(this.el)
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
      .hexBinPointWeight('cnt')
      .hexAltitude(d => d.sumWeight / maxCount*2) // fixed estimation of max data
      .hexBinResolution(4)
      .hexTopColor(d => weightColor(d.sumWeight))
      .hexSideColor(d => weightColor(d.sumWeight))
      //.hexBinMerge(true)
      .onHexHover(hex => {
        clearTimeout(this.infoPanelTimer);
        if(!hex) {
          this.infoPanelTimer = setTimeout(() => {
            this.infoPanel.innerHTML = '';
            this.infoPanel.style.display='none';
          }, 10000);
          return;
        }

        this.infoPanel.style.display='block';
        this.infoPanel.innerHTML = `<dl>${hex.points[0].seq.map(seq => `<dt>${seq.acc}</dt><dd>${seq.strain}</dd>`).join('')}</dl>`;
       });
 //     .enablePointerInteraction(false); // performance improvement

      this.controller
        .hexBinPointsData(this.data);
/*        .labelsData(this.data)
        .labelLabel('loc')
        .labelLat(d => d.lat)
        .labelLng(d => d.lng)
        .labelText(d => d.acc.join("\n"));
*/
        // Add auto-rotation
    this.controller.controls().autoRotate = true;
    this.controller.controls().autoRotateSpeed = 0.06;
  }
}
