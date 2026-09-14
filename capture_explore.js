import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SAV_PATH = 'D:\\ae\\POKEMON FIRE_BPRE-0.sav';
const ARTIFACT_DIR = 'C:\\Users\\shoto\\.gemini\\antigravity\\brain\\88b63d02-9087-41c3-841b-a5d916f0d45d';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        defaultViewport: { width: 1440, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
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
    await page.waitForFunction(() => {
        return document.body.innerText.includes('You played as') || 
               document.body.innerText.includes('hours') ||
               document.body.innerText.includes('TRAINER:');
    }, { timeout: 10000 });

    await sleep(1500);

    // Advance through beats by pressing Space until we see the explore button or reach explore mode
    console.log('Advancing through story beats...');
    let foundButton = false;
    for (let i = 0; i < 15; i++) {
        // Check if we are already in Explore mode
        const inExplore = await page.evaluate(() => {
            return document.body.innerText.includes("BILL'S PC STORAGE") || 
                   document.body.innerText.includes('PC STORAGE') || 
                   document.body.innerText.includes('BOX 1');
        });
        if (inExplore) {
            console.log('Already in Explore mode!');
            foundButton = true;
            break;
        }

        const hasButton = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const b = btns.find(el => {
                const text = (el.textContent || '').toUpperCase();
                return text.includes('LOOK THROUGH') || 
                       text.includes('OPEN EXPLORE MODE') ||
                       text.includes('EXPLORE MODE');
            });
            if (b) {
                b.scrollIntoView();
                b.click();
                return true;
            }
            return false;
        });

        if (hasButton) {
            console.log('Found and clicked explore button!');
            foundButton = true;
            break;
        }

        console.log(`Pressing Space (step ${i + 1})...`);
        await page.keyboard.press('Space');
        await sleep(1000);
    }

    if (!foundButton) {
        throw new Error('Could not advance to Explore mode.');
    }

    // Wait for Explore mode (PC Boxes)
    console.log('Waiting for Explore mode...');
    await page.waitForFunction(() => {
        return document.body.innerText.includes("BILL'S PC STORAGE") || 
               document.body.innerText.includes('PC STORAGE') || 
               document.body.innerText.includes('BOX 1');
    }, { timeout: 10000 });

    await sleep(1500);

    // Click on the 3rd slot in the box to select a pokemon (so the sidebar populates)
    console.log('Selecting the 3rd slot in the box...');
    const slotSelected = await page.evaluate(() => {
        // Try looking for .frlg-slot buttons first
        const slots = document.querySelectorAll('.frlg-slot');
        if (slots.length >= 3) {
            console.log('Found .frlg-slot elements:', slots.length);
            slots[2].click(); // 3rd slot is index 2
            return true;
        }
        // Fallback: look for buttons inside the box grid
        const allButtons = Array.from(document.querySelectorAll('button'));
        const boxSlots = allButtons.filter(b => b.title && b.title.includes('Lv.'));
        if (boxSlots.length >= 3) {
            console.log('Found slot buttons with title:', boxSlots.length);
            boxSlots[2].click();
            return true;
        }
        return false;
    });

    console.log('Slot selected result:', slotSelected);
    if (!slotSelected) {
        throw new Error('Failed to select the 3rd slot!');
    }

    // Wait for sidebar / summary to populate and sprites to load
    console.log('Waiting for summary sidebar...');
    await page.waitForFunction(() => {
        return document.body.innerText.includes('POKéMON SUMMARY') || 
               document.body.innerText.includes('POKéMON STATS') ||
               document.body.innerText.includes('INFO');
    }, { timeout: 5000 });

    await sleep(2000);

    const screenshotPath = path.resolve('explore_bigger.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved to:', screenshotPath);

    if (fs.existsSync(ARTIFACT_DIR)) {
        const artifactPath = path.join(ARTIFACT_DIR, 'explore_bigger.png');
        fs.copyFileSync(screenshotPath, artifactPath);
        console.log('Copied to artifact dir:', artifactPath);
    }

    await browser.close();
    console.log('Done!');
}

run().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
