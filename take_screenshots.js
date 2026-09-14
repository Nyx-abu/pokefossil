import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

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

        console.log('Taking start screen screenshot: start_frlg.png...');
        await page.screenshot({ path: 'start_frlg.png' });

        console.log('Finding file input...');
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) {
            throw new Error('Could not find input[type="file"]');
        }

        console.log('Uploading save file...');
        await fileInput.uploadFile(SAVE_PATH);

        console.log('Waiting for Beat 1 to render...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('hours') && document.body.innerText.includes('You played as');
        }, { timeout: 5000 });
        // Let animations settle
        await new Promise(r => setTimeout(r, 1200));

        console.log('Taking beat 1 screenshot: beat1_frlg.png...');
        await page.screenshot({ path: 'beat1_frlg.png' });

        console.log('Advancing through story beats...');
        // Press space or click repeatedly to go through beats 2, 3, 4, 5, and into Explore mode
        for (let i = 1; i <= 8; i++) {
            console.log(`Pressing Space (step ${i})...`);
            await page.keyboard.press('Space');
            await new Promise(r => setTimeout(r, 800));
            // Check if we reached Explore mode (PC Boxes)
            const isExplore = await page.evaluate(() => {
                return document.body.innerText.includes('PC Boxes') && !document.body.innerText.includes('skip to explore');
            });
            if (isExplore) {
                console.log(`Entered Explore Mode at step ${i}!`);
                break;
            }
        }

        // Wait for Explore Mode / PC Boxes to render completely
        await new Promise(r => setTimeout(r, 1500));

        console.log('Taking explore mode screenshot: explore_frlg.png...');
        await page.screenshot({ path: 'explore_frlg.png' });

        console.log('Done capturing screenshots!');
    } finally {
        await browser.close();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
