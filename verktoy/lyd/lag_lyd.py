"""Lager mp3-filer for filmenes opplesing.

Leser moduler/filmer/lyd/manifest.json (laget av samle.js) og lager én mp3 per tekst.
Motor:
  * Azure Speech (nb-NO-PernilleNeural) hvis AZURE_SPEECH_KEY og AZURE_SPEECH_REGION er satt.
    Gir den mest naturlige stemmen. Gratisnivået dekker 500 000 tegn i måneden.
  * Ellers Piper (åpen kildekode) med norsk stemme. Krever ingen nøkkel.
Bytter man motor, lages alle filene på nytt.
"""
import glob, json, os, subprocess, sys, tempfile, urllib.request
from xml.sax.saxutils import escape

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
KEY, REGION = os.environ.get('AZURE_SPEECH_KEY'), os.environ.get('AZURE_SPEECH_REGION')
AZ_VOICE = os.environ.get('AZURE_SPEECH_VOICE', 'nb-NO-PernilleNeural')
PIPER_MODEL = os.environ.get('PIPER_MODEL', '')

if KEY and REGION:
    MOTOR, STEMME = 'azure:' + AZ_VOICE, 'Pernille (naturlig stemme)' if 'Pernille' in AZ_VOICE else AZ_VOICE
else:
    MOTOR, STEMME = 'piper:' + os.path.basename(PIPER_MODEL), 'Innspilt stemme'


def azure(text, out):
    ssml = ('<speak version="1.0" xml:lang="nb-NO"><voice name="%s">'
            '<prosody rate="-4%%">%s</prosody></voice></speak>') % (AZ_VOICE, escape(text))
    req = urllib.request.Request(
        'https://%s.tts.speech.microsoft.com/cognitiveservices/v1' % REGION, data=ssml.encode('utf-8'),
        headers={'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml',
                 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'mattelekse'})
    with urllib.request.urlopen(req, timeout=60) as r, open(out, 'wb') as f:
        f.write(r.read())


def piper(text, out):
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'a.wav')
        subprocess.run([sys.executable, '-m', 'piper', '-m', PIPER_MODEL, '-f', wav], input=text.encode('utf-8'),
                       check=True, stdout=subprocess.DEVNULL)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', 'apad=pad_dur=0.25',
                        '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '48k', out], check=True)


def main():
    for man in glob.glob(os.path.join(ROOT, 'moduler', 'filmer', '**', 'manifest.json'), recursive=True):
        d = os.path.dirname(man)
        m = json.load(open(man, encoding='utf-8'))
        tekster = m.get('tekster', {})
        alt = m.get('motor') != MOTOR
        lyd = {}
        for k, text in tekster.items():
            out = os.path.join(d, k + '.mp3')
            if alt or not os.path.exists(out):
                print('lager', k, text[:60])
                (azure if MOTOR.startswith('azure') else piper)(text, out)
            lyd[k] = 1
        for f in glob.glob(os.path.join(d, '*.mp3')):
            if os.path.basename(f)[:-4] not in tekster:
                os.remove(f)
        m.update({'motor': MOTOR, 'stemme': STEMME, 'lyd': lyd})
        json.dump(m, open(man, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        open(man, 'a').write('\n')
        print(man, len(lyd), 'lydfiler,', MOTOR)


if __name__ == '__main__':
    main()
