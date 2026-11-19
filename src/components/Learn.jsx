import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAlphabet, glyphStyle, fontOf } from '../data/alphabets';
import { playLetter, cheer } from '../lib/speech';
import { sfx } from '../lib/sfx';
import TopBar from './TopBar';
import TraceCanvas from './TraceCanvas';
import Confetti from './Confetti';

// One lesson card per letter: meet the letter → trace it → celebrate → next.
export default function Learn({ langId, startIndex, progress, onComplete, onExit, onQuiz, penScale = 1 }) {
  const a = getAlphabet(langId);
  const [index, setIndex] = useState(startIndex);
  const [stage, setStage] = useState('intro'); // intro | trace | done
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null); // { score, stars } from the last trace
  const letter = a.letters[index];
  const isLast = index === a.letters.length - 1;
  const doneSet = new Set(progress[langId].done);
  const referenceChars = useMemo(() => a.letters.map((l) => l.char), [a]);

  // Say the letter when it is introduced.
  useEffect(() => {
    if (stage === 'intro') {
      const t = setTimeout(() => playLetter(a, letter), 350);
      return () => clearTimeout(t);
    }
  }, [a, letter, stage]);

  const handleTraced = useCallback((res) => {
    setResult(res || null);
    onComplete(langId, letter.id, res?.stars || 0);
    sfx.success();
    setTimeout(cheer, 600); // after the chime
    setTimeout(() => setStage('done'), 350);
  }, [langId, letter.id, onComplete]);

  const goTo = (i) => {
    setIndex(i);
    setStage('intro');
  };

  const style = { '--main': a.theme.main, '--soft': a.theme.soft, '--deep': a.theme.deep, '--fs': a.displayScale, '--gy': a.glyphShift, '--stroke': a.textStroke };

  return (
    <div className="screen learn" style={style}>
      <TopBar onBack={onExit} title={`${a.title} · ${index + 1} / ${a.letters.length}`} theme={a.theme}>
        <button className="icon-btn" aria-label={`Hear the ${a.unit || 'letter'}`} onClick={() => playLetter(a, letter)}>
          🔊
        </button>
      </TopBar>

      <div className="dots" dir={a.dir}>
        {a.letters.map((l, i) => (
          <span
            key={l.id}
            className={`dot ${doneSet.has(l.id) ? 'is-done' : ''} ${i === index ? 'is-current' : ''}`}
          />
        ))}
      </div>

      {stage === 'intro' && (
        <div className="card intro-card pop-in" key={`intro-${letter.id}`}>
          <button className="intro-letter" style={glyphStyle(a, letter)} onClick={() => playLetter(a, letter)}>
            <span className="glyph">{letter.char}</span>
            {letter.lower && <span className="intro-lower">{letter.lower}</span>}
          </button>
          <h2 className="intro-name">{letter.name}</h2>
          {letter.sound && (
            <p className="intro-sound">
              says <b>“{letter.sound}”</b>
            </p>
          )}
          {letter.emoji && (
            <button className="intro-word" onClick={() => playLetter(a, letter)}>
              <span className={`intro-emoji ${[...letter.emoji].length > 3 ? 'is-count' : ''}`}>{letter.emoji}</span>
              <span>
                {letter.word && letter.wordLatin ? (
                  <>
                    <span className="intro-word-native" style={{ fontFamily: a.font }}>
                      {letter.word}
                    </span>
                    <small>
                      {letter.wordLatin} · {letter.meaning}
                    </small>
                  </>
                ) : (
                  <span className="intro-word-native">{letter.word}</span>
                )}
              </span>
            </button>
          )}
          <div className="intro-actions">
            <button className="btn btn-soft" onClick={() => playLetter(a, letter)}>
              🔊 Listen
            </button>
            <button className="btn btn-main btn-big wiggle" onClick={() => setStage('trace')}>
              ✏️ Trace it!
            </button>
          </div>
        </div>
      )}

      {stage !== 'intro' && (
        <div className="card trace-card" key={`trace-${letter.id}-${attempt}`}>
          <TraceCanvas
            char={letter.char}
            font={fontOf(a, letter)}
            thicken={letter.font ? 0 : a.traceThicken || 0}
            outlineScale={a.traceOutline || 1}
            rtl={a.dir === 'rtl'}
            weight={a.traceWeight || 700}
            startNear={letter.startNear}
            guidePaths={letter.guide}
            dotCount={letter.dots || 0}
            penScale={penScale}
            theme={a.theme}
            reference={referenceChars}
            onComplete={handleTraced}
          />
          {stage === 'done' && (
            <div className="done-inline pop-in">
              <Confetti count={36} />
              <p className="done-inline-title">
                ⭐ Amazing! You traced{' '}
                <b style={glyphStyle(a, letter)} className="done-char">
                  <span className="glyph">{letter.char}</span>
                </b>
              </p>
              {result && (
                <div className="trace-marks" aria-label={`${result.stars} of 3 stars: ${result.score}% on the path`}>
                  <span className="trace-stars" aria-hidden="true">
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={n <= result.stars ? 'on' : ''}>★</span>
                    ))}
                  </span>
                  <span className="trace-score">
                    {result.stars === 3 ? 'Right on the path!' : result.stars === 2 ? 'Very close to the path!' : 'Good try! Follow the dashes.'}{' '}
                    <b>{result.score}%</b>
                  </span>
                </div>
              )}
              <div className="done-actions">
                <button
                  className="btn btn-soft"
                  onClick={() => {
                    setAttempt((n) => n + 1);
                    setStage('trace');
                  }}
                >
                  ↺ Try again
                </button>
                {isLast ? (
                  <button className="btn btn-main btn-big" onClick={onQuiz}>
                    🎯 Take the quiz!
                  </button>
                ) : (
                  <button className="btn btn-main btn-big" onClick={() => goTo(index + 1)}>
                    Next {a.unit || 'letter'} →
                  </button>
                )}
              </div>
              {isLast && (
                <button className="link-btn" onClick={onExit}>
                  Back to {a.unit || 'letter'}s
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
