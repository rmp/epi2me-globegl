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
  config: any;
  el: HTMLDivElement;

  render() {
    return (
      <Host><div ref={el => { this.el = el as HTMLDivElement } }></div></Host>
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
    // const weightColor = interpolateYlOrRd;
    const weightColor = scaleSequential(interpolateYlOrRd)
      .domain([0, 8]); // max needs updating with data
    // Create Gio.controller
    this.controller = Globe()

    this.controller(this.el)
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
      .hexBinPointWeight('cnt')
      .hexAltitude(d => d.sumWeight / 10) // fixed estimation of max data
      .hexBinResolution(4)
      .hexTopColor(d => weightColor(d.sumWeight))
      .hexSideColor(d => weightColor(d.sumWeight))
      .hexBinMerge(true)
      .enablePointerInteraction(false); // performance improvement


      this.controller.hexBinPointsData(this.data);

  // Add auto-rotation
  this.controller.controls().autoRotate = true;
  this.controller.controls().autoRotateSpeed = 0.1;


    // Add data
//    this.controller.addData( this.data );

    // Initialize and render the globe
//    this.controller.init();
//    this.controller.setAutoRotation( true, 0.2 );
  }
}
