const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(`
        <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">
            <defs>
                <filter id="cartoon-boil">
                    <feTurbulence id="boil-noise" type="fractalNoise" baseFrequency="0.1" numOctaves="1" seed="1" result="noise" />
                    <feDisplacementMap id="boil-disp" in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </defs>
        </svg>
        <canvas id="c1" width="100" height="100"></canvas>
        <canvas id="c2" width="100" height="100"></canvas>
        <script>
            const c1 = document.getElementById('c1');
            const ctx1 = c1.getContext('2d');
            ctx1.fillStyle = 'red';
            ctx1.fillRect(20, 20, 60, 60);

            const c2 = document.getElementById('c2');
            const ctx2 = c2.getContext('2d');
            ctx2.filter = 'url(#cartoon-boil)';
            ctx2.drawImage(c1, 0, 0);
            
            // Check if pixels are displaced
            const data = ctx2.getImageData(0,0,100,100).data;
            let hasRed = false;
            for(let i=0; i<data.length; i+=4) {
                if(data[i] > 100) hasRed = true;
            }
            window.hasRed = hasRed;
        </script>
    `);
    const hasRed = await page.evaluate(() => window.hasRed);
    console.log("Filter applied:", hasRed);
    await browser.close();
})();
