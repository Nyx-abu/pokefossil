const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const artifactDir = 'C:\\Users\\shoto\\.gemini\\antigravity\\brain\\cbe2a76d-4a5c-4858-bf76-ac942a89022e';

  console.log('Launching browser with:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err));

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    console.log('Waiting for file input...');
    const fileInput = await page.waitForSelector('input[type="file"]');
    
    const savPath = 'D:\\ae\\POKEMON FIRE_BPRE-0.sav';
    console.log('Uploading file:', savPath);
    await fileInput.uploadFile(savPath);

    console.log('Waiting for Beat 1...');
    await page.waitForFunction(() => {
      return document.body.innerText.includes('hours') || 
             document.body.innerText.includes('You played as');
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1500));

    // Beat 1 screenshot
    const beat1Local = path.join(__dirname, 'beat1.png');
    const beat1Artifact = path.join(artifactDir, 'beat1.png');
    await page.screenshot({ path: beat1Local });
    fs.copyFileSync(beat1Local, beat1Artifact);
    console.log('Saved Beat 1:', beat1Local);

    // Advance to Beat 2
    console.log('Advancing to Beat 2...');
    await page.keyboard.press('Space');
    await page.waitForFunction(() => {
      return document.body.innerText.includes('This is who was with you at the end');
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));

    // Beat 2 screenshot
    const beat2Local = path.join(__dirname, 'beat2.png');
    const beat2Artifact = path.join(artifactDir, 'beat2.png');
    await page.screenshot({ path: beat2Local });
    fs.copyFileSync(beat2Local, beat2Artifact);
    console.log('Saved Beat 2:', beat2Local);

    // Advance to Beat 3
    console.log('Advancing to Beat 3...');
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 1500));
    const beat3Local = path.join(__dirname, 'beat3.png');
    const beat3Artifact = path.join(artifactDir, 'beat3.png');
    await page.screenshot({ path: beat3Local });
    fs.copyFileSync(beat3Local, beat3Artifact);
    console.log('Saved Beat 3:', beat3Local);

    // Advance to Beat 4
    console.log('Advancing to Beat 4...');
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 1500));
    const beat4Local = path.join(__dirname, 'beat4.png');
    const beat4Artifact = path.join(artifactDir, 'beat4.png');
    await page.screenshot({ path: beat4Local });
    fs.copyFileSync(beat4Local, beat4Artifact);
    console.log('Saved Beat 4:', beat4Local);

    // Advance to Beat 5
    console.log('Advancing to Beat 5...');
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 1500));
    const beat5Local = path.join(__dirname, 'beat5.png');
    const beat5Artifact = path.join(artifactDir, 'beat5.png');
    await page.screenshot({ path: beat5Local });
    fs.copyFileSync(beat5Local, beat5Artifact);
    console.log('Saved Beat 5:', beat5Local);

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Run failed:', err);
  process.exit(1);
});
