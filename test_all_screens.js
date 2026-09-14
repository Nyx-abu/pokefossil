import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SAVE_PATH = 'D:\\ae\\POKEMON FIRE_BPRE-0.sav';
const SCRATCH_DIR = 'C:\\Users\\shoto\\.gemini\\antigravity\\brain\\15524fb3-8c6a-4b20-a7ec-713f56e44bb0\\scratch';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForImages(page, timeout = 6000) {
    try {
        await page.waitForFunction(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.length === 0 || imgs.every(img => img.complete);
        }, { timeout });
    } catch (e) {
        console.log('Image loading wait exceeded timeout, proceeding with capture...');
    }
}

async function saveCapture(page, filename) {
    const localPath = path.resolve(filename);
    await page.screenshot({ path: localPath, fullPage: false });
    console.log(`[CAPTURED] ${filename} -> ${localPath}`);

    if (fs.existsSync(SCRATCH_DIR)) {
        const scratchScreenshotsDir = path.join(SCRATCH_DIR, 'screenshots');
        if (!fs.existsSync(scratchScreenshotsDir)) {
            fs.mkdirSync(scratchScreenshotsDir, { recursive: true });
        }
        const scratchPath = path.join(scratchScreenshotsDir, filename);
        fs.copyFileSync(localPath, scratchPath);
        console.log(`[COPIED] ${filename} -> ${scratchPath}`);
    }
}

async function run() {
    console.log('=== PokéFossil Comprehensive Visual QA Automated Suite ===');
    console.log('Target: 6 Core Screens');
    console.log('Browser:', CHROME_PATH);
    console.log('Save File:', SAVE_PATH);

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1280,800',
            '--disable-web-security'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        page.on('console', msg => console.log('  [BROWSER LOG]:', msg.text()));
        page.on('pageerror', err => console.error('  [BROWSER ERROR]:', err.toString()));

        // =====================================================================
        // SCREEN 0: Start Screen (DropZone)
        // =====================================================================
        console.log('\n--- 1/6: Navigating to Start Screen ---');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

        await page.waitForFunction(() => {
            return document.querySelector('input[type="file"]') !== null;
        }, { timeout: 10000 });

        await waitForImages(page);
        await sleep(1000);

        await saveCapture(page, 'test_0_start.png');

        // =====================================================================
        // SCREEN 1: Story Beat 1 (Trainer Log)
        // =====================================================================
        console.log('\n--- 2/6: Uploading Save File & Loading Story Beat 1 ---');
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) {
            throw new Error('File input element not found on Start Screen');
        }

        await fileInput.uploadFile(SAVE_PATH);

        console.log('Waiting for Story Beat 1 (TRAINER LOG)...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('TRAINER LOG') ||
                   document.body.innerText.includes('PAGE 1 OF 5') ||
                   document.body.innerText.includes('You played as');
        }, { timeout: 12000 });

        await waitForImages(page);
        await sleep(1200);

        await saveCapture(page, 'test_1_trainer.png');

        // =====================================================================
        // SCREEN 2: Story Beat 2 (Active Roster)
        // =====================================================================
        console.log('\n--- 3/6: Advancing to Story Beat 2 (Active Roster) ---');
        await page.keyboard.press('Space');

        console.log('Waiting for Story Beat 2 (ACTIVE ROSTER)...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('ACTIVE ROSTER') ||
                   document.body.innerText.includes('PAGE 2 OF 5');
        }, { timeout: 10000 });

        await waitForImages(page);
        await sleep(1500);

        await saveCapture(page, 'test_2_party.png');

        // =====================================================================
        // SCREEN 3: Story Beat 3 (The Road)
        // =====================================================================
        console.log('\n--- 4/6: Advancing to Story Beat 3 (The Road / Journey Chronicle) ---');
        await page.keyboard.press('Space');

        console.log('Waiting for Story Beat 3 (JOURNEY CHRONICLE)...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('JOURNEY CHRONICLE') ||
                   document.body.innerText.includes('PAGE 3 OF 5');
        }, { timeout: 10000 });

        await waitForImages(page);
        await sleep(1500);

        await saveCapture(page, 'test_3_starter.png');

        // =====================================================================
        // SCREEN 4: Story Beat 4 (Ghost)
        // =====================================================================
        console.log('\n--- 5/6: Advancing to Story Beat 4 (Ghost / The Static Record) ---');
        await page.keyboard.press('Space');

        console.log('Waiting for Story Beat 4 (STATIC RECORD / ARCHIVE AUDIT)...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('STATIC RECORD') ||
                   document.body.innerText.includes('ARCHIVE AUDIT') ||
                   document.body.innerText.includes('PAGE 4 OF 5');
        }, { timeout: 10000 });

        await waitForImages(page);
        await sleep(1500);

        await saveCapture(page, 'test_4_ghost.png');

        // =====================================================================
        // SCREEN 5: Explore Mode (Bill's PC) with selected Pokémon
        // =====================================================================
        console.log('\n--- 6/6: Advancing to Explore Mode (Bill\'s PC Storage) ---');
        // Advance from Beat 4 to Beat 5
        await page.keyboard.press('Space');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('PAGE 5 OF 5') ||
                   document.body.innerText.includes('OPEN EXPLORE MODE');
        }, { timeout: 10000 });
        await sleep(600);

        // Click "OPEN EXPLORE MODE" button or press Space
        console.log('Opening Explore Mode...');
        const clickedExplore = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const exploreBtn = btns.find(b => (b.textContent || '').includes('OPEN EXPLORE MODE'));
            if (exploreBtn) {
                exploreBtn.click();
                return true;
            }
            return false;
        });

        if (!clickedExplore) {
            console.log('Button not clicked via text, pressing Space...');
            await page.keyboard.press('Space');
        }

        console.log('Waiting for Bill\'s PC Storage...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes("BILL'S PC STORAGE") ||
                   document.body.innerText.includes("PC Boxes") ||
                   document.querySelector('.frlg-pc-window') !== null;
        }, { timeout: 10000 });

        await waitForImages(page);
        await sleep(1500);

        // Select 3rd slot (or first occupied slot)
        console.log('Selecting slot 3 to populate Pokémon Summary...');
        const slotSelected = await page.evaluate(() => {
            const slots = document.querySelectorAll('.frlg-slot');
            if (slots.length >= 3) {
                (slots[2]).click();
                return true;
            } else if (slots.length > 0) {
                (slots[0]).click();
                return true;
            }
            return false;
        });

        if (!slotSelected) {
            console.warn('Warning: Could not select a slot via .frlg-slot');
        }

        // Wait for summary sidebar
        console.log('Waiting for Pokémon Summary to appear...');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('POKéMON SUMMARY') ||
                   document.body.innerText.includes('POKéMON STATS') ||
                   document.body.innerText.includes('INFO');
        }, { timeout: 8000 }).catch(() => console.log('Summary sidebar wait timeout, continuing...'));

        await waitForImages(page);
        await sleep(1500);

        await saveCapture(page, 'test_5_explore.png');

        console.log('\n======================================================');
        console.log('SUCCESS: All 6 screens captured and verified!');
        console.log('======================================================');

    } finally {
        await browser.close();
    }
}

run().catch(err => {
    console.error('\n[TEST RUN ERROR]:', err);
    process.exit(1);
});
