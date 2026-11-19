# Generates English and Arabic letter clips and the 0–9 number clips with Google Translate's text-to-speech
# voice (female), trims silence and evens out the volume with ffmpeg.
#   python3 scripts/make_letter_audio_google.py            # missing clips only
#   python3 scripts/make_letter_audio_google.py --force    # regenerate all
# Needs: ffmpeg, network access to translate.googleapis.com.
import subprocess, sys, tempfile, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'audio'
FORCE = '--force' in sys.argv

ENGLISH = [('a', 'Apple'), ('b', 'Ball'), ('c', 'Cat'), ('d', 'Dog'), ('e', 'Elephant'), ('f', 'Fish'),
           ('g', 'Grapes'), ('h', 'Hat'), ('i', 'Ice cream'), ('j', 'Juice'), ('k', 'Kite'), ('l', 'Lion'),
           ('m', 'Moon'), ('n', 'Nest'), ('o', 'Orange'), ('p', 'Pig'), ('q', 'Queen'), ('r', 'Rabbit'),
           ('s', 'Sun'), ('t', 'Tiger'), ('u', 'Umbrella'), ('v', 'Violin'), ('w', 'Whale'),
           ('x', 'Xylophone'), ('y', 'Yo-yo'), ('z', 'Zebra')]

ARABIC = [('1-alif', 'ألف', 'أرنب'), ('2-baa', 'باء', 'بطة'), ('3-taa', 'تاء', 'تفاحة'), ('4-thaa', 'ثاء', 'ثعلب'),
          ('5-jeem', 'جيم', 'جمل'), ('6-haa', 'حاء', 'حصان'), ('7-khaa', 'خاء', 'خروف'), ('8-daal', 'دال', 'دب'),
          ('9-dhaal', 'ذال', 'ذرة'), ('10-raa', 'راء', 'ريشة'), ('11-zaay', 'زاي', 'زرافة'), ('12-seen', 'سين', 'سمكة'),
          ('13-sheen', 'شين', 'شمس'), ('14-saad', 'صاد', 'صقر'), ('15-daad', 'ضاد', 'ضفدع'), ('16-taa', 'طاء', 'طائرة'),
          ('17-dhaa', 'ظاء', 'ظرف'), ('18-ayn', 'عين', 'عين'), ('19-ghayn', 'غين', 'غيمة'), ('20-faa', 'فاء', 'فيل'),
          ('21-qaaf', 'قاف', 'قمر'), ('22-kaaf', 'كاف', 'كلب'), ('23-laam', 'لام', 'ليمون'), ('24-meem', 'ميم', 'موز'),
          ('25-noon', 'نون', 'نحلة'), ('26-haa', 'هاء', 'هدية'), ('27-waaw', 'واو', 'وردة'), ('28-yaa', 'ياء', 'يد')]


def tts(text, lang, out):
    url = 'https://translate.googleapis.com/translate_tts?' + urllib.parse.urlencode(
        {'client': 'gtx', 'ie': 'UTF-8', 'tl': lang, 'ttsspeed': '0.8', 'q': text})
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with tempfile.NamedTemporaryFile(suffix='.mp3') as raw:
        raw.write(urllib.request.urlopen(req, timeout=20).read())
        raw.flush()
        # trim leading/trailing silence, normalise loudness, short tail
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw.name, '-af',
                        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                        'loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.1',
                        '-ar', '24000', '-ac', '1', '-b:a', '64k', str(out)], check=True)


def run(lang, items):
    folder = ROOT / lang
    folder.mkdir(parents=True, exist_ok=True)
    for item_id, text in items:
        out = folder / f'{item_id}.mp3'
        if out.exists() and not FORCE:
            continue
        tts(text, lang, out)
        print(f'  {out.relative_to(ROOT.parent.parent.parent)}  «{text}»')
        time.sleep(0.4)  # be gentle with the service


run('en', [(i, f'{i.upper()}. {i.upper()} is for {w}.') for i, w in ENGLISH])
run('ar', [(i, f'{name}. {word}') for i, name, word in ARABIC])


NUMBERS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

def run_numbers():
    folder = ROOT / 'num'
    folder.mkdir(parents=True, exist_ok=True)
    for n, name in enumerate(NUMBERS):
        out = folder / f'{n}.mp3'
        if out.exists() and not FORCE:
            continue
        word = 'No apples' if n == 0 else f"{name} apple{'' if n == 1 else 's'}"
        tts(f'{name}. {word}.', 'en', out)
        print(f'  {out.relative_to(ROOT.parent.parent.parent)}  «{name}. {word}.»')
        time.sleep(0.4)


run_numbers()
