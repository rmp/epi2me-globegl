import { Component, Prop, h } from '@stencil/core';

const DIV = 1000;
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
const sortOrder = {
  windows: 0,
  macos: 1,
  linux: 2,
  all: 3,
  other: 4
};

@Component({
  tag: 'epi2me-download',
  styleUrl: 'epi2me-download.css',
  shadow: true
})
export class EPI2MEDownload {
  @Prop() product: string = "agent";
  @Prop() platform: string;
  @Prop() root: string = "https://cdn.oxfordnanoportal.com/software/metrichor-agent";
  @Prop() downloads: string; // haha

  static niceSize ( size, unitIndex ) {
    if(unitIndex === undefined) {
      unitIndex = 0;
    }

    if ( size > DIV ) {
        size /= DIV;
        unitIndex += 1;
        if ( unitIndex >= UNITS.length ) {
          return '???';
        }
        return EPI2MEDownload.niceSize( size, unitIndex );
    }

    return `${size.toFixed(2)}${UNITS[unitIndex]}`;
  }

  render() {
    const downloads = JSON.parse(this.downloads || '[]');
    const platforms = downloads.map(item => item.platform).filter((value, index, self) => self.indexOf(value) === index);
    const products = downloads.map(item => item.product).filter((value, index, self) => self.indexOf(value) === index);

    const preferredDownloads = downloads
      .filter(download => { return download.platform === this.platform && download.product === this.product; })
      .sort((a, b) => { return b.epoch - a.epoch });
    const preferred = preferredDownloads.length ? preferredDownloads[0] : null;


    return (
      <div>
        <header>
          <h1>EPI2ME Downloads</h1>
        </header>

        <main>
          {preferred ? <section class="preferred">
            <h2>Desktop Agent for {this.platform.charAt(0).toUpperCase() + this.platform.slice(1)}</h2>
            <a href={preferred.url}><button>Download v{preferred.version}</button></a><br/>
            <span class="size">({preferred.size})</span>
          </section> : ''}

          <div class="allDownloads">{
          products.sort().map(product => {
            return (
              <section class="product">
                <h2>{product.charAt(0).toUpperCase() + product.slice(1)}</h2>
                {platforms.sort((a, b) => { return sortOrder[a] - sortOrder[b]; }).map(platform => {
                  const platformDownloads = downloads
                    .filter(download => { return download.platform === platform && download.product === product; })
                    .sort((a, b) => { return b.epoch - a.epoch });

                  return platformDownloads.length ? (<section class="platform">
                    <h3>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
                    {
                    platformDownloads
                      .map(item =>
                        <div class="download"><span class="timestamp">{new Date(1000*item.epoch).toLocaleDateString()}</span> <a href={item.url}>{item.filename}</a> <span class="size">({item.size})</span></div>
                      )
                    }
                  </section>) : '';
                  })}
              </section>);
            })
          }</div>
        </main>
      </div>
    );
  }

  componentWillLoad() {
    this.platform = 'unknown';
    if (navigator.appVersion.indexOf("Win") !== -1) this.platform = "windows";
    if (navigator.appVersion.indexOf("Mac") !== -1) this.platform = "macos";
    if (navigator.appVersion.indexOf("Linux") !== -1) this.platform = "linux";


    fetch(this.root + "/index")
    .then(stream => {
      return stream.text();
    })
    .then(text => {
      const lines = text.split(/[\r\n]/);
      const data = [];

      lines.forEach(line => {
        if(line.match(/^\s*$/)) {
          return;
        }

        const parts = line.split(",");
        const extensionMatch = parts[2].match(/.(exe|msi|deb|dmg|pkg|gz$)/);
        const extension = extensionMatch ? extensionMatch[1] : 'other';
        const platformMatch = parts[2].match(/(linux|win|macos)/);
        const platform = platformMatch ? platformMatch[1] : 'other';
        const productMatch = parts[2].match(/(cli|agent)/i);
        const product = productMatch ? productMatch[1].toLowerCase() : 'other';
        const version = parts[2].match(/\-([0-9.-]+)\./)[1];
        const entry = {
          epoch: parts[0],
          bytes: parts[1],
          size: EPI2MEDownload.niceSize(parts[1], 0),
          filename: parts[2],
          url: `${this.root}/${parts[2]}`,
          product,
          version,
          platform: {
            exe: 'windows',
            msi: 'windows',
            deb: 'linux',
            dmg: 'macos',
            pkg: 'macos',
            gz: 'all'
          }[extension] || {
            win: 'windows',
            macos: 'macos',
            linux: 'linux',
          }[platform] || 'other',
        };
        data.push(entry);
      });

      this.downloads = JSON.stringify(data);
    });
  }
}
