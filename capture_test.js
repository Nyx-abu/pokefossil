import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SAV_PATH = 'D:\\ae\\POKEMON FIRE_BPRE-0.sav';
const ARTIFACT_DIR = 'C:\\Users\\shoto\\.gemini\\antigravity\\brain\\211cb5b8-aaf3-456f-89ae-abd4a0544a01';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Listen to console messages and errors from page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    console.log('Finding file input...');
    const fileInput = await page.waitForSelector('input[type="file"]');
    if (!fileInput) {
        throw new Error('File input not found!');
    }

    console.log('Uploading save file:', SAV_PATH);
    await fileInput.uploadFile(SAV_PATH);

    // Wait for Beat 1 to appear
    console.log('Waiting for Beat 1...');
    // Beat 1 contains text like "hours," or "You played as"
    await page.waitForFunction(() => {
        return document.body.innerText.includes('You played as') || document.body.innerText.includes('hours');
    }, { timeout: 10000 });

    // Wait for animations and images (like showdown sprite) to settle
    await sleep(2000);

    const beat1Path = path.resolve('beat1_improved.png');
    await page.screenshot({ path: beat1Path });
    console.log('Beat 1 screenshot saved to:', beat1Path);

    // Copy to artifact dir as well
    if (fs.existsSync(ARTIFACT_DIR)) {
        fs.copyFileSync(beat1Path, path.join(ARTIFACT_DIR, 'beat1_improved.png'));
    }

    // Advance to Beat 2: press Space
    console.log('Pressing Space to advance to Beat 2...');
    await page.keyboard.press('Space');

    // Wait for Beat 2 text: "This is who was with you at the end."
    await page.waitForFunction(() => {
        return document.body.innerText.includes('This is who was with you at the end');
    }, { timeout: 10000 });

    // Wait for sprite images to load and float animations
    await sleep(2000);

    const beat2Path = path.resolve('beat2_improved.png');
    await page.screenshot({ path: beat2Path });
    console.log('Beat 2 screenshot saved to:', beat2Path);

    if (fs.existsSync(ARTIFACT_DIR)) {
        fs.copyFileSync(beat2Path, path.join(ARTIFACT_DIR, 'beat2_improved.png'));
    }

    // Keep pressing space until we see "Look through the file yourself" button
    console.log('Advancing through remaining beats to find button...');
    let foundButton = false;
    for (let i = 0; i < 10; i++) {
        const button = await page.$('xpath///button[contains(., "Look through the file yourself")]');
        if (button) {
            console.log('Found "Look through the file yourself" button!');
            foundButton = true;
            await sleep(500);
            await button.click();
            break;
        }
        // Also check with standard text evaluation
        const hasText = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const b = btns.find(el => el.textContent && el.textContent.includes('Look through the file yourself'));
            if (b) {
                b.click();
                return true;
            }
            return false;
        });
        if (hasText) {
            console.log('Found and clicked "Look through the file yourself" button via evaluate!');
            foundButton = true;
            break;
        }

        console.log(`Pressing Space (attempt ${i + 1})...`);
        await page.keyboard.press('Space');
        await sleep(800);
    }

    if (!foundButton) {
        throw new Error('Could not find "Look through the file yourself" button after pressing space.');
    }

    // Wait for Explore mode (PC Boxes)
    console.log('Waiting for Explore mode...');
    await page.waitForFunction(() => {
        return document.body.innerText.includes('PC STORAGE') || document.body.innerText.includes('BOX 1');
    }, { timeout: 10000 });

    await sleep(2000);

    const explorePath = path.resolve('explore_improved.png');
    await page.screenshot({ path: explorePath });
    console.log('Explore screenshot saved to:', explorePath);

    if (fs.existsSync(ARTIFACT_DIR)) {
        fs.copyFileSync(explorePath, path.join(ARTIFACT_DIR, 'explore_improved.png'));
    }

    await browser.close();
    console.log('All screenshots captured successfully!');
}

run().catch(err => {
    console.error('Execution failed:', err);
    process.exit(1);
});
