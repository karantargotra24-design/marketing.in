const { chromium } = require('playwright');
const { spawn } = require('child_process');
const [file, outDir, ...ids] = process.argv.slice(2);
const FPS = 30;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  for (const id of ids) {
    const dur = await p.evaluate(id => setup(id), id);
    await p.evaluate(() => document.fonts.ready);
    const frames = Math.round(dur * FPS);
    const ff = spawn('ffmpeg', ['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
      '-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-shortest',
      '-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium','-profile:v','high','-movflags','+faststart',
      '-c:a','aac','-b:a','128k', `${outDir}/W44-${id}.mp4`], { stdio: ['pipe','inherit','inherit'] });
    for (let f = 0; f < frames; f++) {
      await p.evaluate(t => render(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(id, frames, 'frames', dur.toFixed(1)+'s');
  }
  await b.close();
})();
