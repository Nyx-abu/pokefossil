import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SAVE_PATH = 'D:\\ae\\POKEMON FIRE_BPRE-0.sav';

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

        console.log('Finding file input...');
        const fileInput = await page.waitForSelector('input[type="file"]');
        if (!fileInput) {
            throw new Error('Could not find input[type="file"]');
        }

        console.log('Uploading save file...');
        await fileInput.uploadFile(SAVE_PATH);

        console.log('Waiting for Beat 1 (TRAINER LOG)...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('TRAINER LOG') || document.body.innerText.includes('PAGE 1 OF 5');
        }, { timeout: 10000 });

        await new Promise(r => setTimeout(r, 1000));

        console.log('Pressing Space once to advance to Beat 2...');
        await page.keyboard.press('Space');

        console.log('Waiting for Beat 2 (ACTIVE ROSTER)...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('ACTIVE ROSTER') || document.body.innerText.includes('PAGE 2 OF 5');
        }, { timeout: 10000 });

        // Wait for sprites and transitions to complete
        console.log('Waiting for images and transitions to settle...');
        await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.length > 0 && images.every(img => img.complete);
        }, { timeout: 5000 }).catch(() => console.log('Images still loading or timeout reached, continuing...'));

        await new Promise(r => setTimeout(r, 2000));

        console.log('Taking screenshot beat2_bigger.png...');
        await page.screenshot({ path: 'beat2_bigger.png' });

        console.log('Screenshot successfully saved as beat2_bigger.png!');
    } finally {
        await browser.close();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
