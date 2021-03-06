/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface Epi2meGlobegl {
    'dataURI': string;
  }
}

declare global {


  interface HTMLEpi2meGlobeglElement extends Components.Epi2meGlobegl, HTMLStencilElement {}
  var HTMLEpi2meGlobeglElement: {
    prototype: HTMLEpi2meGlobeglElement;
    new (): HTMLEpi2meGlobeglElement;
  };
  interface HTMLElementTagNameMap {
    'epi2me-globegl': HTMLEpi2meGlobeglElement;
  }
}

declare namespace LocalJSX {
  interface Epi2meGlobegl {
    'dataURI'?: string;
  }

  interface IntrinsicElements {
    'epi2me-globegl': Epi2meGlobegl;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      'epi2me-globegl': LocalJSX.Epi2meGlobegl & JSXBase.HTMLAttributes<HTMLEpi2meGlobeglElement>;
    }
  }
}


